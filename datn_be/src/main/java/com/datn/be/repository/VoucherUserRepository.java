package com.datn.be.repository;

import com.datn.be.model.User;
import com.datn.be.model.Voucher;
import com.datn.be.model.VoucherUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoucherUserRepository extends JpaRepository<VoucherUser, Long> {
    boolean existsByUserAndVoucher(User user, Voucher voucher);

    Optional<VoucherUser> findByUserIdAndVoucherId(Long userId, Long voucherId);

    // Thêm phương thức này
    List<VoucherUser> findByUserIdAndUseDateIsNull(Long userId);
}
