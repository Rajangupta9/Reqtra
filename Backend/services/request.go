package services

import (
	"context"
	"reqtra/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RequestService struct {
	request *mongo.Collection
	item    *mongo.Collection
}

func NewRequestService(db *mongo.Database) *RequestService {
	return &RequestService{
		request: db.Collection("requests"),
		item:    db.Collection("items"),
	}
}

func (s *RequestService) CreateRequest(ctx context.Context, parentID primitive.ObjectID, isCollection bool, name, method string, url models.URL, header []models.KeyValue, auth models.Auth, body models.RequestBody, event []models.Event) (*models.Item, *models.Request, error) {
	var collectionId primitive.ObjectID
	if isCollection {
		collectionId = parentID
	} else {
		var parentItem models.Item
		err := s.item.FindOne(ctx, bson.M{"_id": parentID}).Decode(&parentItem)
		if err != nil {
			return nil, nil, err
		}
		collectionId = parentItem.CollectionId
	}

	now := time.Now().Unix()
	newItemID := primitive.NewObjectID()
	newRequestID := primitive.NewObjectID()

	newRequest := &models.Request{
		ID:        newRequestID,
		Name:      name,
		ItemId:    newItemID,
		URL:       url,
		Method:    method,
		Header:    header,
		Auth:      auth,
		Body:      body,
		Event:     event, 
		CreatedAt: now,
		UpdatedAt: now,
	}

	if _, err := s.request.InsertOne(ctx, newRequest); err != nil {
		return nil, nil, err
	}

	newItem := &models.Item{
		ID:           newItemID,
		CollectionId: collectionId,
		ParentId:     &parentID,
		Name:         name,
		Type:         "request",
		RequestId:    &newRequest.ID,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if _, err := s.item.InsertOne(ctx, newItem); err != nil {

		s.request.DeleteOne(context.Background(), bson.M{"_id": newRequest.ID})
		return nil, nil, err
	}

	return newItem, newRequest, nil
}


func (s *RequestService) UpdateRequest(ctx context.Context, requestID primitive.ObjectID, name, method string, url models.URL, header []models.KeyValue, auth models.Auth, body models.RequestBody, event []models.Event) (*models.Request, error) {
	update := bson.M{
		"$set": bson.M{
			"name":      name,
			"method":    method,
			"url":       url,
			"header":    header,
			"auth":      auth,
			"body":      body,
			"event":     event,
			"updatedAt": time.Now().Unix(),
		},
	}

	res, err := s.request.UpdateByID(ctx, requestID, update)
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, mongo.ErrNoDocuments
	}

	_, err = s.item.UpdateMany(ctx, bson.M{"requestId": requestID}, bson.M{"$set": bson.M{"name": name}})
	if err != nil {
		
	}

	var updatedReq models.Request
	if err := s.request.FindOne(ctx, bson.M{"_id": requestID}).Decode(&updatedReq); err != nil {
		return nil, err
	}

	return &updatedReq, nil
}

func (s *RequestService) DeleteRequest(ctx context.Context, requestID primitive.ObjectID) (int64, error) {
	
	_, err := s.item.DeleteMany(ctx, bson.M{"requestId": requestID})
	if err != nil {
		return 0, err
	}


	res, err := s.request.DeleteOne(ctx, bson.M{"_id": requestID})
	if err != nil {
		return 0, err
	}

	return res.DeletedCount, nil
}

func (s *RequestService) RetrieveAllRequests(ctx context.Context, parentID primitive.ObjectID) ([]map[string]interface{}, error) {

	var fetchItems func(pID primitive.ObjectID) ([]map[string]interface{}, error)
	fetchItems = func(pID primitive.ObjectID) ([]map[string]interface{}, error) {
		recursiveCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		pipeline := []bson.M{
			{"$match": bson.M{"parentId": pID}},
			{"$lookup": bson.M{
				"from":         "requests",
				"localField":   "requestId",
				"foreignField": "_id",
				"as":           "request",
			}},
			{"$addFields": bson.M{
				"request": bson.M{
					"$cond": []interface{}{
						bson.M{"$gt": []interface{}{bson.M{"$size": "$request"}, 0}},
						bson.M{"$arrayElemAt": []interface{}{"$request", 0}},
						nil, 
					},
				},
			}},
			// {"$sort": bson.M{"name": 1}},
		}

		cursor, err := s.item.Aggregate(recursiveCtx, pipeline)
		if err != nil {
			return nil, err
		}
		defer cursor.Close(recursiveCtx)

		var items []map[string]interface{}
		if err := cursor.All(recursiveCtx, &items); err != nil {
			return nil, err
		}

		for _, item := range items {
			if itemType, ok := item["type"].(string); ok && itemType == "folder" {
				itemID, _ := item["_id"].(primitive.ObjectID)
				children, err := fetchItems(itemID)
				if err != nil {
					return nil, err
				}
				item["children"] = children
			}
		}

		return items, nil
	}

	return fetchItems(parentID)
}