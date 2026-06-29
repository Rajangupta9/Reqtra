package proxyServices

import (
	"bytes"
	"encoding/base64"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	requestmodel "reqtra/models/requestModel" 
	"regexp"
	"strings"
)

func SubstituteVariables(input string, vars map[string]string) string {
	if !strings.Contains(input, "{{") {
		return input
	}
	re := regexp.MustCompile(`\{\{([^\}]+)\}\}`)
	return re.ReplaceAllStringFunc(input, func(m string) string {
		key := strings.Trim(m, "{}")
		if val, ok := vars[key]; ok {
			return val
		}
		return m 
	})
}

func ApplyEnvironmentSubstitutions(proxyReq *requestmodel.ProxyRequest, vars map[string]string) {
	sub := func(s string) string {
		return SubstituteVariables(s, vars)
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
			if proxyReq.Body.FormData[i].Type != "file" {
				proxyReq.Body.FormData[i].Value = sub(proxyReq.Body.FormData[i].Value)
			}
		}
	case "urlencoded":
		for i := range proxyReq.Body.UrlEncoded {
			proxyReq.Body.UrlEncoded[i].Value = sub(proxyReq.Body.UrlEncoded[i].Value)
		}
	}
}

func BuildOutgoingRequest(proxyReq *requestmodel.ProxyRequest) (http.Header, io.Reader, string, int64, error) {
	reqHeaders := http.Header{}
	var body io.Reader
	var bodyContent string
	var bodySize int64

	for _, h := range proxyReq.Headers {
		if h.Key != "" {
			reqHeaders.Set(h.Key, h.Value)
		}
	}

	if err := HandleAuth(proxyReq.Auth, reqHeaders, &proxyReq.URL); err != nil {
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
				fileBytes, err := base64.StdEncoding.DecodeString(field.Value)
				if err != nil {
					continue 
				}
				filename := field.Filename
				if filename == "" {
					filename = field.Key
				}
				part, err := writer.CreateFormFile(field.Key, filename)
				if err != nil {
					continue 
				}
				_, _ = part.Write(fileBytes)
			} else {
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

func HandleAuth(auth requestmodel.Auth, headers http.Header, requestURL *string) error {
	switch strings.ToLower(auth.Type) {
	case "apikey":
		for _, kv := range auth.APIKey {
			if kv.Key != "" && kv.Value != "" {
				if strings.ToLower(kv.In) == "header" {
					headers.Set(kv.Key, kv.Value)
				} else if strings.ToLower(kv.In) == "query" {
					u, err := url.Parse(*requestURL)
					if err != nil {
						return err
					}
					q := u.Query()
					q.Set(kv.Key, kv.Value)
					u.RawQuery = q.Encode()
					*requestURL = u.String()
				}
			}
		}
	case "bearer":
		if len(auth.Bearer) > 0 && auth.Bearer[0].Value != "" {
			headers.Set("Authorization", "Bearer "+auth.Bearer[0].Value)
		}
	case "basic":
		var username, password string
		for _, kv := range auth.Basic {
			if strings.ToLower(kv.Key) == "username" {
				username = kv.Value
			} else if strings.ToLower(kv.Key) == "password" {
				password = kv.Value
			}
		}
		if username != "" {
			authStr := username + ":" + password
			encoded := base64.StdEncoding.EncodeToString([]byte(authStr))
			headers.Set("Authorization", "Basic "+encoded)
		}
	case "oauth2":
		if len(auth.OAuth2) > 0 && auth.OAuth2[0].Value != "" {
			headers.Set("Authorization", "Bearer "+auth.OAuth2[0].Value)
		}
	}
	return nil
}

func HeaderToMap(h http.Header) map[string]string {
	result := make(map[string]string)
	for k, v := range h {
		if len(v) > 0 {
			result[k] = strings.Join(v, ", ")
		}
	}
	return result
}