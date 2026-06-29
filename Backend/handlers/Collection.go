package handlers

import (
	"encoding/json"
	"net/http"
	"reqtra/models" 
	"reqtra/services"
	"reqtra/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CollectionHandler struct {
	collectionService *services.CollectionService
}

func NewCollectionHandler(collectionService *services.CollectionService) *CollectionHandler {
	return &CollectionHandler{collectionService: collectionService}
}


func (h *CollectionHandler) ImportPostmanCollection(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.ResponseWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	workspaceIDStr := r.URL.Query().Get("workspaceId")
	if workspaceIDStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "workspaceId query parameter is required")
		return
	}
	workspaceID, err := primitive.ObjectIDFromHex(workspaceIDStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspaceId format")
		return
	}

	var postmanCollection models.PostmanCollection
	if err := json.NewDecoder(r.Body).Decode(&postmanCollection); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid Postman collection JSON: "+err.Error())
		return
	}

	// Call the service to do the actual work
	newCollection, err := h.collectionService.ImportPostmanCollection(r.Context(), workspaceID, &postmanCollection)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Error saving collection items: "+err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusCreated, map[string]interface{}{
		"message":        "Postman collection imported successfully",
		"workspaceId":    workspaceIDStr,
		"collectionName": newCollection.Name,
	})
}

func (h *CollectionHandler) CreateCollection(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		Name        string `json:"name"`
		Description string `json:"description,omitempty"`
		WorkspaceId string `json:"workspaceId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if reqBody.Name == "" || reqBody.WorkspaceId == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Collection name and workspaceId are required")
		return
	}
	workspaceIdPrimitive, err := primitive.ObjectIDFromHex(reqBody.WorkspaceId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspaceId format")
		return
	}

	collection, err := h.collectionService.CreateCollection(r.Context(), reqBody.Name, reqBody.Description, workspaceIdPrimitive)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to create collection")
		return
	}
	utils.ResponseWithJson(w, http.StatusCreated, collection)
}

func (h *CollectionHandler) GetCollections(w http.ResponseWriter, r *http.Request) {
	workspaceIDstr := r.URL.Query().Get("workspaceId")
	if workspaceIDstr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Workspace ID required")
		return
	}
	workspaceID, err := primitive.ObjectIDFromHex(workspaceIDstr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid WorkspaceId")
		return
	}

	collections, err := h.collectionService.GetCollections(r.Context(), workspaceID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to fetch collections")
		return
	}
	utils.ResponseWithJson(w, http.StatusOK, collections)
}

func (h *CollectionHandler) UpdateCollection(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		CollectionId string `json:"collectionId"`
		Name         string `json:"name,omitempty"`
		Description  string `json:"description,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if reqBody.CollectionId == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Collection ID is required")
		return
	}
	collectionId, err := primitive.ObjectIDFromHex(reqBody.CollectionId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid Collection ID format")
		return
	}

	matchedCount, err := h.collectionService.UpdateCollection(r.Context(), collectionId, reqBody.Name, reqBody.Description)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to update collection")
		return
	}
	if matchedCount == 0 {
		utils.ResponseWithError(w, http.StatusNotFound, "Collection not found or no changes made")
		return
	}
	utils.ResponseWithJson(w, http.StatusOK, map[string]string{"message": "Collection updated successfully"})
}

func (h *CollectionHandler) DeleteCollection(w http.ResponseWriter, r *http.Request) {
	collectionIdStr := r.URL.Query().Get("collectionId")
	if collectionIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Required collectionId in query params")
		return
	}
	collectionId, err := primitive.ObjectIDFromHex(collectionIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "collectionId is not valid")
		return
	}

	err = h.collectionService.DeleteCollection(r.Context(), collectionId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete collection: "+err.Error())
		return
	}
	utils.ResponseWithJson(w, http.StatusOK, map[string]string{
		"message": "Collection deleted successfully",
	})
}

//  Handler for getting items by parent.
func (h *CollectionHandler) GetItemsByParentID(w http.ResponseWriter, r *http.Request) {
	parentIDStr := r.URL.Query().Get("parentId")
	if parentIDStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "parentId query parameter is required")
		return
	}
	parentID, err := primitive.ObjectIDFromHex(parentIDStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid parentId format")
		return
	}

	items, err := h.collectionService.GetItemsByParentID(r.Context(), parentID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to fetch items")
		return
	}
	utils.ResponseWithJson(w, http.StatusOK, items)
}