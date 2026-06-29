package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Response struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	RequestId       primitive.ObjectID `json:"requestId" bson:"requestId"`
	Name            string             `json:"name"`
	OriginalRequest OriginalReq        `json:"originalRequest"`
	Status          string             `json:"status"`
	Code            int                `json:"code"`
	ResponseTime    int                `json:"responseTime"`
	Timings         Timings            `json:"timings"`
	Header          []KeyValue         `json:"header"`
	Cookie          []Cookie           `json:"cookie"`
	Body            string             `json:"body"`
	CreatedAt       int64              `json:"createdAt" bson:"createdAt"`
}

type OriginalReq struct {
	Description string      `json:"description"`
	URL         URL         `json:"url"`
	Method      string      `json:"method"`
	Header      []KeyValue  `json:"header"`
	Body        RequestBody `json:"body"`
}

type Timings struct {
	DNS       int `json:"dns"`
	TCP       int `json:"tcp"`
	SSL       int `json:"ssl"`
	FirstByte int `json:"firstByte"`
	Download  int `json:"download"`
}

type Cookie struct {
	Domain   string `json:"domain"`
	HTTPOnly bool   `json:"httpOnly"`
	Name     string `json:"name"`
	Path     string `json:"path"`
	Secure   bool   `json:"secure"`
	Value    string `json:"value"`
}
