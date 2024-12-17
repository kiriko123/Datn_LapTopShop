package com.datn.be.service.impl;

import com.datn.be.dto.request.product.ProductCreateDTO;
import com.datn.be.dto.request.product.ProductUpdateDTO;
import com.datn.be.dto.response.ResultPaginationResponse;
import com.datn.be.dto.response.product.ProductResponse;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.Brand;
import com.datn.be.model.Category;
import com.datn.be.model.Product;
import com.datn.be.repository.BrandRepository;
import com.datn.be.repository.CategoryRepository;
import com.datn.be.repository.ProductRepository;
import com.datn.be.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Override
    public ProductResponse create(ProductCreateDTO productCreateDTO) {

        if(productRepository.existsByName(productCreateDTO.getName())) {
            throw new ResourceNotFoundException("Product with name " + productCreateDTO.getName() + " already exists");
        }

        Category category = categoryRepository.findById(productCreateDTO.getCategoryId()).orElse(null);
        if(category == null) {
            throw new ResourceNotFoundException("Category with id " + productCreateDTO.getCategoryId() + " does not exist");
        }

        Brand brand = brandRepository.findById(productCreateDTO.getBrandId()).orElse(null);
        if(brand == null) {
            throw new ResourceNotFoundException("Brand with id " + productCreateDTO.getBrandId() + " does not exist");
        }

        Product product = Product.builder()
                .name(productCreateDTO.getName())
                .category(category)
                .brand(brand)
                .price(productCreateDTO.getPrice())
                .discount(productCreateDTO.getDiscount())
                .description(productCreateDTO.getDescription())
                .thumbnail(productCreateDTO.getThumbnail())
                .quantity(productCreateDTO.getQuantity())
                .sold(productCreateDTO.getSold())
                .sale(productCreateDTO.isSale())
                .hot(productCreateDTO.isHot())
                .images(productCreateDTO.getImages())
                .active(true)
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    @Override
    public ProductResponse update(ProductUpdateDTO productUpdateDTO) {

        Product currentProduct = getProduct(productUpdateDTO.getId());

        Category category = categoryRepository.findById(productUpdateDTO.getCategoryId()).orElse(null);
        if(category == null) {
            throw new ResourceNotFoundException("Category with id " + productUpdateDTO.getCategoryId() + " does not exist");
        }

        Brand brand = brandRepository.findById(productUpdateDTO.getBrandId()).orElse(null);
        if(brand == null) {
            throw new ResourceNotFoundException("Brand with id " + productUpdateDTO.getBrandId() + " does not exist");
        }

        if(!currentProduct.getName().equals(productUpdateDTO.getName())) {
            if(productRepository.existsByName(productUpdateDTO.getName())) {
                throw new ResourceNotFoundException("Product with name " + productUpdateDTO.getName() + " already exists");
            }
            currentProduct.setName(productUpdateDTO.getName());
        }

        currentProduct.setCategory(category);
        currentProduct.setBrand(brand);
        currentProduct.setDescription(productUpdateDTO.getDescription());
        currentProduct.setThumbnail(productUpdateDTO.getThumbnail());
        currentProduct.setQuantity(productUpdateDTO.getQuantity());
        currentProduct.setSold(productUpdateDTO.getSold());
        currentProduct.setSale(productUpdateDTO.isSale());
        currentProduct.setHot(productUpdateDTO.isHot());
        currentProduct.setImages(productUpdateDTO.getImages());
        currentProduct.setPrice(productUpdateDTO.getPrice());
        currentProduct.setQuantity(productUpdateDTO.getQuantity());
        currentProduct.setDiscount(productUpdateDTO.getDiscount());
        currentProduct.setActive(productUpdateDTO.isActive());

        return ProductResponse.from(productRepository.save(currentProduct));
    }

    @Override
    public Product getProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Override
    public ResultPaginationResponse findAll(Specification<Product> spec, Pageable pageable) {

        Page<Product> products = productRepository.findAll(spec, pageable);

        ResultPaginationResponse.Meta meta = ResultPaginationResponse.Meta.builder()
                .total(products.getTotalElements())
                .pages(products.getTotalPages())
                .page(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .build();

        List<ProductResponse> productResponses = products.getContent().stream().map(ProductResponse::from).toList();

        return ResultPaginationResponse.builder()
                .meta(meta)
                .result(productResponses)
                .build();
    }

    @Override
    public void delete(long productId) {
        Product product = getProduct(productId);
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }
}
