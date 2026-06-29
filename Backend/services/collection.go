package services

import (
	"context"
	"reqtra/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CollectionService struct {
	collection *mongo.Collection
	item       *mongo.Collection
	request    *mongo.Collection
	response   *mongo.Collection
}

func NewCollectionService(db *mongo.Database) *CollectionService {
	return &CollectionService{
		collection: db.Collection("collections"),
		item:       db.Collection("items"),
		request:    db.Collection("requests"),
		response:   db.Collection("responses"),
	}
}

func (s *CollectionService) CreateCollection(ctx context.Context, name, description string, workspaceId primitive.ObjectID) (*models.Collection, error) {
	collection := &models.Collection{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: description,
		Type:        "folder",
		WorkspaceId: &workspaceId,
		CreatedAt:   time.Now().Unix(),
		UpdatedAt:   time.Now().Unix(),
	}
	_, err := s.collection.InsertOne(ctx, collection)
	return collection, err
}

func (s *CollectionService) GetCollections(ctx context.Context, workspaceID primitive.ObjectID) ([]models.Collection, error) {
	cursor, err := s.collection.Find(ctx, bson.M{"workspaceId": workspaceID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var collections []models.Collection
	if err = cursor.All(ctx, &collections); err != nil {
		return nil, err
	}
	return collections, nil
}

func (s *CollectionService) UpdateCollection(ctx context.Context, collectionID primitive.ObjectID, name, description string) (int64, error) {
	updateData := bson.M{}
	if name != "" {
		updateData["name"] = name
	}
	if description != "" {
		updateData["description"] = description
	}

	if len(updateData) == 0 {
		return 0, nil 
	}
	updateData["updatedAt"] = time.Now().Unix()

	res, err := s.collection.UpdateOne(ctx, bson.M{"_id": collectionID}, bson.M{"$set": updateData})
	if err != nil {
		return 0, err
	}
	return res.MatchedCount, nil
}


func (s *CollectionService) DeleteCollection(ctx context.Context, collectionID primitive.ObjectID) error {
	cursor, err := s.item.Find(ctx, bson.M{"collectionId": collectionID})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var items []models.Item
	if err = cursor.All(ctx, &items); err != nil {
		return err
	}

	for _, item := range items {
		if item.RequestId != nil {
			_, _ = s.request.DeleteOne(ctx, bson.M{"_id": *item.RequestId})
			_, _ = s.response.DeleteMany(ctx, bson.M{"requestId": *item.RequestId})
		}
	}

	if _, err := s.item.DeleteMany(ctx, bson.M{"collectionId": collectionID}); err != nil {
		return err
	}

	_, err = s.collection.DeleteOne(ctx, bson.M{"_id": collectionID})
	return err
}

func (s *CollectionService) ImportPostmanCollection(ctx context.Context, workspaceID primitive.ObjectID, postmanCollection *models.PostmanCollection) (*models.Collection, error) {
	now := time.Now().Unix()
	collectionID := primitive.NewObjectID()
	newCollection := &models.Collection{
		ID:          collectionID,
		WorkspaceId: &workspaceID,
		Name:        postmanCollection.Info.Name,
		Description: postmanCollection.Info.Description,
		Type:        "folder",
		Variables:   postmanCollection.Variables,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if _, err := s.collection.InsertOne(ctx, newCollection); err != nil {
		return nil, err
	}

	for _, pItem := range postmanCollection.Items {
		if err := s.saveItemRecursive(ctx, pItem, collectionID, &collectionID); err != nil {
			return nil, err
		}
	}

	return newCollection, nil
}

func (s *CollectionService) saveItemRecursive(ctx context.Context, pItem models.PostmanItem, collectionID primitive.ObjectID, parentID *primitive.ObjectID) error {
	now := time.Now().Unix()
	newItemID := primitive.NewObjectID()
	itemType := "folder"
	var requestID *primitive.ObjectID

	if pItem.Request != nil {
		itemType = "request"
		newRequestID := primitive.NewObjectID()
		requestID = &newRequestID

		request := pItem.Request
		request.ID = newRequestID
		request.ItemId = newItemID
		if request.Name == "" {
			request.Name = pItem.Name
		}
		request.Event = pItem.Event
		request.CreatedAt = now
		request.UpdatedAt = now

		if _, err := s.request.InsertOne(ctx, request); err != nil {
			return err
		}
	}

	newItem := models.Item{
		ID:           newItemID,
		CollectionId: collectionID,
		ParentId:     parentID,
		Name:         pItem.Name,
		Description:  pItem.Description,
		Type:         itemType,
		RequestId:    requestID,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if _, err := s.item.InsertOne(ctx, newItem); err != nil {
		return err
	}

	for _, childItem := range pItem.Items {
		if err := s.saveItemRecursive(ctx, childItem, collectionID, &newItemID); err != nil {
			return err
		}
	}

	return nil
}


func (s *CollectionService) GetItemsByParentID(ctx context.Context, parentID primitive.ObjectID) ([]models.Item, error) {

    pipeline := []bson.M{
        {"$match": bson.M{"parentId": parentID}},
        {
            "$lookup": bson.M{
                "from":         "requests",
                "localField":   "requestId",
                "foreignField": "_id",
                "as":           "request",
            },
        },
        {
            "$addFields": bson.M{
                "request": bson.M{
                    "$cond": []interface{}{
                        bson.M{"$gt": []interface{}{bson.M{"$size": "$request"}, 0}},
                        bson.M{"$arrayElemAt": []interface{}{"$request", 0}},
                        nil, 
                    },
                },
                "sortKey": bson.M{
                    "$cond": []interface{}{
                        bson.M{"$eq": []interface{}{"$type", "folder"}},
                        0, // Folders get sortKey 0
                        1, // Requests get sortKey 1
                    },
                },
            },
        },
        {"$sort": bson.M{"sortKey": 1}}, 
    }

    // Run the aggregation on the 'items' collection
    cursor, err := s.item.Aggregate(ctx, pipeline)
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