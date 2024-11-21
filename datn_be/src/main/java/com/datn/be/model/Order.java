package com.datn.be.model;

import com.datn.be.util.SecurityUtil;
import com.datn.be.util.constant.GenderEnum;
import com.datn.be.util.constant.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;

    String receiverName;

    String receiverPhone;

    String receiverAddress;

    float totalPrice;

    @Enumerated(EnumType.STRING)
    OrderStatus status;

    String paymentMethod;

    String description;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "voucher_value")
    private float voucherValue;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<OrderDetail> orderDetails = new ArrayList<>();

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedAt = Instant.now();
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get() : "";
    }
}
