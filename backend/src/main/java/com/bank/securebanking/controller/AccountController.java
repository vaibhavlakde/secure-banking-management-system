package com.bank.securebanking.controller;

import com.bank.securebanking.dto.AccountDto;
import com.bank.securebanking.dto.ApiResponse;
import com.bank.securebanking.entity.AccountStatus;
import com.bank.securebanking.entity.AccountType;
import com.bank.securebanking.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/my-accounts")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getMyAccounts() {
        List<AccountDto> accounts = accountService.getMyAccounts();
        return ResponseEntity.ok(ApiResponse.success("Accounts fetched successfully", accounts));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountByNumber(@PathVariable String accountNumber) {
        AccountDto account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success("Account details fetched successfully", account));
    }

    @GetMapping("/verify/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountDto>> verifyBeneficiary(@PathVariable String accountNumber) {
        AccountDto account = accountService.verifyBeneficiaryAccount(accountNumber);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary account verified", account));
    }

    @PostMapping("/new")
    public ResponseEntity<ApiResponse<AccountDto>> createNewAccount(
            @RequestParam(defaultValue = "SAVINGS") AccountType accountType,
            @RequestParam(defaultValue = "0.0") BigDecimal initialDeposit) {
        AccountDto account = accountService.createAdditionalAccount(accountType, initialDeposit);
        return ResponseEntity.ok(ApiResponse.success("New bank account created successfully", account));
    }

    @PatchMapping("/{accountNumber}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BANKER')")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccountStatus(
            @PathVariable String accountNumber,
            @RequestBody Map<String, String> statusMap) {
        AccountStatus status = AccountStatus.valueOf(statusMap.get("status"));
        AccountDto updated = accountService.updateAccountStatus(accountNumber, status);
        return ResponseEntity.ok(ApiResponse.success("Account status updated to " + status, updated));
    }
}
