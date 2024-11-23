package com.datn.be.configuration;

import com.datn.be.util.SecurityUtil;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;


import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import static com.datn.be.util.SecurityUtil.JWT_ALGORITHM;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {

    @Value("${khang.jwt.base64-secret}")
    private String jwtKey;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey())
                .macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();
        return token -> {
            Jwt jwt = jwtDecoder.decode(token);
            System.out.println("Decoded JWT Claims: " + jwt.getClaims());  // Log claims to debug
            return jwt;
        };
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomAuthenticationEntryPoint customAuthenticationEntryPoint)
            throws Exception {

        String[] whiteList = {
                "/",
                "/api/v1/auth/login",
                "/api/v1/auth/refresh",
                "/api/v1/auth/register",
                "/api/v1/auth/verify",
                "/api/v1/auth/google",
                "/api/v1/sliders/**",
                "/api/v1/ratings/**",
                "/api/v1/auth/forgot",
                "/api/v1/auth/reset-password",
                "/api/v1/auth/resend",
                "/storage/**",
                "/api/v1/email/**",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
        };

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(
                        authz -> authz
                                .requestMatchers(whiteList).permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/product").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/product/{id}").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/voucher").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/v1/user-voucher/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/brand").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/voucher").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/category").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/category/getAll").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/brand/getAll").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/product").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/payment/vn-pay").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/payment/vn-pay-callback").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/user").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/v1/user/**").hasRole("ADMIN")

                                .requestMatchers("/admin/**").hasRole("ADMIN")  // Admin-only endpoints
                                .requestMatchers("/user/**").hasAnyRole("ADMIN", "USER")  // Accessible to both roles
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))  // Set the JWT converter
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }


    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("");  // Map roles correctly
        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}
