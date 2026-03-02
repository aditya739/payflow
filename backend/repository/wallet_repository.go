package repository

import (
	"payflow-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WalletRepository struct {
	DB *gorm.DB
}

func NewWalletRepository(db *gorm.DB) *WalletRepository {
	return &WalletRepository{DB: db}
}

func (r *WalletRepository) FindByUserID(userID uuid.UUID) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.DB.Where("user_id = ?", userID).First(&wallet).Error
	return &wallet, err
}

func (r *WalletRepository) AddBalance(tx *gorm.DB, walletID uuid.UUID, amount float64) error {
	return tx.Model(&models.Wallet{}).Where("id = ?", walletID).Update("balance", gorm.Expr("balance + ?", amount)).Error
}

func (r *WalletRepository) DeductBalance(tx *gorm.DB, walletID uuid.UUID, amount float64) error {
	return tx.Model(&models.Wallet{}).Where("id = ?", walletID).Update("balance", gorm.Expr("balance - ?", amount)).Error
}
