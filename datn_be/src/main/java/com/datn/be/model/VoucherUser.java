package com.datn.be.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "voucher_user") // Đảm bảo tên bảng là voucher_user
public class VoucherUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;  // ID của bản ghi

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;  // Liên kết với bảng User, trường user_id là khóa ngoại

    @ManyToOne
    @JoinColumn(name = "voucher_id", nullable = false)
    Voucher voucher;  // Liên kết với bảng Voucher, trường voucher_id là khóa ngoại

    @Column(name = "use_date")
    Instant useDate;  // Lưu ngày sử dụng voucher của người dùng

    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt = Instant.now();  // Lưu thời gian tạo bản ghi

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();  // Đảm bảo createdAt luôn có giá trị khi thêm mới
        }
//        if (this.useDate == null) {
//            this.useDate = Instant.now();  // Mặc định useDate khi không có giá trị
//        }
    }
}
