package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"reqtra/models"
	"reqtra/services" // The service dependency
	"reqtra/utils"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HistoryHandler struct {
	historyService *services.HistoryService
}

func NewHistoryHandler(historyService *services.HistoryService) *HistoryHandler {
	return &HistoryHandler{historyService: historyService}
}

// Create is the HTTP handler for creating a new history record.
func (h *HistoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var history models.RequestHistory
	if err := json.NewDecoder(r.Body).Decode(&history); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	res, err := h.historyService.CreateRequestHistory(ctx, &history)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusCreated, map[string]interface{}{
		"message": "History saved successfully",
		"id":      res.InsertedID,
	})
}

// GetByUser is the HTTP handler for fetching history for a user.
func (h *HistoryHandler) GetByUser(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.URL.Query().Get("userId")
	workspaceIdStr := r.URL.Query().Get("workspaceId")

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	// Default pagination
	page := 1
	limit := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if userIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "userId is required")
		return
	}

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid userId format")
		return
	}

	var workspaceId primitive.ObjectID
	if workspaceIdStr != "" {
		workspaceId, err = primitive.ObjectIDFromHex(workspaceIdStr)
		if err != nil {
			utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspaceId format")
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// 🔹 Fetch paginated results
	histories, total, err := h.historyService.GetUserHistory(ctx, userId, workspaceId, page, limit)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to fetch history: "+err.Error())
		return
	}

	hasMore := int64(page * limit) < total

	utils.ResponseWithJson(w, http.StatusOK, bson.M{
		"data":    histories,
		"page":    page,
		"limit":   limit,
		"total":   total,
		"hasMore": hasMore,
	})
}

// Delete is the HTTP handler for deleting a single history record.
func (h *HistoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	historyIdStr := r.URL.Query().Get("historyId")
	if historyIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "historyId is required")
		return
	}

	historyId, err := primitive.ObjectIDFromHex(historyIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid historyId format")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	err = h.historyService.DeleteHistory(ctx, historyId)
	if err != nil {
		if err == services.ErrHistoryNotFound {
			utils.ResponseWithError(w, http.StatusNotFound, "History not found")
		} else {
			utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete history: "+err.Error())
		}
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{"message": "History deleted successfully"})
}

// ClearByUser is the HTTP handler for clearing all history for a user.
func (h *HistoryHandler) ClearByUser(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.URL.Query().Get("userId")
	workspaceIdStr := r.URL.Query().Get("workspaceId")

	if userIdStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "userId is required")
		return
	}

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid userId format")
		return
	}

	var workspaceId primitive.ObjectID
	if workspaceIdStr != "" {
		workspaceId, err = primitive.ObjectIDFromHex(workspaceIdStr)
		if err != nil {
			utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspaceId format")
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	deletedCount, err := h.historyService.ClearUserHistory(ctx, userId, workspaceId)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to clear history: "+err.Error())
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]interface{}{
		"message": fmt.Sprintf("Deleted %d history records successfully", deletedCount),
	})
}
