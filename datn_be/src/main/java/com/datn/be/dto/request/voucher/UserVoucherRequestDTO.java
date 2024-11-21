package com.datn.be.dto.request.voucher;

import lombok.Data;

@Data
public class UserVoucherRequestDTO {
    private Long userId;
    private Long voucherId;
}
