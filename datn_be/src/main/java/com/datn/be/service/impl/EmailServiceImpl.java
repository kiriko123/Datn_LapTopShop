package com.datn.be.service.impl;

import com.datn.be.model.Order;
import com.datn.be.model.OrderDetail;
import com.datn.be.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender emailSender;

    @Override
    public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        emailSender.send(message);
    }

    @Override
    public void sendOrderInvoice(String to, Order order) throws MessagingException {
        // Định dạng giá tiền
        NumberFormat currencyFormatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        currencyFormatter.setGroupingUsed(true); // Thêm dấu phân cách hàng nghìn

        // Tạo nội dung email
        String subject = "Hóa đơn đặt hàng #" + order.getId();
        StringBuilder emailContent = new StringBuilder();

        emailContent.append("<h1>Hóa đơn đặt hàng</h1>");
        emailContent.append("<p>Xin chào, " + order.getUser().getName() + "</p>");
        emailContent.append("<p>Cảm ơn bạn đã đặt hàng!</p>");
        emailContent.append("<p>Dưới đây là thông tin đơn hàng của bạn:</p>");
        emailContent.append("<ul>");

        for (OrderDetail detail : order.getOrderDetails()) {
            double total = detail.getPrice() * detail.getQuantity();
            emailContent.append("<li>")
                    .append(detail.getProductName())
                    .append(" - Giá: ")
//                    .append(detail.getPrice())
                    .append(currencyFormatter.format(detail.getPrice()))
                    .append(" VNĐ, Số lượng: ")
                    .append(detail.getQuantity())
                    .append(", Tổng: ")
//                    .append(detail.getPrice() * detail.getQuantity())
                    .append(currencyFormatter.format(total))
                    .append(" VNĐ")
                    .append("</li>");
        }

        emailContent.append("</ul>");
//        emailContent.append("<p>Tổng số tiền: " + order.getTotalPrice() + " VNĐ</p>");
        emailContent.append("<p>Tổng số tiền: " + currencyFormatter.format(order.getTotalPrice()) + " VNĐ</p>");
        emailContent.append("<p>Địa chỉ giao hàng: " + order.getReceiverAddress() + "</p>");
        emailContent.append("<p>Số điện thoại: " + order.getReceiverPhone() + "</p>");
        emailContent.append("<p>Chúc bạn một ngày tốt lành!</p>");

        // Tạo và gửi email
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent.toString(), true); // true để gửi email ở dạng HTML

        emailSender.send(message);
    }
}
