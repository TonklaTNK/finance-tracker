package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Account struct {
	ID          int64  `json:"id"`
	AccountName string `json:"account_name"`
}

type Transaction struct {
	ID              int64     `json:"id"`
	TransactionType string    `json:"transaction_type"`
	Amount          float64   `json:"amount"`
	AccountID       int64     `json:"account_id"`
	CategoryID      *int64    `json:"category_id"`
	ToAccountID     *int64    `json:"to_account_id"`
	Note            *string   `json:"note"`
	OccurredAt      time.Time `json:"occurred_at"`
}

type Category struct {
	ID           int64  `json:"id"`
	CategoryName string `json:"category_name"`
	CategoryType string `json:"category_type"`
}

type Summary struct {
	Month   string  `json:"month"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

type AccountBalance struct {
	AccountID int64   `json:"account_id"`
	Balance   float64 `json:"balance"`
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("โหลด .env ไม่ได้")
	}
	dbURL := os.Getenv("DATABASE_URL")
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal("ต่อ database ไม่ได้:", err)
	}
	defer pool.Close()
	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatal("Ping database ไม่ผ่าน:", err)
	}
	fmt.Println("ต่อ database สำเร็จ!")

	mux := http.NewServeMux()

	//func start Get transactions
	mux.HandleFunc("GET /transactions", func(w http.ResponseWriter, r *http.Request) {
		pageStr := r.URL.Query().Get("page")
		page, _ := strconv.Atoi(pageStr)

		if page < 1 {
			page = 1
		}
		limit := 5
		offset := (page - 1) * limit

		filterType := r.URL.Query().Get("type")
		filterAccount := r.URL.Query().Get("account_id")
		filterMonth := r.URL.Query().Get("month")
		condition := []string{}
		args := []interface{}{}

		if filterType != "" {
			args = append(args, filterType)
			condition = append(condition, fmt.Sprintf("transaction_type = $%d", len(args)))
		}

		if filterAccount != "" {
			args = append(args, filterAccount)
			condition = append(condition, fmt.Sprintf("account_id = $%d", len(args)))
		}

		if filterMonth != "" {
			t, err := time.Parse("2006-01", filterMonth)
			if err != nil {
				http.Error(w, "invalid month format", http.StatusBadRequest)
				return
			}
			filterStart := t
			filterEnd := t.AddDate(0, 1, 0)
			args = append(args, filterStart)
			condition = append(condition, fmt.Sprintf("occurred_at >= $%d", len(args)))

			args = append(args, filterEnd)
			condition = append(condition, fmt.Sprintf("occurred_at < $%d", len(args)))
		}
		whereClause := ""
		if len(condition) > 0 {
			whereClause = "WHERE " + strings.Join(condition, " AND ")
		}

		countQuery := "SELECT COUNT(*) FROM transactions " + whereClause
		var total int
		pool.QueryRow(context.Background(), countQuery, args...).Scan(&total)
		totalPage := (total + limit - 1) / limit

		query := fmt.Sprintf("SELECT id, transaction_type, amount, account_id, category_id, to_account_id, note, occurred_at FROM transactions %s LIMIT $%d OFFSET $%d", whereClause, len(args)+1, len(args)+2)
		args = append(args, limit, offset)
		rows, err := pool.Query(context.Background(), query, args...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// var txs []Transaction
		txs := []Transaction{}

		for rows.Next() {
			var tx Transaction
			err := rows.Scan(&tx.ID, &tx.TransactionType, &tx.Amount, &tx.AccountID, &tx.CategoryID, &tx.ToAccountID, &tx.Note, &tx.OccurredAt)
			if err != nil {
				log.Println("scan error:", err)
				return
			}
			txs = append(txs, tx)
		}
		response := map[string]interface{}{
			"data":        txs,
			"total":       total,
			"total_pages": totalPage,
		}
		data, marshalErr := json.Marshal(response)
		if marshalErr != nil {
			return
		}

		w.Write(data)
	})
	//func End Get transactions

	//func End POST transactions
	mux.HandleFunc("POST /transactions", func(w http.ResponseWriter, r *http.Request) {
		var newTx Transaction
		err := json.NewDecoder(r.Body).Decode(&newTx)
		if err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		err = pool.QueryRow(context.Background(),
			"INSERT INTO transactions (user_id, transaction_type, amount, account_id, category_id, to_account_id, note, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
			1, newTx.TransactionType, newTx.Amount, newTx.AccountID, newTx.CategoryID, newTx.ToAccountID, newTx.Note, newTx.OccurredAt,
		).Scan(&newTx.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		data, marshalErr := json.Marshal(newTx)
		if marshalErr != nil {
			return
		}
		w.Write(data)
	})
	//func End POST transactions

	//func Start PUT transactions
	mux.HandleFunc("PUT /transactions/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		var updatedTx Transaction
		decodeErr := json.NewDecoder(r.Body).Decode(&updatedTx)
		if decodeErr != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		result, execErr := pool.Exec(context.Background(),
			"UPDATE transactions SET transaction_type = $1, amount = $2, account_id = $3, category_id = $4, to_account_id = $5, note = $6, occurred_at = $7 WHERE id = $8",
			updatedTx.TransactionType, updatedTx.Amount, updatedTx.AccountID, updatedTx.CategoryID, updatedTx.ToAccountID, updatedTx.Note, updatedTx.OccurredAt, id,
		)
		if execErr != nil {
			http.Error(w, execErr.Error(), http.StatusInternalServerError)
			return
		}

		if result.RowsAffected() == 0 {
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprint(w, "ไม่พบ transaction นี้")
			return
		}

		fmt.Fprint(w, "แก้ไขสำเร็จ")
	})
	//func End PUT transactions

	//func Start DELETE transactions
	mux.HandleFunc("DELETE /transactions/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		result, err := pool.Exec(context.Background(),
			"DELETE FROM transactions WHERE id = $1",
			id,
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if result.RowsAffected() == 0 {
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprint(w, "ไม่พบ transaction นี้")
			return
		}
		fmt.Fprint(w, "ลบข้อมูลสำเร็จ")
	})
	//func End DELETE transactions

	//func start categories
	mux.HandleFunc("GET /categories", func(w http.ResponseWriter, r *http.Request) {
		rows, err := pool.Query(context.Background(), "SELECT id, category_name, category_type FROM categories")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		categories := []Category{}
		for rows.Next() {
			var c Category
			rows.Scan(&c.ID, &c.CategoryName, &c.CategoryType)
			categories = append(categories, c)
		}

		data, marshalErr := json.Marshal(categories)
		if marshalErr != nil {
			return
		}
		w.Write(data)
	})
	//func End categories

	//func start accounts
	mux.HandleFunc("GET /accounts", func(w http.ResponseWriter, r *http.Request) {
		rows, err := pool.Query(context.Background(), "SELECT id, account_name FROM accounts")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		accounts := []Account{}
		for rows.Next() {
			var a Account
			rows.Scan(&a.ID, &a.AccountName)
			accounts = append(accounts, a)
		}

		data, marshalErr := json.Marshal(accounts)
		if marshalErr != nil {
			return
		}
		w.Write(data)
	})
	//func End accounts

	//func start Month
	mux.HandleFunc("GET /months", func(w http.ResponseWriter, r *http.Request) {
		rows, err := pool.Query(context.Background(), "SELECT DISTINCT TO_CHAR(occurred_at, 'YYYY-MM') FROM transactions ORDER BY TO_CHAR(occurred_at, 'YYYY-MM') DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		month := []string{}
		for rows.Next() {
			var m string
			rows.Scan(&m)
			month = append(month, m)
		}
		json.NewEncoder(w).Encode(month)
	})
	//func End Month

	//func start summary
	mux.HandleFunc("GET /summary", func(w http.ResponseWriter, r *http.Request) {
		rows, err := pool.Query(context.Background(),
			`SELECT TO_CHAR(occurred_at, 'YYYY-MM') AS month,
    		SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS income,
    		SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS expense
			FROM transactions
			GROUP BY TO_CHAR(occurred_at, 'YYYY-MM')
			ORDER BY TO_CHAR(occurred_at, 'YYYY-MM')`)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		summary := []Summary{}
		for rows.Next() {
			var s Summary
			rows.Scan(&s.Month, &s.Income, &s.Expense)
			summary = append(summary, s)
		}
		json.NewEncoder(w).Encode(summary)
	})
	//func end summary

	//func start accounts/balance
	mux.HandleFunc("GET /accounts/balance", func(w http.ResponseWriter, r *http.Request) {
		rows, err := pool.Query(context.Background(),
			`SELECT account_id, SUM(balance) AS balance
		FROM (
		SELECT account_id, SUM(CASE 
				WHEN transaction_type = 'income' THEN amount
				WHEN transaction_type = 'expense' THEN -amount
				WHEN transaction_type = 'transfer' THEN -amount
				ELSE 0 END) AS balance
		FROM transactions
		GROUP BY account_id

		UNION ALL

		SELECT to_account_id AS account_id, SUM(amount) AS balance
		FROM transactions
		WHERE transaction_type = 'transfer'
		GROUP BY to_account_id

		) AS combined
		GROUP BY account_id
		ORDER BY account_id`)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		balances := []AccountBalance{}
		for rows.Next() {
			var b AccountBalance
			rows.Scan(&b.AccountID, &b.Balance)
			balances = append(balances, b)
		}
		json.NewEncoder(w).Encode(balances)
	})
	//func end accounts/balance

	http.ListenAndServe(":8080", withCORS(mux))
}
