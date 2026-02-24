package com.postman.fake_postman.model;

import java.util.Map;

public record ApiRequest(String url, String method, Map<String, String> headers, Object body) {
}
