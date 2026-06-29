package utils

import (
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetUserIDFromContext(r *http.Request) (primitive.ObjectID, error) {
	userIDStr := r.Context().Value("user_id").(string)
	if userIDStr == "" {
		return primitive.NilObjectID, fmt.Errorf("user not authenticated")
	}
	return primitive.ObjectIDFromHex(userIDStr)
}
