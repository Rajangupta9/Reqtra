package utils

import (
	"errors"
	"reqtra/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func GenerateTokens(userID string) (accessToken string, err error) {

	accessClaims := AuthClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	accessToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(config.JwtSecret)

	if err != nil {
		return "", err
	}
	// fmt.Println("Generation" , config.JwtSecret)
	return accessToken, nil
}

func ValidateJwt(tokenString string) (string, error) {

	token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(t *jwt.Token) (interface{}, error) {

		// fmt.Println("Token alg:", t.Header["alg"])
		// if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
		// 	return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		// }
		return config.JwtSecret, nil
	})
	// fmt.Println(tokenString);
	// fmt.Println("verification" ,  config.JwtSecret)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", errors.New("token has expired")
		}
		return "", errors.New("invalid token" + err.Error())
	}

	if claims, ok := token.Claims.(*AuthClaims); ok && token.Valid {
		return claims.UserID, nil
	}

	return "", errors.New("invalid token")
}
