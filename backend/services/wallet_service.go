package services

import (
	"errors"
	"payflow-backend/models"
	"payflow-backend/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WalletService struct {
	WalletRepo *repository.WalletRepository
	DB         *gorm.DB
}

func NewWalletService(walletRepo *repository.WalletRepository, db *gorm.DB) *WalletService {
	return &WalletService{WalletRepo: walletRepo, DB: db}
}

func (s *WalletService) GetBalance(userID uuid.UUID) (*models.Wallet, error) {
	return s.WalletRepo.FindByUserID(userID)
}

func (s *WalletService) AddMoney(userID uuid.UUID, amount float64) (*models.Wallet, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	var updatedWallet *models.Wallet

	err := s.DB.Transaction(func(tx *gorm.DB) error {
		wallet, err := s.WalletRepo.FindByUserID(userID)
		if err != nil {
			return err
		}

		if err := s.WalletRepo.AddBalance(tx, wallet.ID, amount); err != nil {
			return err
		}

		// Record a transaction for adding money
		depositTx := &models.Transaction{
			SenderID:       nil,
			ReceiverID:     userID,
			Amount:         amount,
			Status:         models.StatusSuccess,
			IdempotencyKey: "DEPOSIT-" + uuid.New().String(),
		}

		if err := tx.Create(depositTx).Error; err != nil {
			return err
		}

		// Fetch the latest wallet balance to return
		var latest models.Wallet
		tx.Where("id = ?", wallet.ID).First(&latest)
		updatedWallet = &latest

		return nil
	})

	return updatedWallet, err
}
