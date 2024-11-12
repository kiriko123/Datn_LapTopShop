package com.datn.be.dto.request.voucher;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaveVoucherRequest {
    private String userId;  // User ID gửi từ frontend
    private String voucherCode;  // Mã voucher
}
