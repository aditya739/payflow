package services

import (
	"errors"
	"payflow-backend/models"
	"payflow-backend/repository"
	"payflow-backend/utils"
)

type AuthService struct {
	UserRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{UserRepo: userRepo}
}

func (s *AuthService) RegisterUser(name, email, password string, role models.Role) (*models.User, error) {
	// Check if user exists
	if _, err := s.UserRepo.FindByEmail(email); err == nil {
		return nil, errors.New("user with this email already exists")
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: hash,
		Role:         role,
	}

	// Create wallet automatically on registration
	user.Wallet = models.Wallet{Balance: 0}

	if err := s.UserRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) LoginUser(email, password string) (string, *models.User, error) {
	user, err := s.UserRepo.FindByEmail(email)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return "", nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
