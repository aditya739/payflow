package controllers

import (
	"net/http"
	"payflow-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WalletController struct {
	WalletService *services.WalletService
}

func NewWalletController(walletService *services.WalletService) *WalletController {
	return &WalletController{WalletService: walletService}
}

func (ctrl *WalletController) GetBalance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userUUID := userID.(uuid.UUID)
	wallet, err := ctrl.WalletService.GetBalance(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"wallet": wallet})
}

type AddMoneyRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

func (ctrl *WalletController) AddMoney(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userUUID := userID.(uuid.UUID)

	var req AddMoneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wallet, err := ctrl.WalletService.AddMoney(userUUID, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Money added successfully", "wallet": wallet})
}
