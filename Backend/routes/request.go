package routes

import (
	"net/http"
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterRequestRoutes(r *mux.Router, requestHandler *handlers.RequestHandler) {
	requestRouter := r.PathPrefix("/request").Subrouter()


	requestRouter.Handle("/create", middleware.AuthMiddleware(http.HandlerFunc(requestHandler.CreateRequestHandler))).Methods("POST")
	requestRouter.Handle("/update", middleware.AuthMiddleware(http.HandlerFunc(requestHandler.UpdateRequestHandler))).Methods("POST")


	requestRouter.Handle("/delete", middleware.AuthMiddleware(http.HandlerFunc(requestHandler.DeleteRequestHandler))).Methods("DELETE")
	requestRouter.Handle("/all", middleware.AuthMiddleware(http.HandlerFunc(requestHandler.RetrieveAllRequestsHandler))).Methods("GET")
}