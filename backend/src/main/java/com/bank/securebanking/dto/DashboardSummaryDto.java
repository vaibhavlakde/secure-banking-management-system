package com.bank.securebanking.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDto {

    private long totalAccounts;
    private long totalCustomers;
    private BigDecimal totalBalance;
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private BigDecimal totalTransfers;
    private List<AccountDto> accounts;
    private List<TransactionDto> recentTransactions;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(long totalAccounts, long totalCustomers, BigDecimal totalBalance,
                               BigDecimal totalDeposits, BigDecimal totalWithdrawals, BigDecimal totalTransfers,
                               List<AccountDto> accounts, List<TransactionDto> recentTransactions) {
        this.totalAccounts = totalAccounts;
        this.totalCustomers = totalCustomers;
        this.totalBalance = totalBalance;
        this.totalDeposits = totalDeposits;
        this.totalWithdrawals = totalWithdrawals;
        this.totalTransfers = totalTransfers;
        this.accounts = accounts;
        this.recentTransactions = recentTransactions;
    }

    public long getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(long totalAccounts) {
        this.totalAccounts = totalAccounts;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }

    public BigDecimal getTotalDeposits() {
        return totalDeposits;
    }

    public void setTotalDeposits(BigDecimal totalDeposits) {
        this.totalDeposits = totalDeposits;
    }

    public BigDecimal getTotalWithdrawals() {
        return totalWithdrawals;
    }

    public void setTotalWithdrawals(BigDecimal totalWithdrawals) {
        this.totalWithdrawals = totalWithdrawals;
    }

    public BigDecimal getTotalTransfers() {
        return totalTransfers;
    }

    public void setTotalTransfers(BigDecimal totalTransfers) {
        this.totalTransfers = totalTransfers;
    }

    public List<AccountDto> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountDto> accounts) {
        this.accounts = accounts;
    }

    public List<TransactionDto> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionDto> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
