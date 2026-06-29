package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reqtra/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserExists         = errors.New("user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotFound       = errors.New("user not found")
)

type UserService struct {
	collection *mongo.Collection
	httpClient *http.Client
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{
		collection: db.Collection("users"),
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *UserService) Register(ctx context.Context, username, email, password string) (*models.User, error) {

	var existingUser models.User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		return nil, ErrUserExists
	}
	if err != mongo.ErrNoDocuments {
		return nil, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        primitive.NewObjectID(),
		Username:  username,
		Email:     email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = s.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (*models.User, error) {
	var user models.User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	return &user, nil
}

func (s *UserService) findOrCreateUserByEmail(ctx context.Context, email, username string) (*models.User, error) {
	var user models.User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)

	if err == mongo.ErrNoDocuments {
		newUser := &models.User{
			ID:        primitive.NewObjectID(),
			Username:  username,
			Email:     email,
			Password:  "",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if _, insertErr := s.collection.InsertOne(ctx, newUser); insertErr != nil {
			return nil, insertErr
		}
		return newUser, nil
	} else if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) GoogleLogin(ctx context.Context, token string) (*models.User, error) {
	userInfoURL := "https://www.googleapis.com/oauth2/v3/userinfo"
	reqAPI, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
	if err != nil {
		return nil, err
	}
	reqAPI.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(reqAPI)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("invalid google token")
	}

	var userInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return s.findOrCreateUserByEmail(ctx, userInfo.Email, userInfo.Name)
}

func (s *UserService) MicrosoftLogin(ctx context.Context, token string) (*models.User, error) {
	graphURL := "https://graph.microsoft.com/v1.0/me"
	reqAPI, err := http.NewRequestWithContext(ctx, "GET", graphURL, nil)
	if err != nil {
		return nil, err
	}
	reqAPI.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(reqAPI)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("invalid microsoft token")
	}

	var userInfo struct {
		DisplayName       string `json:"displayName"`
		Mail              string `json:"mail"`
		UserPrincipalName string `json:"userPrincipalName"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	email := userInfo.Mail
	if email == "" {
		email = userInfo.UserPrincipalName
	}

	return s.findOrCreateUserByEmail(ctx, email, userInfo.DisplayName)
}

func (s *UserService) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return &user, nil
}
