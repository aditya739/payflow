package services

import (
	"errors"
	"payflow-backend/models"
	"payflow-backend/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type TransactionService struct {
	TransactionRepo *repository.TransactionRepository
	WalletRepo      *repository.WalletRepository
	DB              *gorm.DB
}

func NewTransactionService(transactionRepo *repository.TransactionRepository, walletRepo *repository.WalletRepository, db *gorm.DB) *TransactionService {
	return &TransactionService{TransactionRepo: transactionRepo, WalletRepo: walletRepo, DB: db}
}

func (s *TransactionService) TransferMoney(senderID, receiverID uuid.UUID, amount float64, idempotencyKey string) (*models.Transaction, error) {
	if senderID == receiverID {
		return nil, errors.New("cannot transfer money to yourself")
	}
	if amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	// Check idempotency
	existingTx, err := s.TransactionRepo.GetByIdempotencyKey(idempotencyKey)
	if err == nil {
		return existingTx, nil // Already processed or in progress
	}

	var transaction *models.Transaction

	err = s.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create PENDING transaction
		senderIDPtr := &senderID
		newTx := &models.Transaction{
			SenderID:       senderIDPtr,
			ReceiverID:     receiverID,
			Amount:         amount,
			Status:         models.StatusPending,
			IdempotencyKey: idempotencyKey,
		}

		if err := s.TransactionRepo.Create(tx, newTx); err != nil {
			return err
		}
		transaction = newTx

		// 2. Lock sender and receiver wallets
		// Ordering by ID avoids deadlocks when two users transfer to each other simultaneously.
		var firstID, secondID uuid.UUID
		if senderID.String() < receiverID.String() {
			firstID, secondID = senderID, receiverID
		} else {
			firstID, secondID = receiverID, senderID
		}

		var firstWallet, secondWallet models.Wallet
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", firstID).First(&firstWallet).Error; err != nil {
			return err
		}
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", secondID).First(&secondWallet).Error; err != nil {
			return err
		}

		senderWallet := &firstWallet
		receiverWallet := &secondWallet
		if senderWallet.UserID != senderID {
			senderWallet = &secondWallet
			receiverWallet = &firstWallet
		}

		// 3. Check balance
		if senderWallet.Balance < amount {
			s.TransactionRepo.UpdateStatus(tx, newTx.ID, models.StatusFailed)
			return errors.New("insufficient balance")
		}

		// 4. Update balances
		if err := s.WalletRepo.DeductBalance(tx, senderWallet.ID, amount); err != nil {
			return err
		}
		if err := s.WalletRepo.AddBalance(tx, receiverWallet.ID, amount); err != nil {
			return err
		}

		// 5. Mark SUCCESS
		if err := s.TransactionRepo.UpdateStatus(tx, newTx.ID, models.StatusSuccess); err != nil {
			return err
		}
		
		newTx.Status = models.StatusSuccess
		return nil
	})

	return transaction, err
}

func (s *TransactionService) GetUserTransactions(userID uuid.UUID, page, limit int) ([]models.Transaction, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.TransactionRepo.FindByUserID(userID, limit, offset)
}
