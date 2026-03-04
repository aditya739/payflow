package main

import (
	"log"
	"payflow-backend/config"
	"payflow-backend/models"
	"payflow-backend/routes"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	config.ConnectDB()
	config.ConnectRedis()

	// Auto-migrate database models here later
	models.Migrate(config.DB)

	r := gin.Default()

	// Add CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Ideally replace * with the exact frontend domain (e.g. http://localhost:50432) in production
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.SetupRouter(r, config.DB)

	port := config.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}
