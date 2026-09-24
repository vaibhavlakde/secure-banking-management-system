package com.bank.securebanking.controller;

import com.bank.securebanking.dto.*;
import com.bank.securebanking.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionDto>> deposit(@Valid @RequestBody DepositRequest request) {
        TransactionDto transaction = transactionService.deposit(request);
        return ResponseEntity.ok(ApiResponse.success("Deposit processed successfully", transaction));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionDto>> withdraw(@Valid @RequestBody WithdrawRequest request) {
        TransactionDto transaction = transactionService.withdraw(request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal processed successfully", transaction));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionDto>> transfer(@Valid @RequestBody TransferRequest request) {
        TransactionDto transaction = transactionService.transfer(request);
        return ResponseEntity.ok(ApiResponse.success("Fund transfer executed successfully", transaction));
    }

    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactionHistory(@PathVariable String accountNumber) {
        List<TransactionDto> history = transactionService.getTransactionsByAccountNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved", history));
    }

    @GetMapping("/receipt/{referenceNumber}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionReceipt(@PathVariable String referenceNumber) {
        TransactionDto receipt = transactionService.getTransactionByReference(referenceNumber);
        return ResponseEntity.ok(ApiResponse.success("Receipt retrieved", receipt));
    }
}
