package com.postman.fake_postman.service;

import com.postman.fake_postman.model.ApiRequest;
import com.postman.fake_postman.model.ApiResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.ObjectMapper;

import java.util.Objects;

@Service
public class ApiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ApiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    public ApiResponse executeRequest(final ApiRequest request) {
        final HttpMethod httpMethod = HttpMethod.valueOf(request.method().toUpperCase());
        final RestClient.RequestBodyUriSpec requestSpec = restClient.method(httpMethod);
        final RestClient.RequestBodySpec bodySpec = requestSpec.uri(request.url());

        if (Objects.nonNull(request.headers())) {
            request.headers().forEach(bodySpec::header);
        }

        if (Objects.nonNull(request.headers()) && supportsBody(httpMethod)) {
            bodySpec.body(request.body());
        }

        try {
            ResponseEntity<String> response = bodySpec.retrieve().toEntity(String.class);
            return new ApiResponse(
                    response.getStatusCode().value(),
                    parseBody(response.getBody())
            );

        } catch (RestClientResponseException e) {
            return new ApiResponse(
                    e.getStatusCode().value(),
                    parseBody(e.getResponseBodyAsString())
            );
        }
    }

    private boolean supportsBody(final HttpMethod method) {
        return method.equals(HttpMethod.POST) ||
                method.equals(HttpMethod.PUT) ||
                method.equals(HttpMethod.PATCH);
    }

    private Object parseBody(final String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(rawBody);
        } catch (Exception e) {
            return rawBody;
        }
    }
}