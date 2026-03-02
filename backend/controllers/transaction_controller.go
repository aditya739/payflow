package controllers

import (
	"net/http"
	"payflow-backend/services"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TransactionController struct {
	TransactionService *services.TransactionService
}

func NewTransactionController(transactionService *services.TransactionService) *TransactionController {
	return &TransactionController{TransactionService: transactionService}
}

type TransferRequest struct {
	ReceiverID     uuid.UUID `json:"receiver_id" binding:"required"`
	Amount         float64   `json:"amount" binding:"required,gt=0"`
	IdempotencyKey string    `json:"idempotency_key" binding:"required"`
}

func (ctrl *TransactionController) TransferMoney(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	senderID := userID.(uuid.UUID)

	var req TransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction, err := ctrl.TransactionService.TransferMoney(senderID, req.ReceiverID, req.Amount, req.IdempotencyKey)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transfer processed", "transaction": transaction})
}

func (ctrl *TransactionController) GetTransactions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userUUID := userID.(uuid.UUID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	transactions, total, err := ctrl.TransactionService.GetUserTransactions(userUUID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  transactions,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
