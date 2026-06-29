package routes

import (
    "net/http" 
    "reqtra/handlers"
    "reqtra/middleware" 
    "github.com/gorilla/mux"
)

func RegisterWorkspaceRoutes(r *mux.Router, workspaceHandler *handlers.WorkspaceHandler) {
    workspaceRouter := r.PathPrefix("/workspace").Subrouter()

    // workspaceRouter.HandleFunc("/create", workspaceHandler.CreateWorkspace).Methods("POST")
    // workspaceRouter.HandleFunc("/get", workspaceHandler.GetWorkspaces).Methods("GET")
    // workspaceRouter.HandleFunc("/update", workspaceHandler.UpdateWorkspace).Methods("PUT")
    // workspaceRouter.HandleFunc("/delete", workspaceHandler.DeleteWorkspace).Methods("DELETE")

    workspaceRouter.Handle("/create", middleware.AuthMiddleware(http.HandlerFunc(workspaceHandler.CreateWorkspace))).Methods("POST")
    workspaceRouter.Handle("/get", middleware.AuthMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaces))).Methods("GET")
    workspaceRouter.Handle("/update", middleware.AuthMiddleware(http.HandlerFunc(workspaceHandler.UpdateWorkspace))).Methods("PUT")
    workspaceRouter.Handle("/delete", middleware.AuthMiddleware(http.HandlerFunc(workspaceHandler.DeleteWorkspace))).Methods("DELETE")
}