package com.bank.securebanking.controller;

import com.bank.securebanking.dto.AccountDto;
import com.bank.securebanking.dto.ApiResponse;
import com.bank.securebanking.dto.DashboardSummaryDto;
import com.bank.securebanking.dto.TransactionDto;
import com.bank.securebanking.entity.AccountStatus;
import com.bank.securebanking.entity.User;
import com.bank.securebanking.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BANKER')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardMetrics() {
        DashboardSummaryDto metrics = adminService.getAdminDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard metrics retrieved", metrics));
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAllAccounts() {
        List<AccountDto> accounts = adminService.getAllAccounts();
        return ResponseEntity.ok(ApiResponse.success("All accounts retrieved", accounts));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getAllTransactions() {
        List<TransactionDto> transactions = adminService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.success("All transactions retrieved", transactions));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users retrieved", users));
    }

    @PatchMapping("/accounts/{accountNumber}/status")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccountStatus(
            @PathVariable String accountNumber,
            @RequestBody Map<String, String> statusMap) {
        AccountStatus status = AccountStatus.valueOf(statusMap.get("status"));
        AccountDto updated = adminService.updateAccountStatus(accountNumber, status);
        return ResponseEntity.ok(ApiResponse.success("Account status updated to " + status, updated));
    }
}
