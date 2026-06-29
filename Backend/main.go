package main

import (
    "log"
    "net/http"
    "os"
    "reqtra/config"
    "reqtra/handlers"
    "reqtra/middleware" 
    "reqtra/routes"
    "reqtra/services"

    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("Warning: .env file not found")
    }

    config.ConnectDB()
    db, err := config.GetDB()
    if err != nil {
        log.Fatal("Failed to connect to the database")
    }


    workspaceService := services.NewWorkspaceService(db)
    userService := services.NewUserService(db)
    requestService := services.NewRequestService(db)
    itemService := services.NewItemService(db)
    collectionService := services.NewCollectionService(db)
	historyService := services.NewHistoryService(db)

    workspaceHandler := handlers.NewWorkspaceHandler(workspaceService)
    authHandler := handlers.NewAuthHandler(userService)
    requestHandler := handlers.NewRequestHandler(requestService)
    itemHandler := handlers.NewItemHandler(itemService)
    collectionHandler := handlers.NewCollectionHandler(collectionService)
	historyHandler := handlers.NewHistoryHandler(historyService)
    
  
    r := mux.NewRouter()

    routes.RegisterRoutes(r, workspaceHandler, authHandler, requestHandler, itemHandler, collectionHandler , historyHandler)


    port := os.Getenv("PORT")
    if port == "" {
        port = "5000"
    }

    log.Printf("Server starting on port %s 🚀", port)


    corsHandler := middleware.CheckCORS(r)


    log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}