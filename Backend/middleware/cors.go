package middleware

import (
	"net/http"
	"slices"
	"strings"
)


var methodAllowlist = []string{
	"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" , "HEAD",
}

func isPreflight(r *http.Request) bool {
	return r.Method == http.MethodOptions &&
		r.Header.Get("Origin") != "" &&
		r.Header.Get("Access-Control-Request-Method") != ""
}

func CheckCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		method := r.Header.Get("Access-Control-Request-Method")
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Add("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Expose-Headers", "*")

			if isPreflight(r) && slices.Contains(methodAllowlist, method) {
				w.Header().Set("Access-Control-Allow-Methods", strings.Join(methodAllowlist, ", "))
				w.Header().Set("Access-Control-Allow-Headers", "*"  )
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.WriteHeader(http.StatusNoContent)
				return
			}
		next.ServeHTTP(w, r)
	})
}
