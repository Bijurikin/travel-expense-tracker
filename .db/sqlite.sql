CREATE TABLE expenses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    image TEXT,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    kilometers DECIMAL(10,2),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_expenses_date ON expenses(date);

CREATE TRIGGER update_expenses_updated_at 
    AFTER UPDATE ON expenses
BEGIN
    UPDATE expenses SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;
