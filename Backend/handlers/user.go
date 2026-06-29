package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reqtra/models"
	"reqtra/services"
	"reqtra/utils"
)

type AuthRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GoogleLoginRequest struct {
	Token string `json:"token"`
}

type MicrosoftLoginRequest struct {
	AccessToken string `json:"accessToken"`
}

type AuthHandler struct {
	userService *services.UserService
}

func NewAuthHandler(userService *services.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		utils.ResponseWithError(w, http.StatusBadRequest, "Username, email, and password are required")
		return
	}

	user, err := h.userService.Register(r.Context(), req.Username, req.Email, req.Password)
	if err != nil {
		if err == services.ErrUserExists {
			utils.ResponseWithError(w, http.StatusConflict, err.Error())
			return
		}
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	accessToken, err := utils.GenerateTokens(user.ID.Hex())
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "User created, but failed to generate tokens")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name: "personalM", Value: fmt.Sprintf("Welcome, %s!", user.Username),
		Path: "/", HttpOnly: false, Secure: false, SameSite: http.SameSiteLaxMode, MaxAge: 3600,
	})
	userResponse := map[string]interface{}{"id": user.ID.Hex(), "username": user.Username, "email": user.Email}
	utils.ResponseWithJson(w, http.StatusCreated, map[string]interface{}{
		"message": "User registered successfully", "accessToken": accessToken, "user": userResponse,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid Request")
		return
	}

	user, err := h.userService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			utils.ResponseWithError(w, http.StatusUnauthorized, err.Error())
			return
		}
		utils.ResponseWithError(w, http.StatusInternalServerError, "An unexpected error occurred")
		return
	}

	accessToken, err := utils.GenerateTokens(user.ID.Hex())
	if err != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name: "personalMsg", Value: fmt.Sprintf("Welcome back, %s!", user.Username),
		Path: "/", HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode, MaxAge: 3600,
	})
	userResponse := map[string]interface{}{"id": user.ID.Hex(), "username": user.Username, "email": user.Email}
	utils.ResponseWithJson(w, http.StatusOK, map[string]interface{}{
		"message": "Login Successful", "accessToken": accessToken, "user": userResponse,
	})
}

// handleSocialLogin is a helper to avoid repeating code
func (h *AuthHandler) handleSocialLogin(w http.ResponseWriter, user *models.User, err error) {
	if err != nil {
		utils.ResponseWithError(w, http.StatusUnauthorized, "Failed to login")
		return
	}

	accessToken, tokenErr := utils.GenerateTokens(user.ID.Hex())
	if tokenErr != nil {
		utils.ResponseWithError(w, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	userResponse := map[string]interface{}{"id": user.ID.Hex(), "username": user.Username, "email": user.Email}
	utils.ResponseWithJson(w, http.StatusOK, map[string]interface{}{
		"message": "Login Successful", "accessToken": accessToken, "user": userResponse,
	})
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var req GoogleLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.GoogleLogin(r.Context(), req.Token)
	h.handleSocialLogin(w, user, err)
}

func (h *AuthHandler) MicrosoftLogin(w http.ResponseWriter, r *http.Request) {
	var req MicrosoftLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResponseWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.MicrosoftLogin(r.Context(), req.AccessToken)
	h.handleSocialLogin(w, user, err)
}