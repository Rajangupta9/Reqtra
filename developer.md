
# Developer README

This document provides a comprehensive overview of the project for developers. It covers the project structure, backend and frontend applications, database, authentication, and available scripts.

## Project Overview

This project is a web application with a Go backend and two frontend applications. One frontend is built with React and the Context API for state management, while the other is built with React and Zustand. The application appears to be a tool for testing and managing API requests, similar to Postman.

## Project Structure

The project is a monorepo with the following structure:

```
/
├── Backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   ├── handlers/
│   ├── models/
│   ├── ...
├── Frontend-context-Version/
│   ├── src/
│   ├── package.json
│   ├── ...
└── Frontend-Zustand-Version/
    ├── src/
    ├── package.json
    └── ...
```

*   **`Backend/`**: Contains the Go backend application.
*   **`Frontend-context-Version/`**: Contains the frontend application built with React and Context API.
*   **`Frontend-Zustand-Version/`**: Contains the frontend application built with React and Zustand.

## Backend

The backend is a Go application that provides a REST API for the frontend applications.

### Technologies

*   **Go**: The programming language used for the backend.
*   **Gorilla Mux**: A powerful URL router and dispatcher for Go.
*   **MongoDB**: The database used to store application data.
*   **JWT**: JSON Web Tokens are used for authentication.

### Setup

1.  **Install Go**: Make sure you have Go installed on your system.
2.  **Install dependencies**: Run `go mod download` in the `Backend/` directory to install the required dependencies.
3.  **Set up environment variables**: Create a `.env` file in the `Backend/` directory and add the following environment variables:
    *   `MONGO_URI`: The connection string for your MongoDB database.
    *   `DB_NAME`: The name of your database.
    *   `JWT_SECRET`: A secret key for signing JWTs.
    *   `PORT`: The port on which the backend server should run (e.g., `5000`).
4.  **Run the backend**: Run `go run main.go` in the `Backend/` directory to start the backend server.

### API Endpoints

The backend provides the following API endpoints:

*   `/register`: Register a new user.
*   `/login`: Log in an existing user.
*   `/google/login`: Log in with Google.
*   `/microsoft/login`: Log in with Microsoft.
*   `/workspace/create`: Create a new workspace.
*   `/workspace/get`: Get all workspaces for the current user.
*   `/collection/import`: Import a Postman collection.
*   `/collection/item/get`: Get all items in a collection.
*   `/collection/create`: Create a new collection.
*   `/request/create`: Create a new request.
*   `/request/update`: Update an existing request.
*   `/item/create`: Create a new item.
*   `/item/update`: Update an existing item.
*   `/item/retrieveAllRequest`: Retrieve all requests in an item.
*   `/collection/delete`: Delete a collection.
*   `/collection/update`: Update a collection.
*   `/item/delete`: Delete an item.
*   `/collection/get`: Get all collections for the current user.
*   `/proxy`: Proxy a request to a third-party API.
*   `/api/environments`: Get all environments for the current user.
*   `/api/environments/create`: Create a new environment.
*   `/api/environments/delete`: Delete an environment.
*   `/api/history/create`: Create a new request history entry.
*   `/api/history/user`: Get all request history for the current user.
*   `/api/history/delete`: Delete a request history entry.
*   `/api/history/clear`: Clear all request history for the current user.

## Frontend (Context API Version)

The frontend application built with React and the Context API.

### Technologies

*   **React**: A JavaScript library for building user interfaces.
*   **Context API**: A React feature for managing state.
*   **Material-UI**: A popular React UI framework.
*   **Vite**: A fast build tool for modern web projects.

### Setup

1.  **Install Node.js and npm**: Make sure you have Node.js and npm installed on your system.
2.  **Install dependencies**: Run `npm install` in the `Frontend-context-Version/` directory to install the required dependencies.
3.  **Run the frontend**: Run `npm run dev` in the `Frontend-context-Version/` directory to start the frontend development server.

## Frontend (Zustand Version)

The frontend application built with React and Zustand.

### Technologies

*   **React**: A JavaScript library for building user interfaces.
*   **Zustand**: A small, fast, and scalable state management solution for React.
*   **Material-UI**: A popular React UI framework.
*   **Vite**: A fast build tool for modern web projects.

### Setup

1.  **Install Node.js and npm**: Make sure you have Node.js and npm installed on your system.
2.  **Install dependencies**: Run `npm install` in the `Frontend-Zustand-Version/` directory to install the required dependencies.
3.  **Run the frontend**: Run `npm run dev` in the `Frontend-Zustand-Version/` directory to start the frontend development server.

## Database

The project uses MongoDB as its database. The backend connects to the database using the `mongo-go-driver`.

## Authentication

Authentication is implemented using JSON Web Tokens (JWTs). When a user logs in, the backend generates a JWT and sends it to the frontend. The frontend then includes the JWT in the `Authorization` header of all subsequent requests to the backend. The backend verifies the JWT to authenticate the user.

The project also supports authentication with Google and Microsoft.

## Available Scripts

The following scripts are available in the `Frontend-context-Version/` and `Frontend-Zustand-Version/` directories:

*   `npm run dev`: Starts the frontend development server.
*   `npm run build`: Builds the frontend for production.
*   `npm run lint`: Lints the frontend code.
*   `npm run preview`: Previews the production build of the frontend.
