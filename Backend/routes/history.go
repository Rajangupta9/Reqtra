
package routes

import (
	"net/http"
	"reqtra/handlers"
	"reqtra/middleware"

	"github.com/gorilla/mux"
)

func RegisterHistoryRoutes(r *mux.Router , historyHandler *handlers.HistoryHandler) {
	historyRouter := r.PathPrefix("/api/history").Subrouter()
	historyRouter.Handle("/create", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(historyHandler.Create))))
	historyRouter.Handle("/user", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(historyHandler.GetByUser))))
	historyRouter.Handle("/delete", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(historyHandler.Delete))))
	historyRouter.Handle("/clear", middleware.CheckCORS(middleware.AuthMiddleware(http.HandlerFunc(historyHandler.ClearByUser))))
}
