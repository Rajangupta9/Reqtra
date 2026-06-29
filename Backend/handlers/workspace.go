package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"reqtra/config"
	"reqtra/models"
	"reqtra/services"
	"reqtra/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// type WorkspaceService interface {
// 	CreateWorkspace(ctx context.Context, userID primitive.ObjectID, name, description string) (*models.Workspace, error)
// 	GetWorkspaces(ctx context.Context, userID primitive.ObjectID) ([]models.Workspace, error)
// 	UpdateWorkspace(ctx context.Context, userID, workspaceID primitive.ObjectID, name, description string) (int64, error)
// 	DeleteWorkspace(ctx context.Context, userID, workspaceID primitive.ObjectID) (int64, error)
// }

type WorkspaceHandler struct {
	workspaceService *services.WorkspaceService
}

func NewWorkspaceHandler(ws *services.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{
		workspaceService: ws,
	}
}

func (h *WorkspaceHandler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.ResponseWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.ResponseWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var reqBody struct {
		Name        string `json:"name"`
		Description string `json:"description,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if reqBody.Name == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Workspace name is required")
		return
	}

	workspace, err := h.workspaceService.CreateWorkspace(r.Context(), userID, reqBody.Name, reqBody.Description)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to create workspace")
		return
	}

	utils.ResponseWithJson(w, http.StatusCreated, workspace)
}

func (h *WorkspaceHandler) GetWorkspaces(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.ResponseWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	workspaces, err := h.workspaceService.GetWorkspaces(r.Context(), userID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to fetch workspaces")
		return
	}

	// if len(workspaces) == 0 {
	// 	utils.ResponseWithJson(w, http.StatusOK, []models.Workspace{})
	// 	return
	// }

	utils.ResponseWithJson(w, http.StatusOK, workspaces)
}

func (h *WorkspaceHandler) UpdateWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.ResponseWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.ResponseWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var reqBody struct {
		ID                string `json:"id"`
		Name              string `json:"name,omitempty"`
		Description       string `json:"description,omitempty"`
		AddMemberEmail    string `json:"addMemberEmail,omitempty"`
		RemoveMemberEmail string `json:"removeMemberEmail,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if reqBody.ID == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Workspace ID is required")
		return
	}

	workspaceID, err := primitive.ObjectIDFromHex(reqBody.ID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspace ID format")
		return
	}

	var addMemberID *primitive.ObjectID
	var removeMemberID *primitive.ObjectID

	if reqBody.AddMemberEmail != "" {
		userCollection := config.GetCollection("users")

		var user models.User
		err := userCollection.FindOne(
			context.Background(),
			bson.M{"email": reqBody.AddMemberEmail},
		).Decode(&user)

		if err != nil {
			utils.ResponseWithError(w, http.StatusNotFound, "User with given email not found")
			return
		}

		addMemberID = &user.ID
	}

	if reqBody.RemoveMemberEmail != "" {

		userCollection := config.GetCollection("users")
		var user models.User

		err := userCollection.FindOne(
			context.Background(),
			bson.M{"email": reqBody.RemoveMemberEmail},
		).Decode(&user)

		if err != nil {
			utils.ResponseWithError(w, http.StatusNotFound, "User with given email not found")
			return
		}

		removeMemberID = &user.ID
	}

	matchedCount, err := h.workspaceService.UpdateWorkspace(
		r.Context(),
		userID,
		workspaceID,
		reqBody.Name,
		reqBody.Description,
		addMemberID,
		removeMemberID,
	)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to update workspace")
		return
	}

	if matchedCount == 0 {
		utils.ResponseWithError(w, http.StatusNotFound, "Workspace not found or unauthorized")
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{
		"message": "Workspace updated successfully",
	})
}

func (h *WorkspaceHandler) DeleteWorkspace(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.ResponseWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	userID, err := utils.GetUserIDFromContext(r)
	if err != nil {
		utils.ResponseWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	workspaceIDStr := r.URL.Query().Get("workspaceId")
	if workspaceIDStr == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "workspaceId is required")
		return
	}

	workspaceID, err := primitive.ObjectIDFromHex(workspaceIDStr)
	if err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid workspace ID format")
		return
	}

	deletedCount, err := h.workspaceService.DeleteWorkspace(r.Context(), userID, workspaceID)
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to delete workspace")
		return
	}

	if deletedCount == 0 {
		utils.ResponseWithError(w, http.StatusNotFound, "Workspace not found or unauthorized")
		return
	}

	utils.ResponseWithJson(w, http.StatusOK, map[string]string{"message": "Workspace deleted successfully"})
}
