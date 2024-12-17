package com.datn.be.service.impl;

import com.datn.be.dto.request.user.ChangePasswordDTO;
import com.datn.be.dto.request.user.RegisterRequestDTO;
import com.datn.be.dto.request.user.UserUpdateInfoDTO;
import com.datn.be.dto.response.user.UserResponse;
import com.datn.be.exception.InvalidDataException;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.User;
import com.datn.be.repository.RoleRepository;
import com.datn.be.repository.UserRepository;
import com.datn.be.service.EmailService;
import com.datn.be.service.AccountService;
import com.datn.be.util.constant.GenderEnum;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public UserResponse register(RegisterRequestDTO registerRequestDTO) {
        if (userRepository.existsByEmail(registerRequestDTO.getEmail())) {
            throw new InvalidDataException("Email already exists");
        }
        if(!registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword())) {
            throw new InvalidDataException("Passwords do not match");
        }
        User user = User.builder()
                .email(registerRequestDTO.getEmail())
                .name(registerRequestDTO.getName())
                .firstName(registerRequestDTO.getFirstName())
                .password(passwordEncoder.encode(registerRequestDTO.getPassword()))
                .role(roleRepository.findByName("ROLE_USER"))
                .verificationCode(this.generateVerificationCode())
                .verificationCodeExpiresAt(LocalDateTime.now().plusMinutes(21600)) //15 days
                .gender(GenderEnum.OTHER)
                .imageUrl("user.png")
                .enabled(false)
                .build();

        UserResponse userResponse = UserResponse.fromUserToUserResponse(userRepository.save(user));

        this.sendVerificationEmail(user);

        return userResponse;
    }

    @Override
    public void googleRegister(RegisterRequestDTO registerRequestDTO) {
        if (userRepository.existsByEmail(registerRequestDTO.getEmail())) {
            throw new InvalidDataException("Email already exists");
        }
        if(!registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword())) {
            throw new InvalidDataException("Passwords do not match");
        }
        User user = User.builder()
                .email(registerRequestDTO.getEmail())
                .name(registerRequestDTO.getName())
                .firstName(registerRequestDTO.getFirstName())
                .password(passwordEncoder.encode(registerRequestDTO.getPassword()))
                .role(roleRepository.findByName("ROLE_USER"))
                .gender(GenderEnum.OTHER)
                .imageUrl("user.png")
                .enabled(true)
                .googleAccount(true)
                .build();

        UserResponse.fromUserToUserResponse(userRepository.save(user));
    }

    @Override
    public void verifyUser(String verificationCode) {
        User user = userRepository.findByVerificationCode(verificationCode);
        if (user != null) {
            if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }
            user.setEnabled(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiresAt(null);
            userRepository.save(user);
        } else {
            throw new ResourceNotFoundException("User not found");
        }
    }

    @Override
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            if (user.isEnabled()) {
                throw new InvalidDataException("Account is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        } else {
            throw new ResourceNotFoundException("User not found");
        }
    }

    @Override
    public void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String verificationLink = "http://localhost:8080/api/v1/auth/verify?code=" + user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #e9ecef;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #333; text-align: center;\">Welcome to Our Application!</h2>"
                + "<p style=\"font-size: 16px; color: #555; text-align: center;\">To complete your registration, please click the link provided below:</p>"
                + "<div style=\"margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;\">"
                + "<h3 style=\"color: #333; margin-bottom: 10px;\">Verification link:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff; margin: 0;\">" + verificationLink + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #888; text-align: center;\">If you did not request this verification, please disregard this email.</p>"
                + "<p style=\"font-size: 14px; color: #888; text-align: center;\">Thank you for using our application!</p>"
                + "</div>"
                + "</body>"
                + "</html>";


        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            // Handle email sending exception
            e.printStackTrace();
        }
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if(!user.isEnabled()){
            throw new InvalidDataException("User is not enabled");
        }

        if(user.isGoogleAccount()){
            throw new InvalidDataException("Account is a google account");
        }

        // Generate new verification code
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));

        // Save the updated user
        userRepository.save(user);

        // Send password reset email
        sendPasswordResetEmail(user);
    }

    @Override
    public void resetPassword(String verificationCode, String newPassword) {
        User user = userRepository.findByVerificationCode(verificationCode);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        // Update the user's password and reset verification code
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);
    }

    @Override
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        User user = userRepository.findByEmail(changePasswordDTO.getEmail());
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if(!passwordEncoder.matches(changePasswordDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Password does not match");
        }
        if(!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new RuntimeException("Password does not match");
        }
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void updateUserInfo(UserUpdateInfoDTO userUpdateInfoDTO) {
        User currentUser = userRepository.findById(userUpdateInfoDTO.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        currentUser.setFirstName(userUpdateInfoDTO.getFirstName());
        currentUser.setGender(userUpdateInfoDTO.getGender());
        currentUser.setAge(userUpdateInfoDTO.getAge());
        currentUser.setImageUrl(userUpdateInfoDTO.getImageUrl());
        currentUser.setAddress(userUpdateInfoDTO.getAddress());
        currentUser.setName(userUpdateInfoDTO.getName());
        currentUser.setPhoneNumber(userUpdateInfoDTO.getPhoneNumber());

        userRepository.save(currentUser);
    }

    public void sendPasswordResetEmail(User user) {
        String subject = "Reset Your Password";
        String resetLink = "http://localhost:8080/api/v1/auth/reset-password?code=" + user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body>"
                + "<h2>Reset your password</h2>"
                + "<p>Click the link below to reset your password:</p>"
                + "<a href=\"" + resetLink + "\">Reset Password</a>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
