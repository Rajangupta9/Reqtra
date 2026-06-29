package routes

import (
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterItemRoutes(r *mux.Router, itemHandler *handlers.ItemHandler) {
	itemRouter := r.PathPrefix("/item").Subrouter()


	itemRouter.HandleFunc("/get", middleware.AuthMiddleware(itemHandler.GetItemWithParentId)).Methods("GET")

	itemRouter.HandleFunc("/create", middleware.AuthMiddleware(itemHandler.CreateItem)).Methods("POST")
	itemRouter.HandleFunc("/update", middleware.AuthMiddleware(itemHandler.UpdateItem)).Methods("PUT")
	itemRouter.HandleFunc("/delete", middleware.AuthMiddleware(itemHandler.DeleteItem)).Methods("DELETE")

	
}