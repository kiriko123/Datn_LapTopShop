package com.datn.be.service;

import com.datn.be.dto.request.product.ProductCreateDTO;
import com.datn.be.dto.request.product.ProductUpdateDTO;
import com.datn.be.dto.response.ResultPaginationResponse;
import com.datn.be.dto.response.product.ProductResponse;
import com.datn.be.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public interface ProductService {
    ProductResponse create(ProductCreateDTO productCreateDTO);
    ProductResponse update(ProductUpdateDTO productUpdateDTO);
    Product getProduct(Long id);
    ResultPaginationResponse findAll(Specification<Product> spec, Pageable pageable);

    void delete(long productId);
    List<Product> getAll();

}
