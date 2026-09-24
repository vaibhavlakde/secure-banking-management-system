package com.bank.securebanking.service;

import com.bank.securebanking.dto.AccountDto;
import com.bank.securebanking.dto.DashboardSummaryDto;
import com.bank.securebanking.dto.TransactionDto;
import com.bank.securebanking.entity.Account;
import com.bank.securebanking.entity.AccountStatus;
import com.bank.securebanking.entity.Transaction;
import com.bank.securebanking.entity.User;
import com.bank.securebanking.exception.ResourceNotFoundException;
import com.bank.securebanking.repository.AccountRepository;
import com.bank.securebanking.repository.TransactionRepository;
import com.bank.securebanking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    public AdminService(UserRepository userRepository,
                        AccountRepository accountRepository,
                        TransactionRepository transactionRepository,
                        AccountService accountService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getAdminDashboardMetrics() {
        long totalAccounts = accountRepository.count();
        long totalCustomers = userRepository.count();
        BigDecimal totalBalance = accountRepository.getTotalActiveBalance();
        BigDecimal totalDeposits = transactionRepository.getTotalDeposits();
        BigDecimal totalWithdrawals = transactionRepository.getTotalWithdrawals();
        BigDecimal totalTransfers = transactionRepository.getTotalTransfers();

        List<AccountDto> accounts = accountRepository.findAll().stream()
                .map(accountService::mapToDto)
                .collect(Collectors.toList());

        List<TransactionDto> recentTransactions = transactionRepository.findTop10ByOrderByTimestampDesc().stream()
                .map(this::mapTransactionToDto)
                .collect(Collectors.toList());

        return new DashboardSummaryDto(
                totalAccounts,
                totalCustomers,
                totalBalance,
                totalDeposits,
                totalWithdrawals,
                totalTransfers,
                accounts,
                recentTransactions
        );
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(accountService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapTransactionToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public AccountDto updateAccountStatus(String accountNumber, AccountStatus status) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with number: " + accountNumber));

        account.setStatus(status);
        Account updated = accountRepository.save(account);
        return accountService.mapToDto(updated);
    }

    private TransactionDto mapTransactionToDto(Transaction tx) {
        return new TransactionDto(
                tx.getId(),
                tx.getReferenceNumber(),
                tx.getAccount().getAccountNumber(),
                tx.getTargetAccountNumber(),
                tx.getTransactionType(),
                tx.getAmount(),
                tx.getPostBalance(),
                tx.getDescription(),
                tx.getStatus(),
                tx.getTimestamp()
        );
    }
}
