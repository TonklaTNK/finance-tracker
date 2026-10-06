CREATE TABLE accounts (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    account_name    VARCHAR(100)  NOT NULL,
    account_type    VARCHAR(20)   NOT NULL,
    initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    is_archived     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT chk_accounts_type
    CHECK (account_type IN ('cash', 'bank', 'credit_card', 'ewallet'))
);

CREATE TABLE categories (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    category_name   VARCHAR(100)  NOT NULL,
    category_type   VARCHAR(20)   NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT chk_category_type 
        CHECK (category_type IN ('income', 'expense'))
);

CREATE TABLE transactions (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           BIGINT        NOT NULL,
    transaction_type  VARCHAR(20)   NOT NULL,
    amount            NUMERIC(15,2) NOT NULL,
    account_id     BIGINT  NOT NULL  REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id    BIGINT            REFERENCES categories(id) ON DELETE RESTRICT,
    to_account_id  BIGINT            REFERENCES accounts(id) ON DELETE RESTRICT,
    occurred_at       DATE          NOT NULL,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT chk_transaction_type 
        CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    CONSTRAINT chk_transaction_amount 
        CHECK (amount > 0)
);

CREATE TABLE budgets (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    category_id  BIGINT  NOT NULL  REFERENCES categories(id) ON DELETE RESTRICT,
    budget_month DATE NOT NULL,
    amount       NUMERIC(15,2) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_budget_amount CHECK (amount > 0),
    CONSTRAINT uq_budget UNIQUE (user_id, category_id, budget_month)
);

CREATE INDEX idx_transactions_user_date 
    ON transactions (user_id, occurred_at DESC);