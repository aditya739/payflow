package routes

import (
	"payflow-backend/controllers"
	"payflow-backend/middleware"
	"payflow-backend/repository"
	"payflow-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAdminRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	adminRepo := repository.NewAdminRepository(db)
	adminService := services.NewAdminService(adminRepo)
	adminController := controllers.NewAdminController(adminService)

	admin := rg.Group("/admin")
	// Require Auth AND Admin roles
	admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
	{
		admin.GET("/users", adminController.GetAllUsers)
		admin.GET("/transactions", adminController.GetAllTransactions)
		admin.GET("/metrics", adminController.GetDashboardMetrics)
	}
}
