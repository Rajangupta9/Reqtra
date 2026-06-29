package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Variable struct {
	Key   string `bson:"key" json:"key"`
	Value string `bson:"value" json:"value"`
}

type Environment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Workspace primitive.ObjectID `bson:"workspace" json:"workspace"`
	Name      string             `bson:"name" json:"name"`
	Variables []Variable         `bson:"variables" json:"variables"`
}
