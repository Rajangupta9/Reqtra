package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reqtra/config"
	"reqtra/models"
	"reqtra/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type EnvironmentPayload struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Variables []models.Variable `json:"variables"`
	IsNew     bool              `json:"isNew"`
}

type SaveEnvRequest struct {
	WorkspaceID  string               `json:"workspaceId"`
	Environments []EnvironmentPayload `json:"environments"`
}

func GetEnvironments(w http.ResponseWriter, r *http.Request) {
	workspaceIDHex := r.URL.Query().Get("workspaceId")
	if workspaceIDHex == "" {
		http.Error(w, "workspaceId is required", http.StatusBadRequest)
		return
	}

	workspaceID, err := primitive.ObjectIDFromHex(workspaceIDHex)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	var environments []models.Environment
	collection := config.GetCollection("environments")

	cursor, err := collection.Find(context.TODO(), bson.M{"workspace": workspaceID})
	if err != nil {
		http.Error(w, "Failed to fetch environments", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), &environments); err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to decode environments")
		return
	}

	if environments == nil {
		environments = []models.Environment{}
	}

	utils.ResponseWithJson(w, http.StatusOK, environments)
}

func SaveEnvironments(w http.ResponseWriter, r *http.Request) {
	var req SaveEnvRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	workspaceID, err := primitive.ObjectIDFromHex(req.WorkspaceID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	collection := config.GetCollection("environments")
	var writes []mongo.WriteModel



	for _, p := range req.Environments {
		if p.IsNew {

            id , err := primitive.ObjectIDFromHex(p.ID) 

			if err != nil {
				utils.ResponseWithError(w, http.StatusBadRequest, "Invalid Object id")
				return
			}

			newEnv := models.Environment{
				ID:        id,
				Workspace: workspaceID,
				Name:      p.Name,
				Variables: p.Variables,
			}
			writes = append(writes, mongo.NewInsertOneModel().SetDocument(newEnv))
		} else {
			envID, err := primitive.ObjectIDFromHex(p.ID)
			if err != nil {
				continue
			}
			filter := bson.M{"_id": envID, "workspace": workspaceID}
			update := bson.M{"$set": bson.M{"name": p.Name, "variables": p.Variables}}
			writes = append(writes, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update))
		}
	}

	if len(writes) == 0 {
		utils.ResponseWithJson(w, http.StatusOK, map[string]string{"message": "No changes to save"})
		return
	}

	if _, err := collection.BulkWrite(context.TODO(), writes); err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to save environments")
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{"message": "Environments saved successfully"})
}

func DeleteEnvironment(w http.ResponseWriter, r *http.Request) {
	envIDHex := r.URL.Query().Get("envId")
	if envIDHex == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "envId is required")
		return
	}

	envID, err := primitive.ObjectIDFromHex(envIDHex)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid environment ID")
		return
	}

	collection := config.GetCollection("environments")
	result, err := collection.DeleteOne(context.TODO(), bson.M{"_id": envID})
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete environment")
		return
	}

	if result.DeletedCount == 0 {
		utils.ResponseWithError(w, http.StatusNotFound, "Environment not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}


type EnvironmentDocument struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id"`
	Workspace primitive.ObjectID `json:"workspace" bson:"workspace"`
	Name      string             `json:"name" bson:"name"`
	Variables []models.Variable  `json:"variables" bson:"variables"`
}

func GetEnvironmentById(envId string) (map[string]string, error) {

	collection := config.GetCollection("environments")

	objID, err := primitive.ObjectIDFromHex(envId)
	if err != nil {

		return nil, fmt.Errorf("invalid environment ID format: %w", err)
	}

	var result EnvironmentDocument
	filter := bson.M{"_id": objID}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("environment not found")
		}
		return nil, fmt.Errorf("database query failed: %w", err)
	}

	varsMap := make(map[string]string)
	for _, variable := range result.Variables {
		if variable.Key != "" {
			varsMap[variable.Key] = variable.Value
		}
	}

	return varsMap, nil
}
