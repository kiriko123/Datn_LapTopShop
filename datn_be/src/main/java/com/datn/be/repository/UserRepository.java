package com.datn.be.repository;

import com.datn.be.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface UserRepository extends JpaRepository<User, Long> , JpaSpecificationExecutor<User> {
    User findByName(String name);
    User findByEmail(String email);
    boolean existsByEmail(String email);
    User findByEmailAndRefreshToken(String email, String refreshToken);
    User findByVerificationCode(String verificationCode);

}