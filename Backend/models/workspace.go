package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Workspace struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      primitive.ObjectID   `bson:"userId" json:"userId"`               
	Name        string               `bson:"name" json:"name"`                  
	Description string               `bson:"description,omitempty" json:"description,omitempty"`
	Members     []primitive.ObjectID `bson:"members,omitempty" json:"members,omitempty"` 
	CreatedAt   time.Time            `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time            `bson:"updatedAt" json:"updatedAt"`
}

