package handlers

import (
	"encoding/json"
	"net/http"
	"reqtra/services"
	"reqtra/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ItemHandler struct {
	itemService *services.ItemService
}

func NewItemHandler(itemService *services.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

func (h *ItemHandler) GetItemWithParentId(w http.ResponseWriter, r *http.Request) {
	parentIdstr := r.URL.Query().Get("parentId")
	if parentIdstr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "parentId is required")
		return
	}

	parentID, err := primitive.ObjectIDFromHex(parentIdstr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid parentId format")
		return
	}

	items, err := h.itemService.GetItemWithParentId(r.Context(), parentID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to retrieve items: "+err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, items)
}

func (h *ItemHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ParentId    string `json:"parentId"`
		Name        string `json:"name"`
		Description string `json:"description,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" || req.ParentId == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Folder name and parentId are required")
		return
	}
	parentId, err := primitive.ObjectIDFromHex(req.ParentId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid parentId format")
		return
	}

	item, err := h.itemService.CreateItem(r.Context(), parentId, req.Name, req.Description)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to create Item")
		return
	}

	utils.ResponseWithJson(w, http.StatusCreated, item)
}

func (h *ItemHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	itemIdStr := r.URL.Query().Get("itemId")
	if itemIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Required itemId in query params")
		return
	}
	itemId, err := primitive.ObjectIDFromHex(itemIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "itemId is not valid")
		return
	}

	err = h.itemService.DeleteItem(r.Context(), itemId)
	if err != nil {
		if err == services.ErrItemNotFound {
			utils.ResponseWithError(w, http.StatusNotFound, err.Error())
			return
		}
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete item: "+err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{
		"message": "Item and related data deleted successfully",
	})
}

func (h *ItemHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID          string `json:"id"`
		Name        string `json:"name,omitempty"`
		Description string `json:"description,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.ID == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Item ID is required")
		return
	}
	itemID, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid item ID format")
		return
	}

	updatedItem, err := h.itemService.UpdateItem(r.Context(), itemID, req.Name, req.Description)
	if err != nil {
		if err == services.ErrItemNotFound {
			utils.ResponseWithError(w, http.StatusNotFound, err.Error())
			return
		}
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to update item")
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, updatedItem)
}