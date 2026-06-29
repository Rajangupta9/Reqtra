
package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Request struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ItemId    primitive.ObjectID `json:"itemId" bson:"itemId"`
	Name      string             `json:"name,omitempty"`
	URL       URL                `json:"url,omitzero"`
	Method    string             `json:"method"`
	Header    []KeyValue         `json:"header,omitempty"`
	Auth      Auth               `json:"auth,omitzero"`
	Body      RequestBody        `json:"body,omitzero"`
	Event    []Event            `json:"event,omitempty" bson:"event,omitempty"` 
	CreatedAt int64              `json:"createdAt" bson:"createdAt"`
	UpdatedAt int64              `json:"updatedAt" bson:"updatedAt"`
}

type URL struct {
	Raw      string     `json:"raw"`
	Protocol string     `json:"protocol"`
	Host     []string   `json:"host"`
	Path     []string   `json:"path"`
	Query    []KeyValue `json:"query"`
}

type KeyValue struct {
	Key   string `json:"key"`
	Value string `json:"value"`
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
	In 	  string `json:"in" bson:"in"`
}

type RequestBody struct {
	Mode       string     `json:"mode"`
	Raw        string     `json:"raw,omitempty"`
	FormData   []FormData `json:"formdata,omitempty"`
	UrlEncoded []KeyValue `json:"urlencoded,omitempty"`
}

type FormData struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type"`
	Filename string `json:"filename"`
}