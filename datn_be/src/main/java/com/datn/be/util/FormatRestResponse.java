package com.datn.be.util;

import com.datn.be.dto.response.RestResponse;
import com.datn.be.dto.response.voucher.UserVoucherResponseDTO;
import com.datn.be.util.annotation.ApiMessage;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@ControllerAdvice

public class FormatRestResponse implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {
        HttpServletResponse servletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int status = servletResponse.getStatus();

        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(status);

        String path = request.getURI().getPath();
        if (path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui")) {
            return body;
        }

        if (body instanceof String || body instanceof Resource) {
            return body;
        }

        if (status >= 400) {
            return body;
        } else {
            res.setData(body);
//            ApiMessage message = returnType.getMethodAnnotation(ApiMessage.class);
//            res.setMessage(message != null ? message.value() : "CALL API SUCCESS");
            // Lấy message từ body nếu tồn tại
            String customMessage = null;
            if (body instanceof UserVoucherResponseDTO) {
                customMessage = ((UserVoucherResponseDTO) body).getMessage();
            }
            ApiMessage annotationMessage = returnType.getMethodAnnotation(ApiMessage.class);

            // Ưu tiên message từ body, sau đó đến annotation
            res.setMessage(customMessage != null ? customMessage : (annotationMessage != null ? annotationMessage.value() : "CALL API SUCCESS"));
        }

        return res;
    }

}
