package com.tms.backend.controller;

import com.tms.backend.dto.AuthRequest;
import com.tms.backend.dto.AuthResponse;
import com.tms.backend.dto.RegisterRequest;
import com.tms.backend.entity.Role;
import com.tms.backend.entity.User;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.security.JwtUtil;
import com.tms.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Random;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    private Map<String, String> otpStorage = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow();
        final String jwt = jwtUtil.generateToken(userDetails.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(jwt, user.getRole().name()));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String profileImageUrl = request.get("profileImageUrl");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // Auto-register the user if they don't exist
            User newUser = new User();
            newUser.setEmail(email);
            // Generate a random password since they use Google to log in
            newUser.setPassword(passwordEncoder.encode(String.valueOf(new Random().nextLong())));
            newUser.setName(name);
            newUser.setProfileImageUrl(profileImageUrl);
            newUser.setRole(Role.CUSTOMER); // Default role
            userRepository.save(newUser);

            // Optionally send welcome email here too
            try {
                emailService.sendWelcomeEmail(newUser.getEmail(), newUser.getName());
            } catch (Exception e) {
                System.err.println("Failed to send welcome email for Google sign-in: " + e.getMessage());
            }

            return newUser;
        });

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(jwt, user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setProfileImageUrl(request.getProfileImageUrl());

        try {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        } catch (Exception e) {
            user.setRole(Role.CUSTOMER); // default role
        }

        userRepository.save(user);

        // Send Welcome Email
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP sent to your email!");
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error to the console
            return ResponseEntity.internalServerError().body("Failed to send OTP.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (otpStorage.containsKey(email) && otpStorage.get(email).equals(otp)) {
            otpStorage.remove(email);
            return ResponseEntity.ok("OTP verified successfully!");
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP!");
        }
    }
}
