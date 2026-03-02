package services

import (
	"payflow-backend/models"
	"payflow-backend/repository"
)

type AdminService struct {
	AdminRepo *repository.AdminRepository
}

func NewAdminService(adminRepo *repository.AdminRepository) *AdminService {
	return &AdminService{AdminRepo: adminRepo}
}

func (s *AdminService) GetAllUsers() ([]models.User, error) {
	return s.AdminRepo.GetAllUsers()
}

func (s *AdminService) GetAllTransactions(page, limit int) ([]models.Transaction, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.AdminRepo.GetAllTransactions(limit, offset)
}

func (s *AdminService) GetDashboardMetrics() (map[string]interface{}, error) {
	return s.AdminRepo.GetDashboardMetrics()
}
