-- =======================================================
-- Secure Banking Management System
-- Initial Seed Data
-- =======================================================

USE banking_db;

-- Passwords hashed using BCrypt:
-- 'Admin@123'   -> $2a$10$wO0I8o2eB5b5G.l222k.4OF0jNl79x/d0wV8mXUv/U3.r/p6jSsmO
-- 'Vaibhav@123' -> $2a$10$7Z.XmNlA20ZcE4jM9p5Vf.wHh1s82pXyU3RkQW8O0I8o2eB5b5G.l
-- 'Priya@123'   -> $2a$10$rG1K4fU4yE6iA0jL2p8We.xJg3t94rZzV5SlRX9P1J9p3fC6c6H.m

-- Note: The Spring Boot backend automatically seeds this data via DataInitializer if tables are empty.

INSERT INTO users (id, full_name, email, password, phone, role, created_at)
VALUES 
(1, 'System Administrator', 'admin@bank.com', '$2a$10$mB5w73K22I63OaC3hO1l.ehR8pZ4m18gIqmT980wX4uGzUvhKlyte', '9876543210', 'ROLE_ADMIN', NOW()),
(2, 'Vaibhav Lakde', 'vaibhav@gmail.com', '$2a$10$mB5w73K22I63OaC3hO1l.ehR8pZ4m18gIqmT980wX4uGzUvhKlyte', '9322963704', 'ROLE_CUSTOMER', NOW()),
(3, 'Priya Sharma', 'priya@gmail.com', '$2a$10$mB5w73K22I63OaC3hO1l.ehR8pZ4m18gIqmT980wX4uGzUvhKlyte', '9811223344', 'ROLE_CUSTOMER', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO accounts (id, account_number, ifsc_code, account_type, balance, status, user_id, created_at, updated_at)
VALUES
(1, '1001002026', 'SBMS0001024', 'SAVINGS', 75450.00, 'ACTIVE', 2, NOW(), NOW()),
(2, '1001002027', 'SBMS0001024', 'CURRENT', 42800.00, 'ACTIVE', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE balance=VALUES(balance);

INSERT INTO transactions (id, reference_number, account_id, target_account_number, transaction_type, amount, post_balance, description, status, timestamp)
VALUES
(1, 'DEP2609010001', 1, NULL, 'DEPOSIT', 80000.00, 80000.00, 'Monthly Salary Credit - Cyber Success', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'WTH2609020002', 1, NULL, 'WITHDRAWAL', 2500.00, 77500.00, 'ATM Cash Withdrawal - FC Road Pune', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'TRF2609030003', 1, '1001002027', 'TRANSFER_SEND', 2050.00, 75450.00, 'Rent & Utility share to Priya', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'TRF2609030003-REC', 2, '1001002026', 'TRANSFER_RECEIVE', 2050.00, 42800.00, 'Transfer from Vaibhav Lakde', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE amount=VALUES(amount);
