package com.bank.securebanking.service;

import com.bank.securebanking.dto.DepositRequest;
import com.bank.securebanking.dto.TransactionDto;
import com.bank.securebanking.dto.TransferRequest;
import com.bank.securebanking.dto.WithdrawRequest;
import com.bank.securebanking.entity.*;
import com.bank.securebanking.exception.AccountFrozenException;
import com.bank.securebanking.exception.BankingApiException;
import com.bank.securebanking.exception.InsufficientBalanceException;
import com.bank.securebanking.exception.ResourceNotFoundException;
import com.bank.securebanking.repository.AccountRepository;
import com.bank.securebanking.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository,
                              AuthService authService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransactionDto deposit(DepositRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        validateAccountActive(account);

        BigDecimal newBalance = account.getBalance().add(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        String refNo = generateReferenceNumber("DEP");
        Transaction transaction = new Transaction(
                refNo,
                account,
                null,
                TransactionType.DEPOSIT,
                request.getAmount(),
                newBalance,
                request.getDescription() != null ? request.getDescription() : "Deposit to " + account.getAccountNumber(),
                TransactionStatus.SUCCESS
        );

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransactionDto withdraw(WithdrawRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        validateAccountOwnershipOrAdmin(account);
        validateAccountActive(account);

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient account balance. Available: ₹" +
                    account.getBalance() + ", Requested: ₹" + request.getAmount());
        }

        BigDecimal newBalance = account.getBalance().subtract(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        String refNo = generateReferenceNumber("WTH");
        Transaction transaction = new Transaction(
                refNo,
                account,
                null,
                TransactionType.WITHDRAWAL,
                request.getAmount(),
                newBalance,
                request.getDescription() != null ? request.getDescription() : "Withdrawal from " + account.getAccountNumber(),
                TransactionStatus.SUCCESS
        );

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransactionDto transfer(TransferRequest request) {
        if (request.getFromAccountNumber().equalsIgnoreCase(request.getToAccountNumber())) {
            throw new BankingApiException(HttpStatus.BAD_REQUEST, "Sender and recipient accounts cannot be the same");
        }

        Account fromAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found: " + request.getFromAccountNumber()));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found: " + request.getToAccountNumber()));

        validateAccountOwnershipOrAdmin(fromAccount);
        validateAccountActive(fromAccount);
        validateAccountActive(toAccount);

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer. Available: ₹" +
                    fromAccount.getBalance() + ", Required: ₹" + request.getAmount());
        }

        // Debit Sender
        BigDecimal newSenderBalance = fromAccount.getBalance().subtract(request.getAmount());
        fromAccount.setBalance(newSenderBalance);
        accountRepository.save(fromAccount);

        // Credit Recipient
        BigDecimal newReceiverBalance = toAccount.getBalance().add(request.getAmount());
        toAccount.setBalance(newReceiverBalance);
        accountRepository.save(toAccount);

        String refNo = generateReferenceNumber("TRF");

        // Record Sender Transaction (Debit)
        Transaction senderTx = new Transaction(
                refNo,
                fromAccount,
                toAccount.getAccountNumber(),
                TransactionType.TRANSFER_SEND,
                request.getAmount(),
                newSenderBalance,
                request.getDescription() != null ? request.getDescription() : "Transfer to " + toAccount.getUser().getFullName(),
                TransactionStatus.SUCCESS
        );
        transactionRepository.save(senderTx);

        // Record Receiver Transaction (Credit)
        Transaction receiverTx = new Transaction(
                refNo + "-REC",
                toAccount,
                fromAccount.getAccountNumber(),
                TransactionType.TRANSFER_RECEIVE,
                request.getAmount(),
                newReceiverBalance,
                "Transfer from " + fromAccount.getUser().getFullName() + " (" + request.getDescription() + ")",
                TransactionStatus.SUCCESS
        );
        transactionRepository.save(receiverTx);

        return mapToDto(senderTx);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionsByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        validateAccountOwnershipOrAdmin(account);

        List<Transaction> transactions = transactionRepository.findByAccountIdOrderByTimestampDesc(account.getId());
        return transactions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransactionByReference(String referenceNumber) {
        Transaction tx = transactionRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for reference: " + referenceNumber));

        return mapToDto(tx);
    }

    private void validateAccountActive(Account account) {
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Account " + account.getAccountNumber() + " is frozen. Transactions are restricted.");
        }
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new BankingApiException(HttpStatus.FORBIDDEN, "Account " + account.getAccountNumber() + " is closed.");
        }
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingApiException(HttpStatus.BAD_REQUEST, "Account is not active for transactions");
        }
    }

    private void validateAccountOwnershipOrAdmin(Account account) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (!account.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ROLE_ADMIN &&
                currentUser.getRole() != Role.ROLE_BANKER) {
            throw new BankingApiException(HttpStatus.FORBIDDEN, "You do not have permission to transact on this account");
        }
    }

    private String generateReferenceNumber(String prefix) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + timestamp + randomSuffix;
    }

    private TransactionDto mapToDto(Transaction tx) {
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
