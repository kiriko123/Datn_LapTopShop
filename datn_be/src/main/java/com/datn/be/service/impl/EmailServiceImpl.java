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

        // Tạo bảng sản phẩm
        emailContent.append("<table style='width:100%; border-collapse: collapse;'>");
        emailContent.append("<tr>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>STT</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Sản phẩm</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Giá</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Số lượng</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Giảm giá</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Tổng</th>")
                .append("</tr>");

        int stt = 1;
        for (OrderDetail detail : order.getOrderDetails()) {
            double total = detail.getPrice() * detail.getQuantity() * (1 - detail.getDiscount() / 100.0);
            emailContent.append("<tr>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(stt++).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(detail.getProductName()).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(currencyFormatter.format(detail.getPrice())).append(" VNĐ</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(detail.getQuantity()).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append((int) detail.getDiscount()).append("%</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(currencyFormatter.format(total)).append(" VNĐ</td>")
                    .append("</tr>");
        }

        // Hàng tổng tiền
        emailContent.append("<tr>")
                .append("<td colspan='5' style='border: 1px solid #dddddd; padding: 8px; text-align: right;'><strong>Tổng tiền</strong></td>")
                .append("<td style='border: 1px solid #dddddd; padding: 8px;'><strong>").append(currencyFormatter.format(order.getTotalPrice())).append(" VNĐ</strong></td>")
                .append("</tr>");
        emailContent.append("</table>");

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

    @Override
    public void sendOrderStatusUpdateEmail(String to, Order order) throws MessagingException {
        String subject = "Cập nhật trạng thái đơn hàng #" + order.getId();
        StringBuilder emailContent = new StringBuilder();

        emailContent.append("<h1>Trạng thái đơn hàng của bạn đã được cập nhật</h1>");
        emailContent.append("<p>Xin chào, " + order.getUser().getName() + "</p>");
        emailContent.append("<p>Trạng thái mới của đơn hàng #" + order.getId() + " là: <strong>" + order.getStatus() + "</strong></p>");
        emailContent.append("<p>Thông tin đơn hàng:</p>");

        // Thêm chi tiết đơn hàng vào email
        emailContent.append("<table style='width:100%; border-collapse: collapse;'>");
        emailContent.append("<tr>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>STT</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Sản phẩm</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Giá</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Số lượng</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Giảm giá</th>")
                .append("<th style='border: 1px solid #dddddd; padding: 8px;'>Tổng</th>")
                .append("</tr>");

        NumberFormat currencyFormatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        int stt = 1;
        for (OrderDetail detail : order.getOrderDetails()) {
            double total = detail.getPrice() * detail.getQuantity() * (1 - detail.getDiscount() / 100.0);
            emailContent.append("<tr>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(stt++).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(detail.getProductName()).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(currencyFormatter.format(detail.getPrice())).append(" VNĐ</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(detail.getQuantity()).append("</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append((int) detail.getDiscount()).append("%</td>")
                    .append("<td style='border: 1px solid #dddddd; padding: 8px;'>").append(currencyFormatter.format(total)).append(" VNĐ</td>")
                    .append("</tr>");
        }
        emailContent.append("</table>");

        // Thông tin giao hàng
        emailContent.append("<p>Địa chỉ giao hàng: " + order.getReceiverAddress() + "</p>");
        emailContent.append("<p>Số điện thoại: " + order.getReceiverPhone() + "</p>");
        emailContent.append("<p>Chúc bạn một ngày tốt lành!</p>");

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent.toString(), true);

        emailSender.send(message);
    }

}
