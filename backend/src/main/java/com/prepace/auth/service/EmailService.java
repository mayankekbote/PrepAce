package com.prepace.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Welcome to PrepAce!";
        String content = "<h1>Welcome, " + fullName + "!</h1>"
                + "<p>Your account has been successfully created. We are excited to help you ace your next interview!</p>"
                + "<p>Log in now to upload your resume and start practicing.</p>";
        sendEmail(toEmail, subject, content);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        String subject = "Reset Your PrepAce Password";
        String content = "<h1>Password Reset Request</h1>"
                + "<p>You requested to reset your password. Click the link below to set a new password:</p>"
                + "<a href=\"" + resetLink + "\">Reset Password</a>"
                + "<p>This link will expire in 15 minutes.</p>";
        sendEmail(toEmail, subject, content);
    }

    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(EmailService.class);

    private void sendEmail(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            LOGGER.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
