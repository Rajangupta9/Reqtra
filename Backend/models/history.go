package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RequestHistory struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	RequestID   primitive.ObjectID `bson:"requestId" json:"requestId"`
	WorkspaceID primitive.ObjectID `bson:"workspaceId" json:"workspaceId"`
	URL         string             `bson:"url" json:"url"`
	Method      string             `bson:"method" json:"method"`
	StatusCode  int                `bson:"statusCode" json:"statusCode"`
	Response    any                `bson:"response" json:"response"`
	Request     Request            `bson:"request" json:"request"`
	Error       string             `bson:"error,omitempty" json:"error,omitempty"`
	Duration    string             `bson:"duration" json:"duration"`
	CreatedAt   int64              `bson:"createdAt" json:"createdAt"`
}
