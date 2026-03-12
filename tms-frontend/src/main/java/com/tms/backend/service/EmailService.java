package com.tms.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to Transport Management System!";
        String body = String.format(
                "Hello %s,\n\n" +
                        "Thank you for registering with Transport Management System.\n" +
                        "Your registration is confirmed. You can now login to your account.\n\n" +
                        "Login Link: http://localhost:4200/login\n\n" +
                        "Best Regards,\n" +
                        "TMS Team",
                name);
        sendSimpleEmail(to, subject, body);
    }

    public void sendPaymentConfirmation(String to, String orderId, Double amount) {
        String subject = "Payment Confirmation - TMS";
        String body = String.format(
                "Hello,\n\n" +
                        "Your payment of %.2f for Order ID %s has been successfully processed.\n\n" +
                        "Thank you for using our service!\n\n" +
                        "Best Regards,\n" +
                        "TMS Team",
                amount, orderId);
        sendSimpleEmail(to, subject, body);
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "OTP Verification - TMS";
        String body = "Your OTP for registration is: " + otp + "\n\n" +
                "Wait for some time if you haven't received it.";
        sendSimpleEmail(to, subject, body);
    }
}
