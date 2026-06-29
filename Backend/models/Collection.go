package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Collection struct {
	ID           primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	WorkspaceId  *primitive.ObjectID  `json:"workspaceId,omitempty" bson:"workspaceId,omitempty"`
	Name         string               `json:"name" bson:"name"`
	Description  string               `json:"description,omitempty" bson:"description,omitempty"`
	Type         string               `json:"type,omitempty" bson:"type,omitempty"`
	Variables    []Variable           `json:"variables,omitempty" bson:"variables,omitempty"`
	Items        []primitive.ObjectID `json:"items,omitempty" bson:"items,omitempty"`

	CreatedAt    int64                `json:"createdAt" bson:"createdAt"`
	UpdatedAt    int64                `json:"updatedAt" bson:"updatedAt"`
}
