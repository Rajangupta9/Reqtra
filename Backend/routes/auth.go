package routes

import (
	"reqtra/handlers"

	"github.com/gorilla/mux"
)

func RegisterAuthRoutes(r *mux.Router, authHandler *handlers.AuthHandler) {
	authRouter := r.PathPrefix("/").Subrouter()
	authRouter.HandleFunc("/register",   authHandler.Register).Methods("POST")
	authRouter.HandleFunc("/login", authHandler.Login).Methods("POST")
	authRouter.HandleFunc("/google/login", authHandler.GoogleLogin).Methods("POST")
	authRouter.HandleFunc("/microsoft/login", authHandler.MicrosoftLogin).Methods("POST")
}
