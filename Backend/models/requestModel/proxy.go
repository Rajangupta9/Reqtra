package requestmodel

import "time"

type Header struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Description string `json:"description"`
	Enabled     bool   `json:"enabled"`
}

type KeyValue struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
	Enabled     bool   `json:"enabled"`
	Type        string `json:"type,omitempty"`
	File        string `json:"file,omitempty"`
}

type RequestBody struct {
	Mode       string     `json:"mode"`
	Raw        string     `json:"raw,omitempty"`
	FormData   []FormData `json:"formdata,omitempty"`
	UrlEncoded []KeyValue `json:"urlencoded,omitempty"`
}

type FormData struct {
	Key      string `json:"key"`
	Value    string `json:"value"`
	Type     string `json:"type"`
	Filename string `json:"filename"`
}
type ProxyRequest struct {
	Method           string      `json:"method"`
	URL              string      `json:"url"`
	Headers          []Header    `json:"headers"`
	Auth             Auth        `json:"auth"`
	Body             RequestBody `json:"body"`
	PreRequestScript string      `json:"preRequestScript"` 
	TestScript       string      `json:"testScript"`       
}

type Auth struct {
	Type   string        `json:"type" bson:"type"`
	APIKey []AuthKeyPair `json:"apikey,omitempty" bson:"apikey,omitempty"`
	Bearer []AuthKeyPair `json:"bearer,omitempty" bson:"bearer,omitempty"`
	Basic  []AuthKeyPair `json:"basic,omitempty" bson:"basic,omitempty"`
	OAuth2 []AuthKeyPair `json:"oauth2,omitempty" bson:"oauth2,omitempty"`
}

type AuthKeyPair struct {
	Key   string `json:"key" bson:"key"`
	Value string `json:"value" bson:"value"`
	Type  string `json:"type" bson:"type"`
	In    string `json:"in" bson:"in"`
}

type ProxyResponse struct {
	ActiveTabId  string       `json:"activeTabId"`
	RequestInfo  RequestInfo  `json:"requestInfo"`
	ResponseInfo ResponseInfo `json:"responseInfo"`
	TimingInfo   TimingInfo   `json:"timingInfo"`
	Error        string       `json:"error,omitempty"`
	TestResults  []TestResult `json:"testResults,omitempty"`
}

type TestResult struct {
	Name   string `json:"name"`
	Passed bool   `json:"passed"`
	Error  string `json:"error,omitempty"`
}

type RequestInfo struct {
	Method      string            `json:"method"`
	URL         string            `json:"url"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body,omitempty"`
	BodySize    int64             `json:"bodySize"`
	ContentType string            `json:"contentType"`
}

type ResponseInfo struct {
	StatusCode    int               `json:"statusCode"`
	Status        string            `json:"status"`
	Headers       map[string]string `json:"headers"`
	Body          string            `json:"body,omitempty"`
	BodySize      int64             `json:"bodySize"`
	ContentType   string            `json:"contentType"`
	ContentLength int64             `json:"contentLength"`
}

type TimingInfo struct {
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
	Duration   string    `json:"duration"`
	DurationMs int64     `json:"durationMs"`
}
