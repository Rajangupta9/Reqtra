package services

import (
	"context"
	"reqtra/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type WorkspaceService struct {
	collection *mongo.Collection
	db         *mongo.Database
}

func NewWorkspaceService(db *mongo.Database) *WorkspaceService {
	return &WorkspaceService{
		collection: db.Collection("workspace"),
		db:         db,
	}
}

func (s *WorkspaceService) CreateWorkspace(ctx context.Context, userID primitive.ObjectID, name, description string) (*models.Workspace, error) {
	workspace := &models.Workspace{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Name:        name,
		Description: description,
		Members:     []primitive.ObjectID{userID},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err := s.collection.InsertOne(ctx, workspace)
	if err != nil {
		return nil, err
	}

	return workspace, nil
}

func (s *WorkspaceService) GetWorkspaces(ctx context.Context, userID primitive.ObjectID) ([]bson.M, error) {
	pipeline := mongo.Pipeline{
		{{Key:"$match", Value:bson.M{
			"$or": []bson.M{
				{"userId": userID},
				{"members": userID},
			},
		}}},
		{{Key:"$lookup", Value:bson.M{
			"from": "users",
			"let": bson.M{"uid": "$userId"},
			"pipeline": []bson.M{
				{"$match": bson.M{"$expr": bson.M{"$eq": []interface{}{"$_id", "$$uid"}}}},
				{"$project": bson.M{
					"id":       "$_id",
					"username": 1,
					"email":    1,
					"_id":      0,
				}},
			},
			"as": "owner",
		}}},
		{{Key:"$lookup", Value: bson.M{
			"from": "users",
			"let": bson.M{"memberIds": "$members"},
			"pipeline": []bson.M{
				{"$match": bson.M{"$expr": bson.M{"$in": []interface{}{"$_id", "$$memberIds"}}}},
				{"$project": bson.M{
					"id":       "$_id",
					"username": 1,
					"email":    1,
					"_id":      0,
				}},
			},
			"as": "memberDetails",
		}}},
	
		{{Key:"$project", Value: bson.M{
			"id":          "$_id",
			"_id":         0,
			"name":        1,
			"description": 1,
			"userId":      1,
			"owner":       1,
			"memberDetails": 1,
			"members":     1,
			"createdAt":   1,
			"updatedAt":   1,
		}}},
	}

	cursor, err := s.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (s *WorkspaceService) UpdateWorkspace(
	ctx context.Context,
	userID, workspaceID primitive.ObjectID,
	name, description string,
	addMember, removeMember *primitive.ObjectID,
) (int64, error) {

	update := bson.M{}
	setFields := bson.M{}

	if name != "" {
		setFields["name"] = name
	}
	if description != "" {
		setFields["description"] = description
	}

	if len(setFields) > 0 || addMember != nil || removeMember != nil {
		setFields["updatedAt"] = time.Now()
		update["$set"] = setFields
	}

	if addMember != nil {
		update["$addToSet"] = bson.M{"members": *addMember}
	}
	if removeMember != nil {
		update["$pull"] = bson.M{"members": *removeMember}
	}

	if len(update) == 0 {
		return 0, nil
	}

	filter := bson.M{
		"_id": workspaceID,
		"$or": []bson.M{
			{"userId": userID},
			{"members": userID},
		},
	}

	res, err := s.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return 0, err
	}

	return res.MatchedCount, nil
}

func (s *WorkspaceService) DeleteWorkspace(ctx context.Context, userID, workspaceID primitive.ObjectID) (int64, error) {
	res, err := s.collection.DeleteOne(ctx, bson.M{
		"_id":    workspaceID,
		"userId": userID,
	})
	if err != nil {
		return 0, err
	}

	return res.DeletedCount, nil
}
