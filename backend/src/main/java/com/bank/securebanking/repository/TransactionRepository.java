package com.bank.securebanking.repository;

import com.bank.securebanking.entity.Transaction;
import com.bank.securebanking.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByReferenceNumber(String referenceNumber);
    List<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId);
    Page<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId, Pageable pageable);
    List<Transaction> findByAccountIdAndTransactionTypeOrderByTimestampDesc(Long accountId, TransactionType type);
    List<Transaction> findTop10ByAccountIdOrderByTimestampDesc(Long accountId);
    List<Transaction> findTop10ByOrderByTimestampDesc();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.transactionType = 'DEPOSIT' AND t.status = 'SUCCESS'")
    BigDecimal getTotalDeposits();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.transactionType = 'WITHDRAWAL' AND t.status = 'SUCCESS'")
    BigDecimal getTotalWithdrawals();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE (t.transactionType = 'TRANSFER_SEND' OR t.transactionType = 'TRANSFER_RECEIVE') AND t.status = 'SUCCESS'")
    BigDecimal getTotalTransfers();
}
