
package routes

import (
	"net/http"
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterProxyRoutes(r *mux.Router) {
	proxyRouter := r.PathPrefix("/proxy").Subrouter()
	proxyRouter.Handle("", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(handlers.ProxyHandler))))
}
