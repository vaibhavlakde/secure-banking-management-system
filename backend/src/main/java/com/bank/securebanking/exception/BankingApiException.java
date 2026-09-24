package com.bank.securebanking.exception;

import org.springframework.http.HttpStatus;

public class BankingApiException extends RuntimeException {
    private final HttpStatus status;

    public BankingApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
