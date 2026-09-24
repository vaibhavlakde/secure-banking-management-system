# Secure Banking Management System (NexBank)
## Complete End-to-End System Documentation

**Author:** [Vaibhav Lakde](https://linkedin.com/in/vaibhav-lakde-1a4406331) *(Java Full Stack Developer)*  
**Repository:** [github.com/vaibhavlakde/secure-banking-management-system](https://github.com/vaibhavlakde/secure-banking-management-system)  
**Technology Stack:** Java 17, Spring Boot 3.3.4, Spring Security 6, Hibernate ORM 6.5, MySQL 8.0, React 18, Tailwind CSS, Vite, JJWT 0.12.6

---

## 📑 Table of Contents

1. [System Architectural Overview](#1-system-architectural-overview)
2. [Project File Structure Map](#2-project-file-structure-map)
3. [Backend Deep Dive (`/backend`)](#3-backend-deep-dive-backend)
   - [Core Entrypoint](#core-entrypoint)
   - [Entity Layer (`/entity`)](#entity-layer-entity)
   - [Data Transfer Objects (`/dto`)](#data-transfer-objects-dto)
   - [Repository Layer (`/repository`)](#repository-layer-repository)
   - [Security & JWT Engine (`/security`)](#security--jwt-engine-security)
   - [Service Layer (`/service`)](#service-layer-service)
   - [Controller Layer (`/controller`)](#controller-layer-controller)
   - [Exception Handling (`/exception`)](#exception-handling-exception)
   - [Configuration & Resources (`/resources`)](#configuration--resources-resources)
   - [Testing Suite (`/src/test`)](#testing-suite-srctest)
4. [Frontend Deep Dive (`/frontend`)](#4-frontend-deep-dive-frontend)
   - [Build & Configuration](#frontend-build--configuration)
   - [Service Layer (`/services/api.js`)](#api-service-layer)
   - [Core Components (`/components`)](#core-components-components)
   - [Master Application (`App.jsx`)](#master-application-appjsx)
5. [Database Architecture (`/database`)](#5-database-architecture-database)
   - [Schema DDL (`schema.sql`)](#schema-ddl-schemasql)
   - [Seed Dataset (`seed.sql`)](#seed-dataset-seedsql)
6. [CI/CD & DevOps (`/.github`)](#6-cicd--devops-github)
7. [End-to-End Execution & Workflows](#7-end-to-end-execution--workflows)
   - [User Authentication Flow](#user-authentication-flow)
   - [Atomic Fund Transfer Flow](#atomic-fund-transfer-flow)
   - [Account Lifecycle & Status Guard](#account-lifecycle--status-guard)
8. [Setup, Installation & Running Guide](#8-setup-installation--running-guide)
9. [Interview Q&A & Resume Alignment](#9-interview-qa--resume-alignment)

---

## 1. System Architectural Overview

The application follows a **layered, decoupled enterprise architecture** ensuring separation of concerns, high maintainability, defense-in-depth security, and database transaction integrity:

```
┌─────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (React 18 + Vite)              │
│  - Tailwind CSS Glassmorphism UI                                │
│  - Virtual Platinum Debit Card Component                        │
│  - Interactive Ledger, Transfer Modal & Digital Receipts        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS / REST (JSON + JWT)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              SECURITY FILTER CHAIN (Spring Security 6)          │
│  - CORS Pre-flight & Origin Authorization                       │
│  - OncePerRequestFilter (Bearer Token Interceptor)             │
│  - JJWT 0.12.6 HMAC-SHA256 Token Validation                     │
│  - SecurityContextHolder (UserDetailsImpl)                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             CONTROLLER LAYER (Spring Web @RestController)       │
│  - AuthController, AccountController,                           │
│    TransactionController, AdminController                       │
│  - JSR-380 Bean Validation (@Valid, @NotNull, @DecimalMin)      │
│  - GlobalExceptionHandler (@RestControllerAdvice)               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               BUSINESS SERVICE LAYER (@Service)                 │
│  - AuthService, AccountService, TransactionService, AdminService│
│  - ACID Isolation: @Transactional(isolation = REPEATABLE_READ)  │
│  - Double-Entry Ledger Bookkeeping                              │
│  - Overdraft & Frozen Account Guards                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             DATA ACCESS & ORM LAYER (Spring Data JPA)           │
│  - Hibernate 6.5 Object-Relational Mapping                      │
│  - UserRepository, AccountRepository, TransactionRepository     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ JDBC
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE STORAGE                        │
│  - MySQL 8.0 (Production / Staging)                             │
│  - H2 Database (In-Memory / Persistent Standalone Zero-Config)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project File Structure Map

```
secure-banking-management-system/
├── .github/
│   └── workflows/
│       └── ci.yml                         # Automated GitHub Actions CI pipeline
├── backend/
│   ├── pom.xml                            # Maven project definition and dependencies
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bank/securebanking/
│   │   │   │   ├── SecureBankingApplication.java      # Spring Boot main entrypoint
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AccountController.java         # Account REST endpoints
│   │   │   │   │   ├── AdminController.java           # Admin oversight REST endpoints
│   │   │   │   │   ├── AuthController.java            # Login & registration endpoints
│   │   │   │   │   └── TransactionController.java     # Financial operations endpoints
│   │   │   │   ├── dto/
│   │   │   │   │   ├── AccountDto.java                # Account data envelope
│   │   │   │   │   ├── ApiResponse.java               # Standardized response wrapper
│   │   │   │   │   ├── AuthRequest.java               # Login credentials payload
│   │   │   │   │   ├── AuthResponse.java              # JWT token response payload
│   │   │   │   │   ├── DashboardSummaryDto.java       # Bank reserve metrics DTO
│   │   │   │   │   ├── DepositRequest.java            # Cash credit request DTO
│   │   │   │   │   ├── RegisterRequest.java           # User signup request DTO
│   │   │   │   │   ├── TransactionDto.java            # Transaction receipt/item DTO
│   │   │   │   │   ├── TransferRequest.java           # Inter-account transfer DTO
│   │   │   │   │   └── WithdrawRequest.java           # ATM cash debit request DTO
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Account.java                   # JPA Account entity
│   │   │   │   │   ├── AccountStatus.java             # Enum: ACTIVE, FROZEN, CLOSED
│   │   │   │   │   ├── AccountType.java               # Enum: SAVINGS, CURRENT, FD
│   │   │   │   │   ├── Role.java                      # Enum: ROLE_CUSTOMER, ROLE_ADMIN
│   │   │   │   │   ├── Transaction.java               # JPA Transaction entity
│   │   │   │   │   ├── TransactionStatus.java         # Enum: SUCCESS, PENDING, FAILED
│   │   │   │   │   ├── TransactionType.java           # Enum: DEPOSIT, WITHDRAWAL, etc.
│   │   │   │   │   └── User.java                      # JPA User entity
│   │   │   │   ├── exception/
│   │   │   │   │   ├── AccountFrozenException.java    # HTTP 403 Forbidden
│   │   │   │   │   ├── BankingApiException.java       # Generic API exception
│   │   │   │   │   ├── GlobalExceptionHandler.java    # @RestControllerAdvice
│   │   │   │   │   ├── InsufficientBalanceException.java # HTTP 400 Bad Request
│   │   │   │   │   └── ResourceNotFoundException.java # HTTP 404 Not Found
│   │   │   │   ├── repository/
│   │   │   │   │   ├── AccountRepository.java         # Spring Data Account queries
│   │   │   │   │   ├── TransactionRepository.java     # Spring Data Ledger queries
│   │   │   │   │   └── UserRepository.java            # Spring Data User queries
│   │   │   │   ├── security/
│   │   │   │   │   ├── AuthEntryPointJwt.java         # 401 Unauthorized handler
│   │   │   │   │   ├── AuthTokenFilter.java           # JWT bearer token extractor
│   │   │   │   │   ├── JwtUtils.java                  # HMAC-SHA256 token generator
│   │   │   │   │   ├── SecurityConfig.java            # SecurityFilterChain & CORS
│   │   │   │   │   ├── UserDetailsImpl.java           # Spring Security Principal
│   │   │   │   │   └── UserDetailsServiceImpl.java    # User loader by email
│   │   │   │   └── service/
│   │   │   │       ├── AccountService.java            # Account business logic
│   │   │   │       ├── AdminService.java              # Admin analytics & status logic
│   │   │   │       ├── AuthService.java               # Login & signup business logic
│   │   │   │       ├── DataInitializer.java           # CommandLineRunner demo seeder
│   │   │   │       └── TransactionService.java        # ACID financial transactions
│   │   │   └── resources/
│   │   │       ├── application.properties         # Primary config (MySQL & fallback)
│   │   │       └── application-h2.properties      # Zero-config H2 profile
│   │   └── test/java/com/bank/securebanking/
│   │       └── SecureBankingApplicationTests.java # Context loading integration test
├── database/
│   ├── schema.sql                                 # MySQL 8.0 DDL script
│   └── seed.sql                                   # Seed demo users & transactions
├── frontend/
│   ├── index.html                                 # Single Page Application HTML root
│   ├── package.json                               # NPM scripts & dependencies
│   ├── postcss.config.js                          # PostCSS Tailwind plugin
│   ├── tailwind.config.js                         # Custom fintech theme config
│   ├── vite.config.js                             # Vite bundler configuration
│   └── src/
│       ├── main.jsx                               # React DOM bootstrap
│       ├── index.css                              # Tailwind & glassmorphism directives
│       ├── App.jsx                                # Main dashboard controller component
│       ├── App.css                                # Component animation rules
│       ├── components/
│       │   ├── AdminPanel.jsx                     # Bank reserves & account freeze UI
│       │   ├── DebitCard.jsx                      # Virtual Platinum card component
│       │   ├── DepositWithdrawModal.jsx           # Deposit & cash withdrawal modal
│       │   ├── LoginModal.jsx                     # 1-Click demo authentication modal
│       │   ├── Navbar.jsx                         # Top header with account switcher
│       │   ├── Sidebar.jsx                        # Left navigation & security card
│       │   ├── TransactionReceiptModal.jsx        # Printable digital receipt modal
│       │   └── TransferModal.jsx                  # Atomic fund transfer with PIN
│       └── services/
│           └── api.js                             # Fetch wrapper with JWT injection
├── .gitignore                                     # Excludes target/, node_modules/, etc.
├── DOCUMENTATION.md                               # This comprehensive documentation
├── LICENSE                                        # MIT License
└── README.md                                      # Repository introduction & badges
```

---

## 3. Backend Deep Dive (`/backend`)

### Core Entrypoint
- **File:** `backend/src/main/java/com/bank/securebanking/SecureBankingApplication.java`
- **Annotations:** `@SpringBootApplication`, `@RestController`
- **Features:**
  - Initiates the Spring application context via `SpringApplication.run(SecureBankingApplication.class, args)`.
  - Exposes `GET /api/health` providing live JSON telemetry:
    ```json
    {
      "app": "Secure Banking Management System",
      "version": "1.0.0",
      "status": "UP",
      "timestamp": "2026-09-24T23:05:32.943"
    }
    ```

---

### Entity Layer (`/entity`)
All entities leverage Jakarta Persistence (JPA) annotations:

1. **`Role.java` (Enum):**
   - Values: `ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_BANKER`.
   - Used for Spring Security authority mapping (`hasAuthority(...)`).

2. **`AccountType.java` (Enum):**
   - Values: `SAVINGS` (high-interest retail), `CURRENT` (business accounts), `FIXED_DEPOSIT`.

3. **`AccountStatus.java` (Enum):**
   - Values: `ACTIVE`, `FROZEN`, `CLOSED`, `PENDING_APPROVAL`.
   - Frozen accounts reject all debit and transfer requests.

4. **`TransactionType.java` (Enum):**
   - Values: `DEPOSIT`, `WITHDRAWAL`, `TRANSFER_SEND` (debit leg), `TRANSFER_RECEIVE` (credit leg).

5. **`TransactionStatus.java` (Enum):**
   - Values: `SUCCESS`, `PENDING`, `FAILED`.

6. **`User.java`:**
   - Table: `users`, Unique Constraint on `email`.
   - Fields: `id` (PK, GenerationType.IDENTITY), `fullName`, `email`, `password` (BCrypt encoded), `phone`, `role`, `createdAt`, `accounts` (`@OneToMany`).

7. **`Account.java`:**
   - Table: `accounts`, Unique Constraint on `account_number`.
   - Fields: `accountNumber` (10-digit unique string), `ifscCode` (e.g. `SBMS0001024`), `accountType`, `balance` (`BigDecimal(15,2)`), `status`, `user` (`@ManyToOne`, FetchType.LAZY), `transactions` (`@OneToMany`).
   - Lifecycle callback: `@PreUpdate` synchronizes `updatedAt`.

8. **`Transaction.java`:**
   - Table: `transactions`, Indexed on `account_id` and `reference_number`.
   - Fields: `referenceNumber` (unique UTR formatted code), `account` (`@ManyToOne`), `targetAccountNumber`, `transactionType`, `amount` (`BigDecimal`), `postBalance` (snapshot of balance after transaction), `description`, `status`, `timestamp`.

---

### Data Transfer Objects (`/dto`)
DTOs cleanly decouple persistence entities from client API contracts, avoiding over-posting and entity serialization cycles:

- **`ApiResponse<T>`:** Standardized generic response envelope:
  ```json
  {
    "success": true,
    "message": "Deposit processed successfully",
    "data": { ... },
    "timestamp": "2026-09-24T23:10:00"
  }
  ```
- **`AuthRequest` / `AuthResponse`:** Login input (`email`, `password`) and output (`token`, `id`, `fullName`, `email`, `role`, `primaryAccountNumber`).
- **`RegisterRequest`:** User registration input including `accountType` and `initialDeposit`.
- **`AccountDto`:** Clean representation of bank account containing balance, account number, IFSC, status, and owner details.
- **`DepositRequest` / `WithdrawRequest`:** Contains `accountNumber`, `amount` (`@DecimalMin("1.0")`), and `description`.
- **`TransferRequest`:** Contains `fromAccountNumber`, `toAccountNumber`, `amount`, and `description`.
- **`TransactionDto`:** Transmits transaction record, reference UTR, amount, post balance, and timestamp.
- **`DashboardSummaryDto`:** Aggregates bank reserve metrics, total customers, accounts, and recent ledger activity.

---

### Repository Layer (`/repository`)
Extends `JpaRepository<T, ID>` leveraging Spring Data query derivation and JPQL:

- **`UserRepository.java`:**
  - `Optional<User> findByEmail(String email)`
  - `Boolean existsByEmail(String email)`
  - `List<User> findByRole(Role role)`
- **`AccountRepository.java`:**
  - `Optional<Account> findByAccountNumber(String accountNumber)`
  - `List<Account> findByUserId(Long userId)`
  - `@Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.status = 'ACTIVE'") BigDecimal getTotalActiveBalance()`
  - `@Query("SELECT COUNT(a) FROM Account a WHERE a.status = 'ACTIVE'") long countActiveAccounts()`
- **`TransactionRepository.java`:**
  - `List<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId)`
  - `List<Transaction> findTop10ByOrderByTimestampDesc()`
  - Custom aggregations: `getTotalDeposits()`, `getTotalWithdrawals()`, `getTotalTransfers()`

---

### Security & JWT Engine (`/security`)
Built on **Spring Security 6** and **JJWT 0.12.6**:

1. **`JwtUtils.java`:**
   - Decodes base64 secret into HMAC-SHA `SecretKey` using `Keys.hmacShaKeyFor(...)`.
   - Generates tokens containing user subject, ID, and full name with configurable expiration (default 24h).
   - Validates tokens using `Jwts.parser().verifyWith(key).build().parseSignedClaims(token)`.
   - Gracefully handles `ExpiredJwtException`, `MalformedJwtException`, and `UnsupportedJwtException`.

2. **`UserDetailsImpl.java` & `UserDetailsServiceImpl.java`:**
   - Maps database `User` to Spring Security's `UserDetails` contract.
   - Maps `Role` to `GrantedAuthority` (`ROLE_CUSTOMER`, `ROLE_ADMIN`).

3. **`AuthTokenFilter.java`:**
   - Subclasses `OncePerRequestFilter`.
   - Parses `Authorization: Bearer <token>` header on incoming HTTP requests.
   - Validates token and establishes authenticated `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`.

4. **`AuthEntryPointJwt.java`:**
   - Implements `AuthenticationEntryPoint`.
   - Formats unauthenticated requests into HTTP 401 JSON envelopes instead of default HTML login redirects.

5. **`SecurityConfig.java`:**
   - `@Configuration` and `@EnableWebSecurity`.
   - Configures stateless session policy: `SessionCreationPolicy.STATELESS`.
   - Disables CSRF (REST stateless model).
   - Authorizes `/api/auth/**`, `/api/health`, `/h2-console/**` as public.
   - Restricts `/api/admin/**` to `ROLE_ADMIN` / `ROLE_BANKER`.
   - Injects `CorsConfigurationSource` allowing React ports (`http://localhost:5173`, `http://localhost:3000`).

---

### Service Layer (`/service`)

1. **`AuthService.java`:**
   - Handles login authentication via `AuthenticationManager`.
   - On registration, creates the user and automatically provisions a linked active bank account with a 10-digit account number.

2. **`AccountService.java`:**
   - Fetches accounts for authenticated user.
   - Verifies beneficiary accounts (hides balance, returns customer name for transfer confirmation).
   - Creates additional accounts (Savings, Current, Fixed Deposit).

3. **`TransactionService.java` (Transactional Core):**
   - Annotated with `@Transactional(isolation = Isolation.REPEATABLE_READ)` to prevent phantom reads and race conditions during simultaneous debits/credits.
   - **`deposit(DepositRequest)`:** Validates account is active, adds amount, saves new balance, generates `DEP...` reference, logs transaction.
   - **`withdraw(WithdrawRequest)`:** Validates ownership or admin access, validates account is active, enforces balance sufficiency, debits balance, generates `WTH...` reference, logs transaction.
   - **`transfer(TransferRequest)`:**
     - Disallows transferring to identical account.
     - Validates sender ownership, sender balance, and checks that both sender and receiver accounts are `ACTIVE`.
     - Atomically debits sender (`TRANSFER_SEND`) and credits recipient (`TRANSFER_RECEIVE`).
     - Generates paired reference numbers (e.g. `TRF2609030003` and `TRF2609030003-REC`).

4. **`AdminService.java`:**
   - Calculates aggregate metrics: total bank reserves, active accounts, customers, credit/debit volume.
   - Allows administrators to freeze or unfreeze accounts.

5. **`DataInitializer.java`:**
   - `CommandLineRunner` component that seeds default accounts on first run:
     - Admin: `admin@bank.com` / `Admin@123`
     - Customer 1: `vaibhav@gmail.com` / `Vaibhav@123` (A/C `1001002026`, Balance: ₹75,450.00)
     - Customer 2: `priya@gmail.com` / `Priya@123` (A/C `1001002027`, Balance: ₹42,800.00)
     - Seeded transaction history for salary, ATM withdrawals, and rent transfers.

---

### Controller Layer (`/controller`)
Clean RESTful APIs exposing HTTP endpoints with Bean Validation (`@Valid`):

- **`AuthController`:** `/api/auth/login`, `/api/auth/register`, `/api/auth/me`.
- **`AccountController`:** `/api/accounts/my-accounts`, `/api/accounts/{accountNumber}`, `/api/accounts/verify/{accountNumber}`, `/api/accounts/new`, `/api/accounts/{accountNumber}/status`.
- **`TransactionController`:** `/api/transactions/deposit`, `/api/transactions/withdraw`, `/api/transactions/transfer`, `/api/transactions/history/{accountNumber}`, `/api/transactions/receipt/{referenceNumber}`.
- **`AdminController`:** `/api/admin/dashboard`, `/api/admin/accounts`, `/api/admin/transactions`, `/api/admin/users`, `/api/admin/accounts/{accountNumber}/status`.

---

### Exception Handling (`/exception`)
`GlobalExceptionHandler.java` intercepts exceptions using `@RestControllerAdvice`:
- `ResourceNotFoundException` → HTTP 404 Not Found
- `InsufficientBalanceException` → HTTP 400 Bad Request
- `AccountFrozenException` → HTTP 403 Forbidden
- `BadCredentialsException` → HTTP 401 Unauthorized
- `MethodArgumentNotValidException` → HTTP 400 Bad Request (maps exact field errors)
- `Exception` → HTTP 500 Internal Server Error

---

### Configuration & Resources (`/resources`)
- **`application.properties`:**
  - Configures MySQL 8.0 datasource with connection URL, credentials, and Hibernate dialect.
  - Configures JWT secret and CORS allowed origins.
  - Active profile default: `spring.profiles.active=${SPRING_PROFILES_ACTIVE:h2}`.
- **`application-h2.properties`:**
  - Fallback profile configuring in-memory H2 database (`jdbc:h2:mem:banking_db`) with H2 Web Console enabled at `/h2-console`.

---

## 4. Frontend Deep Dive (`/frontend`)

### Frontend Build & Configuration
- **`vite.config.js`:** Vite bundler configuration with `@vitejs/plugin-react`.
- **`tailwind.config.js`:** Extends color palette with fintech dark mode tokens (`#070B13`, `#0B0F19`, `#10B981`, `#F43F5E`, `#6366F1`).
- **`src/index.css`:** Imports Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`), sets up custom scrollbars and glassmorphism backdrop blurs.

---

### API Service Layer
- **File:** `frontend/src/services/api.js`
- **Features:**
  - Centralized HTTP client communicating with `http://localhost:8080/api`.
  - Automatic `Authorization: Bearer <token>` header injection from `localStorage`.
  - Methods: `login()`, `register()`, `getMyAccounts()`, `verifyBeneficiary()`, `transfer()`, `deposit()`, `withdraw()`, `getHistory()`, `getReceipt()`, `getAdminDashboard()`, `updateAccountStatus()`.

---

### Core Components (`/components`)

1. **`Navbar.jsx`:**
   - Displays bank branding with 256-bit security badge.
   - Account switcher dropdown displaying active balance in Indian Rupee format (`₹XX,XXX.XX`).
   - Profile avatar with role badge (`Admin` vs `Customer`) and Logout button.

2. **`Sidebar.jsx`:**
   - Navigation links: Dashboard, Fund Transfer, Deposit, Withdrawal, Account Ledger.
   - Dynamically adds the **Admin Portal** link if logged in user has `ROLE_ADMIN`.
   - Quick action to "Open New Account".
   - Live Security Status box showing Spring Security 6 and MySQL 8.0 connectivity.

3. **`DebitCard.jsx`:**
   - 3D gradient finish with gold EMV chip, contactless payment antenna, and bank watermark.
   - Toggle button to reveal or mask account number.
   - 1-click clipboard copy for account number.
   - Displays IFSC code (`SBMS0001024`) and account status.

4. **`TransferModal.jsx`:**
   - Two-step transfer process:
     - **Step 1:** Source account selection, recipient account input with **Verify Name** instant lookup (calls `/api/accounts/verify/{acc}`), amount with quick-chips (`₹500`, `₹2,500`, `₹5,000`), and remarks.
     - **Step 2:** Summary review and 4-digit Security PIN authorization (`1234`).
   - On completion, opens the printable Digital Transaction Receipt.

5. **`DepositWithdrawModal.jsx`:**
   - Dual-mode component for instant cash deposits or ATM withdrawal simulations.
   - Includes real-time balance validation before submitting withdrawal requests.

6. **`TransactionReceiptModal.jsx`:**
   - Renders a cryptographic transaction receipt with reference UTR number, debit/credit color indicators, timestamp, and digital verification seal.
   - Dedicated print styles (`@media print`) allowing users to print or save as PDF.

7. **`AdminPanel.jsx`:**
   - Total bank reserve dashboard (sum of all customer balances).
   - Customer account management table with live search and **Freeze / Unfreeze** toggles.
   - System-wide immutable transaction audit log.

8. **`LoginModal.jsx`:**
   - Handles email/password sign-in and new customer onboarding.
   - Includes **1-Click Demo Logins** for immediate testing without typing.

---

### Master Application (`App.jsx`)
- Controls global state: authenticated user, account list, active account, transaction ledger, and active modals.
- Handles toast notifications (success, error, info).
- Automatically updates account balance and appends new transactions to the ledger upon successful transfers, deposits, or withdrawals.

---

## 5. Database Architecture (`/database`)

### Schema DDL (`schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS banking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banking_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    ifsc_code VARCHAR(15) NOT NULL DEFAULT 'SBMS0001024',
    account_type VARCHAR(20) NOT NULL DEFAULT 'SAVINGS',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(36) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    target_account_number VARCHAR(20),
    transaction_type VARCHAR(25) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    post_balance DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_accounts FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_trx_account (account_id),
    INDEX idx_trx_ref (reference_number)
) ENGINE=InnoDB;
```

---

## 6. CI/CD & DevOps (`/.github`)

The project includes an automated GitHub Actions workflow defined in `.github/workflows/ci.yml`:
1. **Trigger:** Runs on every `push` and `pull_request` to `main` and `master`.
2. **Backend Job (`backend-build`):**
   - Sets up OpenJDK 17 with Maven caching.
   - Compiles all 42 Java classes via `mvn clean test-compile`.
   - Executes Spring Boot test suite via `mvn test`.
3. **Frontend Job (`frontend-build`):**
   - Sets up Node.js 20 with npm dependency caching.
   - Runs `npm ci`.
   - Verifies production bundle generation via `npm run build`.

---

## 7. End-to-End Execution & Workflows

### User Authentication Flow
```
User (Browser)               Frontend (api.js)               Spring Boot Backend
     │                              │                                  │
     │── 1. Enter Credentials ─────>│                                  │
     │      (vaibhav@gmail.com)     │── 2. POST /api/auth/login ──────>│
     │                              │      { email, password }         │
     │                              │                                  │── 3. DaoAuthenticationProvider
     │                              │                                  │      verifies BCrypt hash
     │                              │                                  │── 4. JwtUtils.generateToken()
     │                              │<─ 5. Return 200 OK + JWT Token ──│
     │                              │      { token, userDetails }      │
     │<── 6. Store in localStorage ─│                                  │
     │       Redirect to Dashboard  │                                  │
```

### Atomic Fund Transfer Flow
```
Sender (Browser)           AccountService                 TransactionService (ACID)            MySQL Database
     │                           │                                  │                                │
     │── 1. Enter Recipient ────>│                                  │                                │
     │      "1001002027"         │── Verify Account Active ────────>│                                │
     │<─ 2. "Priya Sharma" ──────│                                  │                                │
     │                           │                                  │                                │
     │── 3. Submit Transfer ───────────────────────────────────────>│                                │
     │      (Amount: ₹5,000)     │                                  │── BEGIN TRANSACTION            │
     │                           │                                  │   (REPEATABLE_READ)            │
     │                           │                                  │                                │
     │                           │                                  │── Verify Sender Balance >= 5000│
     │                           │                                  │── Validate Both Accounts ACTIVE│
     │                           │                                  │                                │
     │                           │                                  │── Debit Sender Account ───────>│
     │                           │                                  │── Credit Receiver Account ────>│
     │                           │                                  │── Insert Ledger Row (Debit) ──>│
     │                           │                                  │── Insert Ledger Row (Credit) ─>│
     │                           │                                  │                                │
     │                           │                                  │── COMMIT TRANSACTION ─────────>│
     │<── 4. Digital Receipt (Ref: TRF2609...) ─────────────────────│                                │
```

---

## 8. Setup, Installation & Running Guide

### Prerequisites
- **JDK 17+** (Set `JAVA_HOME`)
- **Maven 3.8+**
- **Node.js 18+** & npm
- **MySQL 8.0+** *(Optional: defaults to H2 persistent profile)*

### Running the Backend
```bash
cd backend
mvn clean spring-boot:run
```
- Server starts at `http://localhost:8080`.
- Health check: `http://localhost:8080/api/health`.
- To explicitly use MySQL:
  ```bash
  mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=mysql --spring.datasource.password=YOUR_MYSQL_PASSWORD"
  ```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open Chrome browser at `http://localhost:5173`.

---

## 9. Interview Q&A & Resume Alignment

Here is how each bullet point from your resume maps to this project and how to answer technical questions in interviews:

| Resume Project Bullet | Implementation Details in Codebase | How to Explain in an Interview |
| :--- | :--- | :--- |
| **"Built a banking backend with login and role-based authentication"** | Spring Security 6, `AuthTokenFilter`, `JwtUtils`, `Role` (`ROLE_CUSTOMER`, `ROLE_ADMIN`), BCrypt hashing. | *"I implemented stateless authentication using JJWT 0.12.6 and Spring Security 6. Passwords are salted and hashed using BCrypt. Incoming requests pass through a custom OncePerRequestFilter that validates the JWT signature and populates the SecurityContext with role-based authorities for method and route security."* |
| **"Developed REST APIs for account management and transaction operations"** | `AccountController`, `TransactionController`, `TransactionService` with `@Transactional(isolation = Isolation.REPEATABLE_READ)`. | *"I designed RESTful endpoints following standard HTTP verbs. For financial transactions, I used REPEATABLE READ isolation to prevent dirty and non-repeatable reads, ensuring fund transfers atomically debit the sender and credit the receiver with paired double-entry ledger records."* |
| **"Integrated MySQL using Hibernate ORM for persistent data management"** | `AccountRepository`, `TransactionRepository`, `UserRepository`, Jakarta Persistence annotations (`@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`). | *"I modeled relational entities with Hibernate 6.5 and Spring Data JPA. I configured foreign key constraints, indexes on account numbers and reference UTRs, and wrote custom JPQL queries for calculating real-time active bank reserves."* |
| **"Built responsive React.js frontend components and integrated them with backend APIs"** | React 18, Tailwind CSS, `api.js` fetch client with bearer token injection, virtual debit card, printable receipt modal. | *"I developed a responsive single-page application using React and Tailwind CSS. It communicates with backend REST APIs via a modular fetch client that attaches bearer tokens from localStorage, featuring real-time beneficiary name resolution, quick amount chips, and printable transaction receipts."* |
