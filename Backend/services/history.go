package services

import (
	"context"
	"errors"
	"fmt"
	"reqtra/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


var ErrHistoryNotFound = errors.New("history item not found")


type HistoryService struct {
	collection *mongo.Collection
}


func NewHistoryService(db *mongo.Database) *HistoryService {
	return &HistoryService{
		collection: db.Collection("history"),
	}
}


func (s *HistoryService) CreateRequestHistory(ctx context.Context, history *models.RequestHistory) (*mongo.InsertOneResult, error) {
	if history.UserID.IsZero() || history.RequestID.IsZero() || history.WorkspaceID.IsZero() {
		return nil, fmt.Errorf("userId, requestId, and workspaceId are required")
	}

	history.CreatedAt = time.Now().Unix()
	return s.collection.InsertOne(ctx, history)
}

func (s *HistoryService) GetUserHistory(
	ctx context.Context,
	userID primitive.ObjectID,
	workspaceID primitive.ObjectID,
	page int,
	limit int,
) ([]models.RequestHistory, int64, error) {

	filter := bson.M{"userId": userID}
	if !workspaceID.IsZero() {
		filter["workspaceId"] = workspaceID
	}

	skip := int64((page - 1) * limit)

	findOptions := options.Find().
		SetSort(bson.M{"createdAt": -1}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := s.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var histories []models.RequestHistory
	if err := cursor.All(ctx, &histories); err != nil {
		return nil, 0, fmt.Errorf("failed to decode history: %w", err)
	}

	
	total, err := s.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count history: %w", err)
	}

	return histories, total, nil
}



func (s *HistoryService) DeleteHistory(ctx context.Context, historyID primitive.ObjectID) error {
	res, err := s.collection.DeleteOne(ctx, bson.M{"_id": historyID})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return ErrHistoryNotFound
	}
	return nil
}


func (s *HistoryService) ClearUserHistory(ctx context.Context, userID primitive.ObjectID, workspaceID primitive.ObjectID) (int64, error) {
	
	filter := bson.M{"userId": userID}
	if !workspaceID.IsZero() {
		filter["workspaceId"] = workspaceID
	}

	res, err := s.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, err
	}
	return res.DeletedCount, nil
}