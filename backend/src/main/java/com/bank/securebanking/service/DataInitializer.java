package com.bank.securebanking.service;

import com.bank.securebanking.entity.*;
import com.bank.securebanking.repository.AccountRepository;
import com.bank.securebanking.repository.TransactionRepository;
import com.bank.securebanking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized with users and accounts.");
            return;
        }

        logger.info("Initializing Secure Banking System demo data...");

        // 1. Create System Admin
        User admin = new User(
                "System Administrator",
                "admin@bank.com",
                passwordEncoder.encode("Admin@123"),
                "9876543210",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Create Vaibhav Lakde (Customer)
        User vaibhav = new User(
                "Vaibhav Lakde",
                "vaibhav@gmail.com",
                passwordEncoder.encode("Vaibhav@123"),
                "9322963704",
                Role.ROLE_CUSTOMER
        );
        userRepository.save(vaibhav);

        Account vaibhavAcc = new Account(
                "1001002026",
                "SBMS0001024",
                AccountType.SAVINGS,
                new BigDecimal("75450.00"),
                AccountStatus.ACTIVE,
                vaibhav
        );
        accountRepository.save(vaibhavAcc);

        // 3. Create Priya Sharma (Beneficiary Customer)
        User priya = new User(
                "Priya Sharma",
                "priya@gmail.com",
                passwordEncoder.encode("Priya@123"),
                "9811223344",
                Role.ROLE_CUSTOMER
        );
        userRepository.save(priya);

        Account priyaAcc = new Account(
                "1001002027",
                "SBMS0001024",
                AccountType.CURRENT,
                new BigDecimal("42800.00"),
                AccountStatus.ACTIVE,
                priya
        );
        accountRepository.save(priyaAcc);

        // 4. Seed Realistic Transactions for Vaibhav's Account
        Transaction t1 = new Transaction(
                "DEP2609010001",
                vaibhavAcc,
                null,
                TransactionType.DEPOSIT,
                new BigDecimal("80000.00"),
                new BigDecimal("80000.00"),
                "Monthly Salary Credit - Cyber Success",
                TransactionStatus.SUCCESS
        );
        t1.setTimestamp(LocalDateTime.now().minusDays(5));
        transactionRepository.save(t1);

        Transaction t2 = new Transaction(
                "WTH2609020002",
                vaibhavAcc,
                null,
                TransactionType.WITHDRAWAL,
                new BigDecimal("2500.00"),
                new BigDecimal("77500.00"),
                "ATM Cash Withdrawal - FC Road Pune",
                TransactionStatus.SUCCESS
        );
        t2.setTimestamp(LocalDateTime.now().minusDays(3));
        transactionRepository.save(t2);

        Transaction t3 = new Transaction(
                "TRF2609030003",
                vaibhavAcc,
                "1001002027",
                TransactionType.TRANSFER_SEND,
                new BigDecimal("2050.00"),
                new BigDecimal("75450.00"),
                "Rent & Utility share to Priya",
                TransactionStatus.SUCCESS
        );
        t3.setTimestamp(LocalDateTime.now().minusDays(1));
        transactionRepository.save(t3);

        Transaction t4 = new Transaction(
                "TRF2609030003-REC",
                priyaAcc,
                "1001002026",
                TransactionType.TRANSFER_RECEIVE,
                new BigDecimal("2050.00"),
                new BigDecimal("42800.00"),
                "Transfer from Vaibhav Lakde",
                TransactionStatus.SUCCESS
        );
        t4.setTimestamp(LocalDateTime.now().minusDays(1));
        transactionRepository.save(t4);

        logger.info("Demo data initialized successfully!");
        logger.info("Default Admin: admin@bank.com / Admin@123");
        logger.info("Default Customer: vaibhav@gmail.com / Vaibhav@123 (Account: 1001002026)");
    }
}
