package com.bank.securebanking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
public class SecureBankingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureBankingApplication.class, args);
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("app", "Secure Banking Management System");
        res.put("version", "1.0.0");
        res.put("timestamp", LocalDateTime.now());
        return res;
    }
}
