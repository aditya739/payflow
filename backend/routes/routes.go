package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api/v1")

	// Health check
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP", "message": "PayFlow API is running"})
	})

	// Register Routes
	RegisterAuthRoutes(api, db)
	RegisterWalletRoutes(api, db)
	RegisterTransactionRoutes(api, db)
	RegisterAdminRoutes(api, db)
}
