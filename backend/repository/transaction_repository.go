package repository

import (
	"payflow-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionRepository struct {
	DB *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{DB: db}
}

func (r *TransactionRepository) Create(tx *gorm.DB, transaction *models.Transaction) error {
	return tx.Create(transaction).Error
}

func (r *TransactionRepository) GetByIdempotencyKey(key string) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.DB.Where("idempotency_key = ?", key).First(&transaction).Error
	return &transaction, err
}

func (r *TransactionRepository) FindByUserID(userID uuid.UUID, limit, offset int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.DB.Model(&models.Transaction{}).Where("sender_id = ? OR receiver_id = ?", userID, userID)

	query.Count(&total)
	err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&transactions).Error

	return transactions, total, err
}

func (r *TransactionRepository) UpdateStatus(tx *gorm.DB, id uuid.UUID, status models.TransactionStatus) error {
	return tx.Model(&models.Transaction{}).Where("id = ?", id).Update("status", status).Error
}
