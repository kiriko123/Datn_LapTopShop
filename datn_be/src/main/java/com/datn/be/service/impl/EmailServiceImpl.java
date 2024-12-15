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
        currencyFormatter.setGroupingUsed(true);

        // Tiêu đề email
        String subject = "Hóa đơn đặt hàng " + order.getOrderNumber();
        StringBuilder emailContent = new StringBuilder();

        // Tạo nội dung email
        emailContent.append("<div style='font-family: Arial, sans-serif; line-height: 1.6;'>");
        emailContent.append("<h1 style='color: #CC0000;'>Hóa đơn đặt hàng</h1>");
        emailContent.append("<p>Xin chào <strong>")
                .append(order.getUser().getFirstName()) // Họ
                .append(" ")
                .append(order.getUser().getName()) // Tên
                .append("</strong>,</p>");
        emailContent.append("<p>Cảm ơn bạn đã đặt hàng tại <strong>Laptop Shop</strong>. Dưới đây là thông tin đơn hàng của bạn:</p>");

        // Thông tin giao hàng
        emailContent.append("<h3 style='color: #333;'>Thông tin giao hàng</h3>");
        emailContent.append("<p><strong>Địa chỉ:</strong> ").append(order.getReceiverAddress()).append("</p>");
        emailContent.append("<p><strong>Số điện thoại:</strong> ").append(order.getReceiverPhone()).append("</p>");

        // Bảng sản phẩm
        emailContent.append("<h3 style='color: #333;'>Chi tiết đơn hàng</h3>");
        emailContent.append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>");
        emailContent.append("<thead style='background-color: #FFCC33;'>");
        emailContent.append("<tr>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>STT</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Sản phẩm</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Giá</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Số lượng</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Giảm giá</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Tổng</th>")
                .append("</tr>");
        emailContent.append("</thead>");
        emailContent.append("<tbody>");

        int stt = 1;
        for (OrderDetail detail : order.getOrderDetails()) {
            double total = detail.getPrice() * detail.getQuantity() * (1 - detail.getDiscount() / 100.0);
            emailContent.append("<tr>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(stt++).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(detail.getProductName()).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>").append(currencyFormatter.format(detail.getPrice())).append(" VNĐ</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>").append(detail.getQuantity()).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>").append((int) detail.getDiscount()).append("%</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>").append(currencyFormatter.format(total)).append(" VNĐ</td>")
                    .append("</tr>");
        }

        // Tổng giá trị
        if (order.getVoucherCode() != null && !order.getVoucherCode().isEmpty()) {
            emailContent.append("<tr style='background-color: #f9f9f9;'>")
                    .append("<td colspan='5' style='border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>Voucher: ").append(order.getVoucherCode()).append("</strong></td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>-").append(order.getVoucherValue()).append("%</td>")
                    .append("</tr>");
        }
        emailContent.append("<tr style='background-color: #f8f8f8;'>")
                .append("<td colspan='5' style='background-color: #FFCC33; border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>TỔNG TIỀN</strong></td>")
                .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>").append(currencyFormatter.format(order.getTotalPrice())).append(" VNĐ</strong></td>")
                .append("</tr>");
        emailContent.append("</tbody>");
        emailContent.append("</table>");

        emailContent.append("<p>Chúng tôi hy vọng bạn hài lòng với đơn hàng này. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.</p>");
        emailContent.append("<p>Chúc bạn 1 ngày tốt lành!</p>");
        emailContent.append("<p style='margin-top: 20px; font-size: 14px; '>Trân trọng,</p>");

        // Thêm chữ ký điện tử
        emailContent.append("<div style='margin-top: 30px; border-top: 1px solid #ddd;'>");
        emailContent.append("<p style='font-weight: bold; color: #CC0000;'>Laptop Shop</p>");
        emailContent.append("<p>Hotline: <a href='tel:0905008230' style='color: #007bff;'>0905008230</a></p>");
        emailContent.append("<p>Email: <a href='laptopshop2024@gmail.com' style='color: #007bff;'>laptopshop2024@gmail.com</a></p>");
        emailContent.append("</div>");
        emailContent.append("</div>");

        // Gửi email
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent.toString(), true);

        emailSender.send(message);
    }


    @Override
    public void sendOrderStatusUpdateEmail(String to, Order order) throws MessagingException {

        // Định dạng giá tiền
        NumberFormat currencyFormatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        currencyFormatter.setGroupingUsed(true);

        String subject = "Đơn hàng " +order.getOrderNumber()+ " đã được giao thành công ";
        StringBuilder emailContent = new StringBuilder();

        emailContent.append("<h1 style='color: #CC0000;'>Đơn hàng của bạn đã được giao thành công</h1>");
        emailContent.append("<p>Xin chào <strong>")
                .append(order.getUser().getFirstName()) // Họ
                .append(" ")
                .append(order.getUser().getName()) // Tên
                .append("</strong>,</p>");
        emailContent.append("<p>Cảm ơn bạn đã đặt hàng tại <strong>Laptop Shop</strong>. Dưới đây là thông tin đơn hàng của bạn:</p>");

        // Thông tin giao hàng
        emailContent.append("<p><strong>Địa chỉ:</strong> ").append(order.getReceiverAddress()).append("</p>");
        emailContent.append("<p><strong>Số điện thoại:</strong> ").append(order.getReceiverPhone()).append("</p>");

        // Bảng sản phẩm
        emailContent.append("<h3 style='color: #333;'>Chi tiết đơn hàng</h3>");
        emailContent.append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>");
        emailContent.append("<thead style='background-color: #FFCC33;'>");
        emailContent.append("<tr>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>STT</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Sản phẩm</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Giá</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Số lượng</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Giảm giá</th>")
                .append("<th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Tổng</th>")
                .append("</tr>");
        emailContent.append("</thead>");
        emailContent.append("<tbody>");

        int stt = 1;
        for (OrderDetail detail : order.getOrderDetails()) {
            double total = detail.getPrice() * detail.getQuantity() * (1 - detail.getDiscount() / 100.0);
            emailContent.append("<tr>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(stt++).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(detail.getProductName()).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>").append(currencyFormatter.format(detail.getPrice())).append(" VNĐ</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>").append(detail.getQuantity()).append("</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>").append((int) detail.getDiscount()).append("%</td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>").append(currencyFormatter.format(total)).append(" VNĐ</td>")
                    .append("</tr>");
        }

        // Tổng giá trị
        if (order.getVoucherCode() != null && !order.getVoucherCode().isEmpty()) {
            emailContent.append("<tr style='background-color: #f9f9f9;'>")
                    .append("<td colspan='5' style='border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>Voucher: ").append(order.getVoucherCode()).append("</strong></td>")
                    .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>-").append(order.getVoucherValue()).append("%</td>")
                    .append("</tr>");
        }
        emailContent.append("<tr style='background-color: #f8f8f8;'>")
                .append("<td colspan='5' style='background-color: #FFCC33; border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>TỔNG TIỀN</strong></td>")
                .append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'><strong>").append(currencyFormatter.format(order.getTotalPrice())).append(" VNĐ</strong></td>")
                .append("</tr>");
        emailContent.append("</tbody>");
        emailContent.append("</table>");

        emailContent.append("<p>Chân thành cảm ơn bạn đã tin tưởng và lựa chọn <strong>Laptop Shop</strong>. Chúng tôi hy vọng bạn hài lòng với đơn hàng này. Nếu có bất kỳ thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ</p>");
        emailContent.append("<p>Chúc bạn 1 ngày tốt lành!</p>");
        emailContent.append("<p style='margin-top: 20px; font-size: 14px; '>Trân trọng,</p>");

        // Thêm chữ ký điện tử
        emailContent.append("<div style='margin-top: 30px; border-top: 1px solid #ddd;'>");
        emailContent.append("<p style='font-weight: bold; color: #CC0000;'>Laptop Shop</p>");
        emailContent.append("<p>Hotline: <a href='tel:0905008230' style='color: #007bff;'>0905008230</a></p>");
        emailContent.append("<p>Email: <a href='laptopshop2024@gmail.com' style='color: #007bff;'>laptopshop2024@gmail.com</a></p>");
        emailContent.append("</div>");
        emailContent.append("</div>");

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent.toString(), true);

        emailSender.send(message);
    }

}
