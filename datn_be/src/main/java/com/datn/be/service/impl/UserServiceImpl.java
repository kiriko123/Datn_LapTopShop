package com.datn.be.service.impl;

import com.datn.be.dto.request.user.AdminBulkCreateUserDTO;
import com.datn.be.dto.request.user.AdminCreateUserDTO;
import com.datn.be.dto.request.user.AdminUpdateUserDTO;
import com.datn.be.dto.response.ResultPaginationResponse;
import com.datn.be.dto.response.user.UserResponse;
import com.datn.be.service.UserService;
import com.datn.be.exception.InvalidDataException;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.User;
import com.datn.be.repository.RoleRepository;
import com.datn.be.repository.UserRepository;
import com.datn.be.util.EmailValidator;
import com.datn.be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public UserResponse save(AdminCreateUserDTO adminCreateUserDTO) {

        if (userRepository.existsByEmail(adminCreateUserDTO.getEmail())) {
            throw new InvalidDataException("Email already exists");
        }

        if(!adminCreateUserDTO.getPassword().equals(adminCreateUserDTO.getPasswordConfirm())) {
            throw new InvalidDataException("Passwords do not match");
        }

        User user = User.builder()
                .email(adminCreateUserDTO.getEmail())
                .password(passwordEncoder.encode(adminCreateUserDTO.getPassword()))
                .phoneNumber(adminCreateUserDTO.getPhoneNumber())
                .age(adminCreateUserDTO.getAge())
                .name(adminCreateUserDTO.getName())
                .firstName(adminCreateUserDTO.getFirstName())
                .address(adminCreateUserDTO.getAddress())
                .gender(adminCreateUserDTO.getGender())
                .role(roleRepository.findByName("ROLE_USER"))
                .enabled(true)
                .imageUrl("user.png")
                .build();

        return UserResponse.fromUserToUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(AdminUpdateUserDTO adminUpdateUserDTO) {
        User user = this.findById(adminUpdateUserDTO.getId());

        if(user.getRole().getName().equals("ROLE_ADMIN")) {
            if(adminUpdateUserDTO.isEnabled() != user.isEnabled()){
                throw new InvalidDataException("Admin role cannot be updated Enabled");
            }
        }

        user.setName(adminUpdateUserDTO.getName());
        user.setFirstName(adminUpdateUserDTO.getFirstName());
        user.setAddress(adminUpdateUserDTO.getAddress());
        user.setGender(adminUpdateUserDTO.getGender());
        user.setAge(adminUpdateUserDTO.getAge());
        user.setPhoneNumber(adminUpdateUserDTO.getPhoneNumber());
        user.setEnabled(adminUpdateUserDTO.isEnabled());
        return UserResponse.fromUserToUserResponse(userRepository.save(user));
    }


    @Override
    public void delete(Long id) {

        User user = findById(id);
        String email = SecurityUtil.getCurrentUserLogin().orElse("");

        if (user.getEmail().equals(email)) {
            throw new RuntimeException("Không thể xóa user hiện tại của bạn");
        }
        if (user.getRole().getName().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Không thể xóa ADMIN");
        }

//        if(user.isEnabled()){
//            user.setEnabled(false);
//            userRepository.save(user);
//        }else{
//            userRepository.delete(user);
//        }
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public ResultPaginationResponse findAll(Specification<User> spec, Pageable pageable) {

        Page<User> users = userRepository.findAll(spec, pageable);

        ResultPaginationResponse.Meta meta = ResultPaginationResponse.Meta.builder()
                .total(users.getTotalElements())
                .pages(users.getTotalPages())
                .page(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .build();

        List<UserResponse> userResponses = users.getContent().stream().map(UserResponse::fromUserToUserResponse).toList();

        return ResultPaginationResponse.builder()
                .meta(meta)
                .result(userResponses)
                .build();
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void updateUserToken(String token, String email) {
        User user = findByEmail(email);
        user.setRefreshToken(token);
        userRepository.save(user);
    }

    @Override
    public User getUserByEmailAndRefreshToken(String email, String refreshToken) {
        return userRepository.findByEmailAndRefreshToken(email, refreshToken);
    }

    @Override
    public String bulkCreateUser(List<AdminBulkCreateUserDTO> adminBulkCreateUserDTOS) {
        int error = 0;
        int success = 0;
        for (AdminBulkCreateUserDTO adminBulkCreateUserDTO : adminBulkCreateUserDTOS) {
            if(userRepository.existsByEmail(adminBulkCreateUserDTO.getEmail())) {
                error++;
                continue;
            }
            if(!EmailValidator.isValidEmail(adminBulkCreateUserDTO.getEmail())){
                error++;
                continue;
            }
            if(adminBulkCreateUserDTO.getName().isBlank()
                    || adminBulkCreateUserDTO.getPassword().isBlank()
                    || adminBulkCreateUserDTO.getName().isEmpty()
                    || adminBulkCreateUserDTO.getPassword().isEmpty()
                    || adminBulkCreateUserDTO.getPhoneNumber().isBlank()
                    || adminBulkCreateUserDTO.getPhoneNumber().isEmpty()
                    || adminBulkCreateUserDTO.getFirstName().isBlank()
                    || adminBulkCreateUserDTO.getFirstName().isEmpty()
                    || adminBulkCreateUserDTO.getAddress().isBlank()
                    || adminBulkCreateUserDTO.getAddress().isEmpty()
            ){
                error++;
                continue;
            }
            User user = userRepository.save(
                    User.builder()
                            .name(adminBulkCreateUserDTO.getName())
                            .password(passwordEncoder.encode(adminBulkCreateUserDTO.getPassword()))
                            .email(adminBulkCreateUserDTO.getEmail())
                            .gender(adminBulkCreateUserDTO.getGender())
                            .imageUrl("user.png")
                            .phoneNumber(adminBulkCreateUserDTO.getPhoneNumber())
                            .address(adminBulkCreateUserDTO.getAddress())
                            .age(adminBulkCreateUserDTO.getAge())
                            .firstName(adminBulkCreateUserDTO.getFirstName())
                            .role(roleRepository.findByName("ROLE_USER"))
                            .enabled(true)
                            .build()
            );
            success++;
        }

        return "Success: " + success + " Error: " + error;
    }

    @Override
    public long countAllUser() {
        return userRepository.count();
    }
}