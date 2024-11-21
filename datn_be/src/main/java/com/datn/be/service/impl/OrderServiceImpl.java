package com.datn.be.service.impl;

import com.datn.be.dto.request.order.OrderCreateDTO;
import com.datn.be.dto.request.order.UserOrderUpdateDTO;
import com.datn.be.dto.response.ResultPaginationResponse;
import com.datn.be.dto.response.order.OrderResponse;
import com.datn.be.exception.InvalidDataException;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.Order;
import com.datn.be.model.OrderDetail;
import com.datn.be.model.Voucher;
import com.datn.be.repository.*;
import com.datn.be.service.EmailService;
import com.datn.be.service.OrderService;
import com.datn.be.util.constant.OrderStatus;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final EmailService emailService;
    private final VoucherUserRepository voucherUserRepository;
    private final VoucherRepository voucherRepository;

    @Override
    public Order createOrder(OrderCreateDTO orderCreateDTO) {
        // Check if user exists before proceeding
        var user = userRepository.findById(orderCreateDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate all products and stock levels first
        var productMap = orderCreateDTO.getOrderDetails().stream().collect(
                java.util.stream.Collectors.toMap(
                        detail -> detail.getProductId(),
                        detail -> productRepository.findById(detail.getProductId())
                                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + detail.getProductId() + " does not exist"))
                )
        );

        // Check stock levels
        orderCreateDTO.getOrderDetails().forEach(detail -> {
            var product = productMap.get(detail.getProductId());
            if (product.getQuantity() < detail.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }
        });

        // If all validations pass, reduce stock quantities
        orderCreateDTO.getOrderDetails().forEach(detail -> {
            var product = productMap.get(detail.getProductId());
            product.setQuantity(product.getQuantity() - detail.getQuantity());
            product.setSold(product.getSold() + detail.getQuantity());
            productRepository.save(product);
        });

        // Kiểm tra và áp dụng voucher
        float voucherDiscount = 0;
        Voucher voucher = null;
        if (orderCreateDTO.getVoucherCode() != null) {
            voucher = voucherRepository.findByVoucherCode(orderCreateDTO.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));

            if (!voucher.isActive() || voucher.getEndDate().isBefore(Instant.now())) {
                throw new InvalidDataException("Voucher đã hết hạn hoặc không còn hiệu lực.");
            }
            // Kiểm tra điều kiện áp dụng (priceApply)
            if (orderCreateDTO.getTotalPrice() < voucher.getPriceApply()) {
                throw new InvalidDataException("Tổng giá trị đơn hàng không đủ điều kiện áp dụng voucher.");
            }

            voucherDiscount = voucher.getVoucherValue();
        }

        // Tính toán giá cuối sau khi áp dụng voucher
        float finalPrice = orderCreateDTO.getTotalPrice();

        // Lưu đối tượng Order vào cơ sở dữ liệu để có ID cho quan hệ
        Order order = Order.builder()
                .receiverName(orderCreateDTO.getReceiverName())
                .receiverAddress(orderCreateDTO.getReceiverAddress())
                .receiverPhone(orderCreateDTO.getReceiverPhone())
                .totalPrice(finalPrice)
                .paymentMethod(orderCreateDTO.getPaymentMethod())
                .status(orderCreateDTO.getStatus())
                .user(user)
                .voucherCode(voucher != null ? voucher.getVoucherCode() : null)  // Lưu mã voucher
                .voucherValue(voucher != null ? voucher.getVoucherValue() : 0)    // Lưu giá trị voucher
                .build();

        // Đảm bảo orderDetails không null
        order.setOrderDetails(new ArrayList<>());

        // Lưu đơn hàng vào cơ sở dữ liệu trước
        Order savedOrder = orderRepository.save(order);

        // Lưu từng OrderDetail và gắn vào savedOrder
        orderCreateDTO.getOrderDetails().forEach(detail -> {
            OrderDetail orderDetail = OrderDetail.builder()
                    .product(productMap.get(detail.getProductId()))
                    .order(savedOrder)
                    .productName(detail.getProductName())
                    .price(detail.getPrice())
                    .discount(detail.getDiscount())
                    .quantity(detail.getQuantity())
                    .build();
            orderDetailRepository.save(orderDetail);

            // Thêm orderDetail vào danh sách của savedOrder
            savedOrder.getOrderDetails().add(orderDetail);
        });

        // Lưu lại Order để cập nhật danh sách OrderDetail
        orderRepository.save(savedOrder);

        // Gửi email xác nhận hóa đơn
        try {
            emailService.sendOrderInvoice(user.getEmail(), savedOrder);
        } catch (MessagingException e) {
            throw new RuntimeException("Error sending invoice email.", e);
        }

        return savedOrder;
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        List<Order> orders = orderRepository.findAllByUserId(id);

        return orders.stream()
                .map(order -> {
                    List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());

                    List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                            .map(OrderResponse.OrderDetailResponse::fromOrderDetail)
                            .toList();

                    return OrderResponse.fromOrder(order, orderDetailResponses, order.getVoucherCode(), order.getVoucherValue());
                })
                .toList();

    }

    @Override
    public ResultPaginationResponse findAll(Specification<Order> spec, Pageable pageable) {
        // Tìm tất cả các đơn hàng dựa trên Specification và Pageable
        Page<Order> orders = orderRepository.findAll(spec, pageable);

        // Tạo metadata cho phân trang
        ResultPaginationResponse.Meta meta = ResultPaginationResponse.Meta.builder()
                .total(orders.getTotalElements())
                .pages(orders.getTotalPages())
                .page(pageable.getPageNumber() + 1)  // Trang hiện tại
                .pageSize(pageable.getPageSize())    // Số phần tử trên mỗi trang
                .build();

        // Chuyển đổi từng Order sang OrderResponse kèm theo OrderDetailResponse
        List<OrderResponse> orderResponses = orders.getContent().stream()
                .map(order -> {
                    // Lấy các OrderDetail của Order hiện tại
                    List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());

                    // Chuyển đổi từng OrderDetail sang OrderDetailResponse
                    List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                            .map(OrderResponse.OrderDetailResponse::fromOrderDetail)
                            .toList();

                    // Tạo OrderResponse từ Order và danh sách OrderDetailResponse
                    return OrderResponse.fromOrder(order, orderDetailResponses, order.getVoucherCode(), order.getVoucherValue());
                })
                .toList();

        // Trả về kết quả phân trang kèm theo danh sách các OrderResponse
        return ResultPaginationResponse.builder()
                .meta(meta)
                .result(orderResponses)  // Kết quả các đơn hàng
                .build();
    }

    @Override
    public List<OrderResponse> getAll() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .map(order -> {
                    List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());

                    List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                            .map(OrderResponse.OrderDetailResponse::fromOrderDetail)
                            .toList();

                    return OrderResponse.fromOrder(order, orderDetailResponses, order.getVoucherCode(), order.getVoucherValue());
                })
                .toList();
    }

    @Override
    public Order UserUpdateOrder(UserOrderUpdateDTO orderUpdateDTO) {
        Order currentOrder = orderRepository.findById(orderUpdateDTO.getId()).orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if(orderUpdateDTO.getCurrentStatus() == OrderStatus.PENDING){
            currentOrder.setReceiverAddress(orderUpdateDTO.getAddress());
            currentOrder.setDescription(orderUpdateDTO.getDescription());
            if(orderUpdateDTO.getCurrentStatus() == OrderStatus.PENDING && orderUpdateDTO.getNewStatus() == OrderStatus.CANCELLED) {
                currentOrder.setStatus(orderUpdateDTO.getNewStatus());
            }
        }else{
            throw new IllegalArgumentException("User không thể cập nhật trạng thái sau khi đơn hàng đã xử lý.");
        }


        return orderRepository.save(currentOrder);
    }

//    @Override
//    public Order AdminUpdateOrder(UserOrderUpdateDTO orderUpdateDTO) {
//        Order currentOrder = orderRepository.findById(orderUpdateDTO.getId()).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
//
//        currentOrder.setReceiverAddress(orderUpdateDTO.getAddress());
//        currentOrder.setDescription(orderUpdateDTO.getDescription());
//
//        currentOrder.setStatus(orderUpdateDTO.getNewStatus());
//
//        return orderRepository.save(currentOrder);
//    }

    @Override
    public Order AdminUpdateOrder(UserOrderUpdateDTO orderUpdateDTO) {
        Order currentOrder = orderRepository.findById(orderUpdateDTO.getId()).orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        currentOrder.setReceiverAddress(orderUpdateDTO.getAddress());
        currentOrder.setDescription(orderUpdateDTO.getDescription());
        currentOrder.setStatus(orderUpdateDTO.getNewStatus());

        Order updatedOrder = orderRepository.save(currentOrder);
        if(orderUpdateDTO.getNewStatus() == OrderStatus.DELIVERED) {
            try {
                emailService.sendOrderStatusUpdateEmail(currentOrder.getUser().getEmail(), updatedOrder);
            } catch (MessagingException e) {
                throw new RuntimeException("Error sending order status update email.", e);
            }
        }
        return updatedOrder;
    }

}