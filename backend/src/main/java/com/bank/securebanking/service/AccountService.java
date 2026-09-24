package com.bank.securebanking.service;

import com.bank.securebanking.dto.AccountDto;
import com.bank.securebanking.entity.*;
import com.bank.securebanking.exception.BankingApiException;
import com.bank.securebanking.exception.ResourceNotFoundException;
import com.bank.securebanking.repository.AccountRepository;
import com.bank.securebanking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public AccountService(AccountRepository accountRepository,
                          UserRepository userRepository,
                          AuthService authService) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getMyAccounts() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Account> accounts = accountRepository.findByUserId(currentUser.getId());
        return accounts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountDto getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with number: " + accountNumber));

        User currentUser = authService.getCurrentAuthenticatedUser();
        // Allow access if owner or admin/banker
        if (!account.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ROLE_ADMIN &&
                currentUser.getRole() != Role.ROLE_BANKER) {
            throw new BankingApiException(HttpStatus.FORBIDDEN, "Unauthorized access to account details");
        }

        return mapToDto(account);
    }

    @Transactional(readOnly = true)
    public AccountDto verifyBeneficiaryAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary account not found: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingApiException(HttpStatus.BAD_REQUEST, "Beneficiary account is not active");
        }

        // Return public verification details
        return new AccountDto(
                account.getId(),
                account.getAccountNumber(),
                account.getIfscCode(),
                account.getAccountType(),
                null, // hide balance for privacy
                account.getStatus(),
                null,
                account.getUser().getFullName(),
                account.getUser().getEmail(),
                null,
                account.getCreatedAt()
        );
    }

    @Transactional
    public AccountDto createAdditionalAccount(AccountType accountType, BigDecimal initialDeposit) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        String accountNumber = generateUniqueAccountNumber();
        BigDecimal balance = initialDeposit != null ? initialDeposit : BigDecimal.ZERO;

        Account account = new Account(
                accountNumber,
                "SBMS0001024",
                accountType != null ? accountType : AccountType.SAVINGS,
                balance,
                AccountStatus.ACTIVE,
                currentUser
        );

        Account saved = accountRepository.save(account);
        return mapToDto(saved);
    }

    @Transactional
    public AccountDto updateAccountStatus(String accountNumber, AccountStatus newStatus) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        account.setStatus(newStatus);
        Account updated = accountRepository.save(account);
        return mapToDto(updated);
    }

    public AccountDto mapToDto(Account account) {
        return new AccountDto(
                account.getId(),
                account.getAccountNumber(),
                account.getIfscCode(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getUser().getId(),
                account.getUser().getFullName(),
                account.getUser().getEmail(),
                account.getUser().getPhone(),
                account.getCreatedAt()
        );
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accNumber;
        do {
            long number = 1000000000L + (long)(random.nextDouble() * 9000000000L);
            accNumber = String.valueOf(number);
        } while (accountRepository.existsByAccountNumber(accNumber));

        return accNumber;
    }
}
