package handlers

import (
	"encoding/json"
	"net/http"
	"reqtra/models"
	"reqtra/services"
	"reqtra/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type createRequestBody struct {
	Name   string             `json:"name"`
	Method string             `json:"method"`
	URL    models.URL         `json:"url"`
	Header []models.KeyValue  `json:"header"`
	Auth   models.Auth        `json:"auth"`
	Event   []models.Event     `json:"event"`
	Body   models.RequestBody `json:"body"`
}

type RequestHandler struct {
	requestService *services.RequestService
}

func NewRequestHandler(requestService *services.RequestService) *RequestHandler {
	return &RequestHandler{requestService: requestService}
}

func (h *RequestHandler) CreateRequestHandler(w http.ResponseWriter, r *http.Request) {
	itemIdStr := r.URL.Query().Get("itemId")
	collectionIdStr := r.URL.Query().Get("collectionId")

	if (itemIdStr == "" && collectionIdStr == "") || (itemIdStr != "" && collectionIdStr != "") {
		utils.ResponseWithError(w, http.StatusBadRequest, "Provide either itemId or collectionId, not both")
		return
	}

	var reqBody createRequestBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var parentID primitive.ObjectID
	var isCollection bool
	var err error

	if itemIdStr != "" {
		parentID, err = primitive.ObjectIDFromHex(itemIdStr)
		isCollection = false
	} else {
		parentID, err = primitive.ObjectIDFromHex(collectionIdStr)
		isCollection = true
	}

	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid ID format")
		return
	}

	
	newItem, newRequest, err := h.requestService.CreateRequest(r.Context(), parentID, isCollection, reqBody.Name, reqBody.Method, reqBody.URL, reqBody.Header, reqBody.Auth, reqBody.Body, reqBody.Event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.ResponseWithError(w, http.StatusNotFound, "Parent item or collection not found")
		} else {
			utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to create request: "+err.Error())
		}
		return
	}

	utils.ResponseWithJson(w, http.StatusCreated, map[string]interface{}{
		"item":    newItem,
		"request": newRequest,
	})
}

func (h *RequestHandler) UpdateRequestHandler(w http.ResponseWriter, r *http.Request) {
	requestIdStr := r.URL.Query().Get("requestId")
	if requestIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "requestId is required")
		return
	}
	requestId, err := primitive.ObjectIDFromHex(requestIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid requestId format")
		return
	}

	var reqBody createRequestBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	
	updatedReq, err := h.requestService.UpdateRequest(r.Context(), requestId, reqBody.Name, reqBody.Method, reqBody.URL, reqBody.Header, reqBody.Auth, reqBody.Body, reqBody.Event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.ResponseWithError(w, http.StatusNotFound, "Request not found")
		} else {
			utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to update request: "+err.Error())
		}
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, updatedReq)
}


func (h *RequestHandler) DeleteRequestHandler(w http.ResponseWriter, r *http.Request) {
	requestIdStr := r.URL.Query().Get("requestId")
	if requestIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "requestId is required")
		return
	}
	requestId, err := primitive.ObjectIDFromHex(requestIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid requestId format")
		return
	}

	deletedCount, err := h.requestService.DeleteRequest(r.Context(), requestId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete request: "+err.Error())
		return
	}
	if deletedCount == 0 {
		utils.ResponseWithError(w, http.StatusNotFound, "Request not found")
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{
		"message": "Request and related item deleted successfully",
	})
}


func (h *RequestHandler) RetrieveAllRequestsHandler(w http.ResponseWriter, r *http.Request) {
	parentIdStr := r.URL.Query().Get("parentId")
	if parentIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "parentId is required")
		return
	}
	parentID, err := primitive.ObjectIDFromHex(parentIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid parentId format")
		return
	}

	allItems, err := h.requestService.RetrieveAllRequests(r.Context(), parentID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to retrieve items: "+err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, allItems)
}