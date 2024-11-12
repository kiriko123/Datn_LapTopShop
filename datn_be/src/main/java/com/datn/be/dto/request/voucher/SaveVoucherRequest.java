package com.datn.be.dto.request.voucher;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaveVoucherRequest {
    private String userId;
    private String voucherCode;
}
