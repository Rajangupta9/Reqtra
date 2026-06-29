package routes

import (
	"reqtra/handlers" 

	"github.com/gorilla/mux"
)


func RegisterRoutes(
	r *mux.Router,
	workspaceHandler *handlers.WorkspaceHandler,
	authHandler *handlers.AuthHandler,
	requestHandler *handlers.RequestHandler,
	itemHandler *handlers.ItemHandler,
	collectionHandler *handlers.CollectionHandler,
	historyHandler *handlers.HistoryHandler,

	
) {
	RegisterHealthRoutes(r)
	RegisterAuthRoutes(r , authHandler) 
	RegisterWorkspaceRoutes(r, workspaceHandler)

	RegisterCollectionRoutes(r , collectionHandler)
	RegisterRequestRoutes(r , requestHandler)
	RegisterItemRoutes(r , itemHandler)
	RegisterProxyRoutes(r)
	RegisterEnvironmentRoutes(r)
	RegisterHistoryRoutes(r , historyHandler)
}
