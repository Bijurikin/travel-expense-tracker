-- Create the expenses table
CREATE TABLE expenses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    image VARCHAR(MAX),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    date DATETIME NOT NULL,
    kilometers DECIMAL(10,2),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create an index on the date field for better query performance
CREATE INDEX idx_expenses_date ON expenses(date);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER trg_expenses_update
ON expenses
AFTER UPDATE
AS
BEGIN
    UPDATE expenses
    SET updated_at = GETDATE()
    FROM expenses e
    INNER JOIN inserted i ON e.id = i.id;
END;
