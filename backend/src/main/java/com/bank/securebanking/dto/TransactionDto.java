package com.bank.securebanking.dto;

import com.bank.securebanking.entity.TransactionStatus;
import com.bank.securebanking.entity.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {

    private Long id;
    private String referenceNumber;
    private String accountNumber;
    private String targetAccountNumber;
    private TransactionType transactionType;
    private BigDecimal amount;
    private BigDecimal postBalance;
    private String description;
    private TransactionStatus status;
    private LocalDateTime timestamp;

    public TransactionDto() {
    }

    public TransactionDto(Long id, String referenceNumber, String accountNumber, String targetAccountNumber,
                          TransactionType transactionType, BigDecimal amount, BigDecimal postBalance,
                          String description, TransactionStatus status, LocalDateTime timestamp) {
        this.id = id;
        this.referenceNumber = referenceNumber;
        this.accountNumber = accountNumber;
        this.targetAccountNumber = targetAccountNumber;
        this.transactionType = transactionType;
        this.amount = amount;
        this.postBalance = postBalance;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getTargetAccountNumber() {
        return targetAccountNumber;
    }

    public void setTargetAccountNumber(String targetAccountNumber) {
        this.targetAccountNumber = targetAccountNumber;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPostBalance() {
        return postBalance;
    }

    public void setPostBalance(BigDecimal postBalance) {
        this.postBalance = postBalance;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
