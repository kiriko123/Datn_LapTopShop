package com.datn.be.repository;

import com.datn.be.model.VoucherUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<VoucherUser, Long> {

    // Tìm kiếm voucher của người dùng theo userId và voucherCode
    Optional<VoucherUser> findByUserIdAndVoucherVoucherCode(Long userId, String voucherCode);

    // Tìm tất cả voucher của người dùng theo userId
    List<VoucherUser> findByUserId(Long userId);

    // Kiểm tra xem người dùng đã sử dụng voucher nào đó chưa
    boolean existsByUserIdAndVoucherVoucherCode(Long userId, String voucherCode);

    // Xóa tất cả các voucher của người dùng
    void deleteByUserId(Long userId);
}
