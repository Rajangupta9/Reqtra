package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	dbName      string
	mongoOnce   sync.Once
)

// ConnectDB initializes the connection to MongoDB.
func ConnectDB() {
	mongoOnce.Do(func() {
		mongoURI := os.Getenv("MONGO_URI")
		if mongoURI == "" {
			log.Println("MONGO_URI not set, using default 'mongodb://localhost:27017'")
			mongoURI = "mongodb://localhost:27017"
		}

		dbName = os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "reqtra_db"
		}

		clientOptions := options.Client().ApplyURI(mongoURI)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		client, err := mongo.Connect(ctx, clientOptions)
		if err != nil {
			log.Fatalf("Failed to connect to MongoDB: %v", err)
		}

		err = client.Ping(ctx, nil)
		if err != nil {
			log.Fatalf("Failed to ping MongoDB: %v", err)
		}

		log.Println("Successfully connected to MongoDB!")
		MongoClient = client
	})
}

// GetDB returns a handle to the application's database.
func GetDB() (*mongo.Database, error) {
	if MongoClient == nil {
		return nil, fmt.Errorf("database client is not initialized. Ensure ConnectDB() is called.")
	}
	return MongoClient.Database(dbName), nil
}

// GetCollection returns a handle to a specific collection in the database.
func GetCollection(collectionName string) (*mongo.Collection) {
	db, err := GetDB()
	if err != nil {
		return nil
	}
	return db.Collection(collectionName)
}
