package services

import (
	"context"
	"errors" // Import errors package
	"reqtra/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


var ErrItemNotFound = errors.New("item not found")

type ItemService struct {
	collection *mongo.Collection
	request    *mongo.Collection
}

func NewItemService(db *mongo.Database) *ItemService {
	return &ItemService{
		collection: db.Collection("items"),
		request:    db.Collection("requests"),
	}
}

func (s *ItemService) GetItemWithParentId(ctx context.Context, parentID primitive.ObjectID) ([]models.Item, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"parentId": parentID}},
		{"$lookup": bson.M{
			"from":         "requests",
			"localField":   "requestId",
			"foreignField": "_id",
			"as":           "request",
		}},
		{"$addFields": bson.M{
			"request": bson.M{"$cond": []interface{}{
				bson.M{"$gt": []interface{}{bson.M{"$size": "$request"}, 0}},
				bson.M{"$arrayElemAt": []interface{}{"$request", 0}},
				nil,
			}},
			"sortKey": bson.M{"$cond": []interface{}{
				bson.M{"$eq": []interface{}{"$type", "folder"}},
				0, // Folders first
				1, // Then requests
			}},
		}},
		{"$sort": bson.M{"sortKey": 1, "_id": 1}},
	}

	cursor, err := s.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Item
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

func (s *ItemService) CreateItem(ctx context.Context, parentId primitive.ObjectID, name, description string) (*models.Item, error) {
	item := &models.Item{
		ID:          primitive.NewObjectID(),
		ParentId:    &parentId,
		Name:        name,
		Type:        "folder",
		Description: description,
	}

	_, err := s.collection.InsertOne(ctx, item)
	return item, err
}

func (s *ItemService) UpdateItem(ctx context.Context, itemID primitive.ObjectID, name, description string) (*models.Item, error) {
	updateFields := bson.M{}
	if name != "" {
		updateFields["name"] = name
	}
	if description != "" {
		updateFields["description"] = description
	}
	if len(updateFields) == 0 {
		return nil, errors.New("no fields to update")
	}

	update := bson.M{"$set": updateFields}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedItem models.Item
	err := s.collection.FindOneAndUpdate(ctx, bson.M{"_id": itemID}, update, opts).Decode(&updatedItem)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrItemNotFound
		}
		return nil, err
	}

	return &updatedItem, nil
}


func (s *ItemService) DeleteItem(ctx context.Context, itemID primitive.ObjectID) error {
	
	var item models.Item
	err := s.collection.FindOne(ctx, bson.M{"_id": itemID}).Decode(&item)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrItemNotFound
		}
		return err
	}


	if item.RequestId != nil {
		if _, err := s.request.DeleteOne(ctx, bson.M{"_id": *item.RequestId}); err != nil {
			return err
		}
	}


	if _, err := s.collection.DeleteMany(ctx, bson.M{"parentId": itemID}); err != nil {
		return err
	}


	if _, err := s.collection.DeleteOne(ctx, bson.M{"_id": itemID}); err != nil {
		return err
	}

	return nil
}