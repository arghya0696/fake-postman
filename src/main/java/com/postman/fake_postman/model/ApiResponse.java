package com.postman.fake_postman.model;

import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.Map;

public record ApiResponse(
        int statusCode,
        Object body,
        Map<String, Object> headers
) {}
