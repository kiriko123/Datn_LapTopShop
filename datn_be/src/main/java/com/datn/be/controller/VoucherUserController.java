package com.datn.be.controller;

import com.datn.be.dto.response.RestResponse;
import com.datn.be.model.VoucherUser;
import com.datn.be.repository.VoucherUserRepository;
import com.datn.be.service.VoucherUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user-voucher")
@Slf4j
public class VoucherUserController {
    private final VoucherUserService userVoucherService;

    @PostMapping("/{userId}/claim/{voucherId}")
    public ResponseEntity<?> claimVoucher(@PathVariable Long userId, @PathVariable Long voucherId) {
        log.info("User {} claims Voucher {}", userId, voucherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(userVoucherService.claimVoucher(userId, voucherId));
    }

    @PostMapping("/{userId}/apply/{voucherId}")
    public RestResponse<?> applyVoucher(@PathVariable Long userId, @PathVariable Long voucherId) {
        log.info("User {} applies Voucher {}", userId, voucherId);
        userVoucherService.applyVoucher(userId, voucherId);
        return RestResponse.builder()
                .statusCode(200)
                .message("Voucher applied successfully")
                .build();
    }

    @GetMapping("/{userId}/available-vouchers")
    public ResponseEntity<?> getUserAvailableVouchers(@PathVariable Long userId) {
        log.info("Get available vouchers for user {}", userId);
        List<VoucherUser> availableVouchers = userVoucherService.getAvailableVouchersByUserId(userId);
        // Trả về ResponseEntity với mảng trống nếu không có voucher
        if (availableVouchers.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());  // Trả về mảng rỗng khi không có voucher
        }
        return ResponseEntity.ok(availableVouchers);
    }
}
