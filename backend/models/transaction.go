package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionStatus string

const (
	StatusPending TransactionStatus = "PENDING"
	StatusSuccess TransactionStatus = "SUCCESS"
	StatusFailed  TransactionStatus = "FAILED"
)

type Transaction struct {
	ID             uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SenderID       *uuid.UUID        `gorm:"type:uuid;index" json:"sender_id"` // null for initial deposit
	ReceiverID     uuid.UUID         `gorm:"type:uuid;index;not null" json:"receiver_id"`
	Amount         float64           `gorm:"type:decimal(12,2);not null" json:"amount"`
	Status         TransactionStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	IdempotencyKey string            `gorm:"uniqueIndex;not null" json:"idempotency_key"`
	CreatedAt      time.Time         `json:"created_at"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}
