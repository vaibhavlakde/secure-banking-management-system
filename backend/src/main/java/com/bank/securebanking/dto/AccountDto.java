package com.bank.securebanking.dto;

import com.bank.securebanking.entity.AccountStatus;
import com.bank.securebanking.entity.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountDto {

    private Long id;
    private String accountNumber;
    private String ifscCode;
    private AccountType accountType;
    private BigDecimal balance;
    private AccountStatus status;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDateTime createdAt;

    public AccountDto() {
    }

    public AccountDto(Long id, String accountNumber, String ifscCode, AccountType accountType,
                      BigDecimal balance, AccountStatus status, Long userId, String customerName,
                      String customerEmail, String customerPhone, LocalDateTime createdAt) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.accountType = accountType;
        this.balance = balance;
        this.status = status;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
