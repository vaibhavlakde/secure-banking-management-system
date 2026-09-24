package com.bank.securebanking.service;

import com.bank.securebanking.dto.AuthRequest;
import com.bank.securebanking.dto.AuthResponse;
import com.bank.securebanking.dto.RegisterRequest;
import com.bank.securebanking.entity.*;
import com.bank.securebanking.exception.BankingApiException;
import com.bank.securebanking.repository.AccountRepository;
import com.bank.securebanking.repository.UserRepository;
import com.bank.securebanking.security.JwtUtils;
import com.bank.securebanking.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       AccountRepository accountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse login(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BankingApiException(HttpStatus.NOT_FOUND, "User record not found"));

        String primaryAccount = accountRepository.findByUserId(user.getId()).stream()
                .findFirst()
                .map(Account::getAccountNumber)
                .orElse(null);

        return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), primaryAccount);
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BankingApiException(HttpStatus.BAD_REQUEST, "Email is already registered: " + registerRequest.getEmail());
        }

        User user = new User(
                registerRequest.getFullName(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone(),
                Role.ROLE_CUSTOMER
        );

        User savedUser = userRepository.save(user);

        // Automatically provision an active bank account for the registered customer
        String accountNumber = generateUniqueAccountNumber();
        BigDecimal initialBalance = registerRequest.getInitialDeposit() != null ? registerRequest.getInitialDeposit() : BigDecimal.ZERO;

        Account account = new Account(
                accountNumber,
                "SBMS0001024",
                registerRequest.getAccountType() != null ? registerRequest.getAccountType() : AccountType.SAVINGS,
                initialBalance,
                AccountStatus.ACTIVE,
                savedUser
        );

        accountRepository.save(account);

        String jwt = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getId(), savedUser.getFullName());
        return new AuthResponse(jwt, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole(), accountNumber);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BankingApiException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BankingApiException(HttpStatus.NOT_FOUND, "Authenticated user not found"));
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
