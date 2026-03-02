package routes

import (
	"payflow-backend/controllers"
	"payflow-backend/middleware"
	"payflow-backend/repository"
	"payflow-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterTransactionRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	txRepo := repository.NewTransactionRepository(db)
	walletRepo := repository.NewWalletRepository(db)
	txService := services.NewTransactionService(txRepo, walletRepo, db)
	txController := controllers.NewTransactionController(txService)

	txRoutes := rg.Group("/transactions")
	txRoutes.Use(middleware.AuthMiddleware())
	{
		txRoutes.POST("/transfer", txController.TransferMoney)
		txRoutes.GET("/", txController.GetTransactions)
	}
}
