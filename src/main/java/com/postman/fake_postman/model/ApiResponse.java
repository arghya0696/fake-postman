package com.postman.fake_postman.model;

import java.util.List;
import java.util.Map;

public record ApiResponse(
        int statusCode,
        Object body
) {}
