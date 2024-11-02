package com.datn.be.controller;

import com.datn.be.dto.request.voucher.VoucherCreateRequestDTO;
import com.datn.be.dto.request.voucher.VoucherUpdateRequestDTO;
import com.datn.be.dto.response.RestResponse;
import com.datn.be.model.Voucher;
import com.datn.be.service.VoucherService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/voucher")
@Validated
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<?> getAllVoucher(@Filter Specification<Voucher> specification, Pageable pageable){
        log.info("Get All Voucher");
        return ResponseEntity.ok(voucherService.getAllVouchers(specification, pageable));
    }

    @PostMapping
    public ResponseEntity<?> createVoucher(@Valid @RequestBody VoucherCreateRequestDTO voucherCreteRequestDTO){
        log.info("Create Voucher: {}", voucherCreteRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.create(voucherCreteRequestDTO));
    }

    @PutMapping
    public ResponseEntity<?> updateVoucher(@Valid @RequestBody VoucherUpdateRequestDTO voucherUpdateRequestDTO){
        log.info("Update Voucher: {}", voucherUpdateRequestDTO);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(voucherService.update(voucherUpdateRequestDTO));
    }
    @DeleteMapping("/{id}")
    public RestResponse<?> deleteVoucher(@PathVariable Long id){
        log.info("Delete Voucher: {}", id);
        voucherService.delete(id);
        return RestResponse.builder()
                .statusCode(204)
                .message("Voucher Deleted")
                .build();
    }
}
