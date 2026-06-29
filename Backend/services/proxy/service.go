package proxyServices

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"reqtra/models"
	requestmodel "reqtra/models/requestModel"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProxyService struct {
	db         *mongo.Database
	httpClient *http.Client
}

func NewProxyService(db *mongo.Database) *ProxyService {
	return &ProxyService{
		db:         db,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *ProxyService) ExecuteRequest(ctx context.Context, proxyReq *requestmodel.ProxyRequest, envId, activeTabId string) *requestmodel.ProxyResponse {
	startTime := time.Now()
	response := &requestmodel.ProxyResponse{
		ActiveTabId: activeTabId,
		TimingInfo:  requestmodel.TimingInfo{StartTime: startTime},
	}


	preRequestSandbox := NewSandbox()
	if envId != "" {
		vars, err := s.GetEnvironmentById(ctx, envId)
		if err != nil {
			response.Error = "Environment check failed: " + err.Error()
			return s.finalizeResponse(response, startTime)
		}
		preRequestSandbox.Environment = vars
	}

	if err := preRequestSandbox.Run(proxyReq.PreRequestScript); err != nil {
		response.Error = "Pre-request script execution failed: " + err.Error()
		return s.finalizeResponse(response, startTime)
	}


	ApplyEnvironmentSubstitutions(proxyReq, preRequestSandbox.Environment)

	reqHeaders, body, bodyContent, bodySize, err := BuildOutgoingRequest(proxyReq)
	if err != nil {
		response.Error = "Request build failed: " + err.Error()
		return s.finalizeResponse(response, startTime)
	}
	response.RequestInfo = requestmodel.RequestInfo{
		Method:      proxyReq.Method,
		URL:         proxyReq.URL,
		Headers:     HeaderToMap(reqHeaders),
		Body:        bodyContent,
		BodySize:    bodySize,
		ContentType: reqHeaders.Get("Content-Type"),
	}

	req, err := http.NewRequestWithContext(ctx, proxyReq.Method, proxyReq.URL, body)
	if err != nil {
		response.Error = "Failed to create outbound request: " + err.Error()
		return s.finalizeResponse(response, startTime)
	}
	req.Header = reqHeaders

	resp, err := s.httpClient.Do(req)
	if err != nil {
		response.Error = "Failed to execute outbound request: " + err.Error()
		return s.finalizeResponse(response, startTime)
	}

	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	response.ResponseInfo = requestmodel.ResponseInfo{
		StatusCode:    resp.StatusCode,
		Status:        resp.Status,
		Headers:       HeaderToMap(resp.Header),
		Body:          string(respBody),
		BodySize:      int64(len(respBody)),
		ContentType:   resp.Header.Get("Content-Type"),
		ContentLength: resp.ContentLength,
	}

	testSandbox := NewSandbox()
	testSandbox.Environment = preRequestSandbox.Environment
	testSandbox.PopulateResponseData(&response.ResponseInfo)

	if err := testSandbox.Run(proxyReq.TestScript); err != nil {
		scriptErrorTest := requestmodel.TestResult{
			Name:   "Test Script Execution",
			Passed: false,
			Error:  "Script failed to execute: " + err.Error(),
		}
		testSandbox.Tests = append(testSandbox.Tests, scriptErrorTest)
	}

	// --- PHASE 4: RESPONSE AGGREGATION ---
	response.TestResults = testSandbox.Tests
	// Optionally include updated environment in response:
	// response.Environment = testSandbox.Environment

	return s.finalizeResponse(response, startTime)
}

// EnvironmentDocument represents the Mongo document structure for environments.
type EnvironmentDocument struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id"`
	Workspace primitive.ObjectID `json:"workspace" bson:"workspace"`
	Name      string             `json:"name" bson:"name"`
	// Variables stored as slice in DB (assumes models.Variable { Key, Value string })
	Variables []models.Variable `json:"variables" bson:"variables"`
}

// GetEnvironmentById reads the environment document and returns a map suitable for substitution.
func (s *ProxyService) GetEnvironmentById(ctx context.Context, envId string) (map[string]string, error) {
	// validate ObjectID
	objID, err := primitive.ObjectIDFromHex(envId)
	if err != nil {
		return nil, errors.New("invalid envId format")
	}

	// use a short timeout for DB ops to avoid hanging
	dbCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var result EnvironmentDocument
	filter := bson.M{"_id": objID}

	err = s.db.Collection("environments").FindOne(dbCtx, filter).Decode(&result)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, fmt.Errorf("environment not found")
		}
		return nil, fmt.Errorf("failed to load environment: %w", err)
	}

	varsMap := make(map[string]string)
	for _, v := range result.Variables {
		// ignore empty keys
		if v.Key == "" {
			continue
		}
		varsMap[v.Key] = v.Value
	}

	return varsMap, nil
}

func (s *ProxyService) finalizeResponse(response *requestmodel.ProxyResponse, startTime time.Time) *requestmodel.ProxyResponse {
	response.TimingInfo.EndTime = time.Now()
	response.TimingInfo.Duration = time.Since(startTime).String()
	response.TimingInfo.DurationMs = time.Since(startTime).Milliseconds()
	return response
}
