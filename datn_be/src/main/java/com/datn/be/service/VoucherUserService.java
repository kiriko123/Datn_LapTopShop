package com.datn.be.service;

import com.datn.be.dto.response.voucher.UserVoucherResponseDTO;
import com.datn.be.model.VoucherUser;

import java.util.List;


public interface VoucherUserService {
    UserVoucherResponseDTO claimVoucher(Long userId, Long voucherId);
    void applyVoucher(Long userId, Long voucherId);
    List<VoucherUser> getAvailableVouchersByUserId(Long userId);
}
