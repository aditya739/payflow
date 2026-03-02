package main

import (
	"log"
	"payflow-backend/config"
	"payflow-backend/models"
	"payflow-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	config.ConnectDB()
	config.ConnectRedis()

	// Auto-migrate database models here later
	models.Migrate(config.DB)

	r := gin.Default()
	routes.SetupRouter(r, config.DB)

	port := config.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}
