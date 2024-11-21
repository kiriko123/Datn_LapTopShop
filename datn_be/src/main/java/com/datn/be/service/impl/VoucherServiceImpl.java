package com.datn.be.service.impl;

import com.datn.be.dto.request.voucher.VoucherCreateRequestDTO;
import com.datn.be.dto.request.voucher.VoucherUpdateRequestDTO;
import com.datn.be.dto.response.ResultPaginationResponse;
import com.datn.be.dto.response.voucher.VoucherRespone;
import com.datn.be.exception.InvalidDataException;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.Voucher;
import com.datn.be.repository.VoucherRepository;
import com.datn.be.service.VoucherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository voucherRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    public ResultPaginationResponse getAllVouchers(Specification<Voucher> spec, Pageable pageable) {
        Page<Voucher> vouchers = voucherRepository.findAll(spec, pageable);

        ResultPaginationResponse.Meta meta = ResultPaginationResponse.Meta.builder()
                .total(vouchers.getTotalElements())
                .pages(vouchers.getTotalPages())
                .page(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .build();

        List<VoucherRespone> voucherResponses = vouchers.getContent().stream()
                .map(VoucherRespone::fromVoucherToVoucherRespone)
                .toList();

        return ResultPaginationResponse.builder()
                .meta(meta)
                .result(voucherResponses)
                .build();
    }

    @Override
    public VoucherRespone create(VoucherCreateRequestDTO voucherCreateRequestDTO) {
        if (voucherRepository.existsByVoucherCode(voucherCreateRequestDTO.getVoucherCode())) {
            throw new InvalidDataException("Voucher code already exists");
        }

        Voucher voucher = Voucher.builder()
                .voucherCode(voucherCreateRequestDTO.getVoucherCode())
                .voucherValue(voucherCreateRequestDTO.getVoucherValue())
                .priceApply(voucherCreateRequestDTO.getPriceApply())
                .description(voucherCreateRequestDTO.getDescription())
                .startDate(voucherCreateRequestDTO.getStartDate())
                .endDate(voucherCreateRequestDTO.getEndDate())
                .active(true)
                .build();
        return VoucherRespone.fromVoucherToVoucherRespone(voucherRepository.save(voucher));
    }

    @Override
    public VoucherRespone update(VoucherUpdateRequestDTO voucherUpdateRequestDTO) {
        Voucher voucher = this.getVoucherById(voucherUpdateRequestDTO.getId());

        voucher.setVoucherCode(voucherUpdateRequestDTO.getVoucherCode());
        voucher.setVoucherValue(voucherUpdateRequestDTO.getVoucherValue());
        voucher.setPriceApply(voucherUpdateRequestDTO.getPriceApply());
        voucher.setDescription(voucherUpdateRequestDTO.getDescription());
        voucher.setStartDate(voucherUpdateRequestDTO.getStartDate());
        voucher.setEndDate(voucherUpdateRequestDTO.getEndDate());
        voucher.setActive(voucherUpdateRequestDTO.isActive());

        return VoucherRespone.fromVoucherToVoucherRespone(voucherRepository.save(voucher));
    }

    @Override
    public void delete(Long id) {
        Voucher voucher = getVoucherById(id);
        voucher.setActive(false);
        voucherRepository.save(voucher);

    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }
}
