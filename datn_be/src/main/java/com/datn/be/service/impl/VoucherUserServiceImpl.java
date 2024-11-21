package com.datn.be.service.impl;

import com.datn.be.dto.response.voucher.UserVoucherResponseDTO;
import com.datn.be.exception.InvalidDataException;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.User;
import com.datn.be.model.Voucher;
import com.datn.be.model.VoucherUser;
import com.datn.be.repository.UserRepository;
import com.datn.be.repository.VoucherRepository;
import com.datn.be.repository.VoucherUserRepository;
import com.datn.be.service.VoucherUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherUserServiceImpl implements VoucherUserService {
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final VoucherUserRepository voucherUserRepository;

    @Override
    public UserVoucherResponseDTO claimVoucher(Long userId, Long voucherId) {
        // Kiểm tra người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vui lòng đăng nhập trước khi lưu voucher"));

        // Kiểm tra voucher
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher"));

        // Kiểm tra voucher có còn hiệu lực không
        if (!voucher.isActive() || voucher.getEndDate().isBefore(Instant.now())) {
            throw new InvalidDataException("Voucher này đã hết hạn sử dụng");
        }

        // Kiểm tra xem người dùng đã claim voucher này chưa
        VoucherUser voucherUser = voucherUserRepository.findByUserIdAndVoucherId(userId, voucherId)
                .orElse(null); // Tìm VoucherUser của người dùng với voucher tương ứng

        if (voucherUser != null) {
            // Nếu người dùng đã claim voucher này và trường useDate không phải là null
            if (voucherUser.getUseDate() != null) {
                // Nếu voucher đã được sử dụng, cho phép người dùng claim lại voucher này
                // Cập nhật useDate về null để người dùng có thể claim lại voucher
                voucherUser.setUseDate(null);  // Reset lại useDate về null
                voucherUserRepository.save(voucherUser); // Lưu lại bản ghi
                // Trả về thông báo đã reset voucher
                return UserVoucherResponseDTO.fromVoucherUser(voucherUser, "Voucher đã được bạn sử dụng và bạn có thể lưu lại.");
            } else {
                // Nếu useDate là null, có nghĩa là voucher chưa được sử dụng
                return UserVoucherResponseDTO.fromVoucherUser(voucherUser, "Bạn đã lưu voucher này rồi.");
            }
        } else {
            // Nếu voucherUser là null, tức là người dùng chưa claim voucher này, ta sẽ lưu voucher mới
            voucherUser = VoucherUser.builder()
                    .user(user)
                    .voucher(voucher)
                    .createdAt(Instant.now())
                    .build();
            voucherUserRepository.save(voucherUser); // Lưu mới voucherUser
            // Trả về thông báo đã lưu thành công voucher
            return UserVoucherResponseDTO.fromVoucherUser(voucherUser, "Voucher đã được lưu thành công.");
        }
    }

    @Override
    public void applyVoucher(Long userId, Long voucherId) {
        // Kiểm tra voucherUser
        VoucherUser voucherUser = voucherUserRepository.findByUserIdAndVoucherId(userId, voucherId)
                .orElseThrow(() -> new InvalidDataException("Voucher not found for user"));

        // Đánh dấu voucher đã sử dụng
        voucherUser.setUseDate(Instant.now());
        voucherUserRepository.save(voucherUser);
    }

    @Override
    public List<VoucherUser> getAvailableVouchersByUserId(Long userId) {
        List<VoucherUser> availableVouchers = voucherUserRepository.findByUserIdAndUseDateIsNull(userId);
//        if (availableVouchers.isEmpty()) {
//            throw new InvalidDataException("No available vouchers found for user");
//        }
        return availableVouchers;
    }
}
