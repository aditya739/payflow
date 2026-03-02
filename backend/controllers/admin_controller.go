package controllers

import (
	"net/http"
	"payflow-backend/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	AdminService *services.AdminService
}

func NewAdminController(adminService *services.AdminService) *AdminController {
	return &AdminController{AdminService: adminService}
}

func (ctrl *AdminController) GetAllUsers(c *gin.Context) {
	users, err := ctrl.AdminService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": users})
}

func (ctrl *AdminController) GetAllTransactions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	transactions, total, err := ctrl.AdminService.GetAllTransactions(page, limit)
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

func (ctrl *AdminController) GetDashboardMetrics(c *gin.Context) {
	metrics, err := ctrl.AdminService.GetDashboardMetrics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": metrics})
}
