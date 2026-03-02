package routes

import (
	"payflow-backend/controllers"
	"payflow-backend/middleware"
	"payflow-backend/repository"
	"payflow-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterWalletRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	walletRepo := repository.NewWalletRepository(db)
	walletService := services.NewWalletService(walletRepo, db)
	walletController := controllers.NewWalletController(walletService)

	wallet := rg.Group("/wallet")
	wallet.Use(middleware.AuthMiddleware())
	{
		wallet.GET("/balance", walletController.GetBalance)
		wallet.POST("/add-money", walletController.AddMoney)
	}
}
