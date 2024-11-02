package com.datn.be.service;

import com.datn.be.model.Order;
import jakarta.mail.MessagingException;

public interface EmailService {
     void sendVerificationEmail(String to, String subject, String text) throws MessagingException;
     void sendOrderInvoice(String to, Order order) throws MessagingException;
}