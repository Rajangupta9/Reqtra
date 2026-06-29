
package routes

import (
	"net/http"
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterHealthRoutes(r *mux.Router) {
	healthRouter := r.PathPrefix("/check").Subrouter()
	healthRouter.Handle("", middleware.CheckCORS(http.HandlerFunc(handlers.Check)))
}
