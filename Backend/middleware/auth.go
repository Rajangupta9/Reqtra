package middleware

import (
	"context"
	"net/http"
	"reqtra/utils"
	"strings"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.ResponseWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		userID, err := utils.ValidateJwt(tokenString)

		if err != nil {
			utils.ResponseWithError(w, http.StatusUnauthorized, "Invalid Token")
			return
		}
		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
