package repository

import (
	"payflow-backend/models"

	"gorm.io/gorm"
)

type AdminRepository struct {
	DB *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{DB: db}
}

func (r *AdminRepository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.DB.Omit("PasswordHash").Preload("Wallet").Find(&users).Error
	return users, err
}

func (r *AdminRepository) GetAllTransactions(limit, offset int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.DB.Model(&models.Transaction{})

	query.Count(&total)
	err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&transactions).Error

	return transactions, total, err
}

func (r *AdminRepository) GetDashboardMetrics() (map[string]interface{}, error) {
	var totalUsers int64
	var totalTransactions int64
	var totalVolume float64

	if err := r.DB.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Model(&models.Transaction{}).Count(&totalTransactions).Error; err != nil {
		return nil, err
	}

	if err := r.DB.Model(&models.Transaction{}).Select("COALESCE(SUM(amount), 0)").Where("status = ?", models.StatusSuccess).Scan(&totalVolume).Error; err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_users":        totalUsers,
		"total_transactions": totalTransactions,
		"total_volume":       totalVolume,
	}, nil
}
