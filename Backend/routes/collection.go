package routes

import (
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterCollectionRoutes(r *mux.Router, collectionHandler *handlers.CollectionHandler) {
	collectionRouter := r.PathPrefix("/collection").Subrouter()


	collectionRouter.HandleFunc("/import", middleware.AuthMiddleware(collectionHandler.ImportPostmanCollection)).Methods("POST")
	collectionRouter.HandleFunc("/create", middleware.AuthMiddleware(collectionHandler.CreateCollection)).Methods("POST")
	collectionRouter.HandleFunc("/delete", middleware.AuthMiddleware(collectionHandler.DeleteCollection)).Methods("DELETE")
	collectionRouter.HandleFunc("/update", middleware.AuthMiddleware(collectionHandler.UpdateCollection)).Methods("PUT")
	collectionRouter.HandleFunc("/get", middleware.AuthMiddleware(collectionHandler.GetCollections)).Methods("GET")
	

	collectionRouter.HandleFunc("/items", middleware.AuthMiddleware(collectionHandler.GetItemsByParentID)).Methods("GET") 
}