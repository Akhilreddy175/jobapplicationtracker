package com.akhil.jobapplicationtracker.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/register")
    public String register(@RequestBody String user) {
        return "User registered successfully";
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> user) {
        Map<String, String> response = new HashMap<>();

        // Temporary login (no validation for now)
        response.put("token", "test-token");

        return response;
    }
}