package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var JwtSecret []byte

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, loading from system environment")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable not set")
	}

	JwtSecret = []byte(strings.TrimSpace(secret))

}
