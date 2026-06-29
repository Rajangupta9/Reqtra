package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"regexp"
	requestmodel "reqtra/models/requestModel"
	"strings"
	"time"
)

func substituteVariables(input string, vars map[string]string) string {
	if strings.Contains(input, "{{") {
		re := regexp.MustCompile(`\{\{([^\}]+)\}\}`)
		return re.ReplaceAllStringFunc(input, func(m string) string {
			key := strings.Trim(m, "{}")
			if val, ok := vars[key]; ok {
				return val
			}
			return m
		})
	}
	return input
}

func applyEnvironmentSubstitutions(proxyReq *requestmodel.ProxyRequest, vars map[string]string) {
	sub := func(s string) string {
		return substituteVariables(s, vars)
	}

	// URL
	proxyReq.URL = sub(proxyReq.URL)

	// Headers
	for i := range proxyReq.Headers {
		proxyReq.Headers[i].Value = sub(proxyReq.Headers[i].Value)
	}

	// Auth
	switch strings.ToLower(proxyReq.Auth.Type) {
	case "apikey":
		for i := range proxyReq.Auth.APIKey {
			if proxyReq.Auth.APIKey[i].Value != "" {
				proxyReq.Auth.APIKey[i].Value = sub(proxyReq.Auth.APIKey[i].Value)
			}
		}

	case "bearer":
		for i := range proxyReq.Auth.Bearer {
			if proxyReq.Auth.Bearer[i].Value != "" {
				proxyReq.Auth.Bearer[i].Value = sub(proxyReq.Auth.Bearer[i].Value)
			}
		}

	case "basic":
		for i := range proxyReq.Auth.Basic {
			if proxyReq.Auth.Basic[i].Value != "" {
				proxyReq.Auth.Basic[i].Value = sub(proxyReq.Auth.Basic[i].Value)
			}
		}

	case "oauth2":
		for i := range proxyReq.Auth.OAuth2 {
			if proxyReq.Auth.OAuth2[i].Value != "" {
				proxyReq.Auth.OAuth2[i].Value = sub(proxyReq.Auth.OAuth2[i].Value)
			}
		}
	}

	// Body
	switch proxyReq.Body.Mode {
	case "raw":
		proxyReq.Body.Raw = sub(proxyReq.Body.Raw)

	case "formdata":
		for i := range proxyReq.Body.FormData {
			proxyReq.Body.FormData[i].Value = sub(proxyReq.Body.FormData[i].Value)
		}

	case "urlencoded":
		for i := range proxyReq.Body.UrlEncoded {
			proxyReq.Body.UrlEncoded[i].Value = sub(proxyReq.Body.UrlEncoded[i].Value)
		}
	}
}

func ProxyHandler(w http.ResponseWriter, r *http.Request) {
	activeTabId := r.URL.Query().Get("activeTabId")
	envId := r.URL.Query().Get("envId")

	startTime := time.Now()
	response := requestmodel.ProxyResponse{
		TimingInfo: requestmodel.TimingInfo{StartTime: startTime},
	}
	response.ActiveTabId = activeTabId

	var environmentVars map[string]string
	if envId != "" {
		vars, err := GetEnvironmentById(envId)
		if err != nil {
			response.Error = "Environment check failed: " + err.Error()
			sendErrorResponse(w, response, startTime, http.StatusBadRequest)
			return
		}
		environmentVars = vars
	}

	var proxyReq requestmodel.ProxyRequest
	if err := json.NewDecoder(r.Body).Decode(&proxyReq); err != nil {
		response.Error = "Invalid JSON: " + err.Error()
		sendErrorResponse(w, response, startTime, http.StatusBadRequest)
		return
	}

	if environmentVars != nil {
		applyEnvironmentSubstitutions(&proxyReq, environmentVars)
	}

	reqHeaders, body, bodyContent, bodySize, err := buildRequest(&proxyReq)
	if err != nil {
		response.Error = "Request build failed: " + err.Error()
		sendErrorResponse(w, response, startTime, http.StatusInternalServerError)
		return
	}

	response.RequestInfo = requestmodel.RequestInfo{
		Method:      proxyReq.Method,
		URL:         proxyReq.URL,
		Headers:     headerToMap(reqHeaders),
		Body:        bodyContent,
		BodySize:    bodySize,
		ContentType: reqHeaders.Get("Content-Type"),
	}

	req, err := http.NewRequest(proxyReq.Method, proxyReq.URL, body)
	if err != nil {
		response.Error = "HTTP request creation failed: " + err.Error()
		sendErrorResponse(w, response, startTime, http.StatusInternalServerError)
		return
	}
	req.Header = reqHeaders

	// client := &http.Client{Timeout: 30 * time.Second}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		response.Error = "Request execution failed: " + err.Error()
		sendErrorResponse(w, response, startTime, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error = "Failed to read response body: " + err.Error()
		sendErrorResponse(w, response, startTime, http.StatusInternalServerError)
		return
	}

	response.ResponseInfo = requestmodel.ResponseInfo{
		StatusCode:    resp.StatusCode,
		Status:        resp.Status,
		Headers:       headerToMap(resp.Header),
		Body:          string(respBody),
		BodySize:      int64(len(respBody)),
		ContentType:   resp.Header.Get("Content-Type"),
		ContentLength: resp.ContentLength,
	}

	response.TimingInfo.EndTime = time.Now()
	response.TimingInfo.Duration = time.Since(startTime).String()
	response.TimingInfo.DurationMs = time.Since(startTime).Milliseconds()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func buildRequest(proxyReq *requestmodel.ProxyRequest) (http.Header, io.Reader, string, int64, error) {
	reqHeaders := http.Header{}
	var body io.Reader
	var bodyContent string
	var bodySize int64

	for _, h := range proxyReq.Headers {
		if h.Key != "" {
			reqHeaders.Set(h.Key, h.Value)
		}
	}

	if err := handleAuth(proxyReq.Auth, reqHeaders, &proxyReq.URL); err != nil {
		return nil, nil, "", 0, err
	}

	switch proxyReq.Body.Mode {
	case "raw":
		bodyContent = proxyReq.Body.Raw
		body = strings.NewReader(bodyContent)
		bodySize = int64(len(bodyContent))
		if reqHeaders.Get("Content-Type") == "" {
			reqHeaders.Set("Content-Type", "application/json")
		}

	case "formdata":
		var b bytes.Buffer
		writer := multipart.NewWriter(&b)

		for _, field := range proxyReq.Body.FormData {
			if field.Key == "" {
				continue
			}

			if field.Type == "file" && field.Value != "" {
				// Decode base64 file data
				fileBytes, err := base64.StdEncoding.DecodeString(field.Value)
				if err != nil {
					continue
				}

				// Use provided filename or fallback to key
				filename := field.Filename
				if filename == "" {
					filename = field.Key
				}

				// Create form file field
				part, err := writer.CreateFormFile(field.Key, filename)
				if err != nil {
					continue
				}

				// Write decoded bytes
				_, _ = part.Write(fileBytes)

			} else {
				// Normal text field
				writer.WriteField(field.Key, field.Value)
			}
		}

		writer.Close()
		body = &b
		bodyContent = "multipart form data"
		bodySize = int64(b.Len())
		reqHeaders.Set("Content-Type", writer.FormDataContentType())

	case "urlencoded":
		data := url.Values{}
		for _, field := range proxyReq.Body.UrlEncoded {
			if field.Key != "" {
				data.Set(field.Key, field.Value)
			}
		}
		bodyContent = data.Encode()
		body = strings.NewReader(bodyContent)
		bodySize = int64(len(bodyContent))
		reqHeaders.Set("Content-Type", "application/x-www-form-urlencoded")
	}

	return reqHeaders, body, bodyContent, bodySize, nil
}

func handleAuth(auth requestmodel.Auth, headers http.Header, requestURL *string) error {
	switch strings.ToLower(auth.Type) {

	case "apikey":
		for _, kv := range auth.APIKey {
			apiKeyHeader := kv.Key
			apiKeyValue := kv.Value
			apiKeyLocation := strings.ToLower(kv.In)

			if apiKeyHeader != "" && apiKeyValue != "" {
				switch apiKeyLocation {
				case "header":
					headers.Set(apiKeyHeader, apiKeyValue)
				case "query":
					u, err := url.Parse(*requestURL)
					if err != nil {
						return err
					}
					q := u.Query()
					q.Set(apiKeyHeader, apiKeyValue)
					u.RawQuery = q.Encode()
					*requestURL = u.String()
				}
			}
		}

	case "bearer":
		if len(auth.Bearer) > 0 {
			token := auth.Bearer[0].Value
			if token != "" {
				headers.Set("Authorization", "Bearer "+token)
			}
		}

	case "basic":
		var username, password string
		for _, kv := range auth.Basic {
			switch strings.ToLower(kv.Key) {
			case "username":
				username = kv.Value
			case "password":
				password = kv.Value
			}
		}
		if username != "" {
			authStr := username + ":" + password
			encoded := base64.StdEncoding.EncodeToString([]byte(authStr))
			headers.Set("Authorization", "Basic "+encoded)
		}

	case "oauth2":
		if len(auth.OAuth2) > 0 {
			token := auth.OAuth2[0].Value
			if token != "" {
				headers.Set("Authorization", "Bearer "+token)
			}
		}
	}

	return nil
}

func headerToMap(h http.Header) map[string]string {
	result := make(map[string]string)
	for k, v := range h {
		if len(v) > 0 {
			result[k] = strings.Join(v, ", ")
		}
	}
	return result
}

func sendErrorResponse(w http.ResponseWriter, response requestmodel.ProxyResponse, startTime time.Time, statusCode int) {
	response.TimingInfo.EndTime = time.Now()
	response.TimingInfo.Duration = time.Since(startTime).String()
	response.TimingInfo.DurationMs = time.Since(startTime).Milliseconds()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
