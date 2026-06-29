
package routes

import (
	"net/http"
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterEnvironmentRoutes(r *mux.Router) {
	environmentRouter := r.PathPrefix("/api/environments").Subrouter()
	environmentRouter.Handle("", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(handlers.GetEnvironments))))
	environmentRouter.Handle("/create", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(handlers.SaveEnvironments))))
	environmentRouter.Handle("/delete", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(handlers.DeleteEnvironment))))
}
