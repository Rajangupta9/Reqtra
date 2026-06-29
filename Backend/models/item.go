package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Item struct {
	ID           primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	CollectionId primitive.ObjectID  `json:"collectionId,omitempty" bson:"collectionId,omitempty"`
	ParentId     *primitive.ObjectID `json:"parentId,omitempty" bson:"parentId,omitempty"`
	Name         string              `json:"name"`
	Type         string              `json:"type" bson:"type"`
	Description  string              `json:"description,omitempty"`
	RequestId    *primitive.ObjectID `json:"requestId,omitempty" bson:"requestId,omitempty"`
	CreatedAt    int64               `json:"createdAt" bson:"createdAt"`
	UpdatedAt    int64               `json:"updatedAt" bson:"updatedAt"`

	Request *Request `json:"request,omitempty" bson:"request,omitempty"`
}
