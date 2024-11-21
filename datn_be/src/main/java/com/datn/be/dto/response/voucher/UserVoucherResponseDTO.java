package com.datn.be.dto.response.voucher;

import com.datn.be.model.VoucherUser;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserVoucherResponseDTO {
    private Long voucherId;
    private String voucherCode;
    private String message;  // Thêm trường message để gửi thông báo

    public static UserVoucherResponseDTO fromVoucherUser(VoucherUser voucherUser, String message) {
        return UserVoucherResponseDTO.builder()
                .voucherId(voucherUser.getVoucher().getId())
                .voucherCode(voucherUser.getVoucher().getVoucherCode())
                .message(message)  // Truyền thông báo cho người dùng
                .build();
    }
}
