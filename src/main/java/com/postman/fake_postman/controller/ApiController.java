package com.postman.fake_postman.controller;

import com.postman.fake_postman.model.ApiRequest;
import com.postman.fake_postman.model.ApiResponse;
import com.postman.fake_postman.service.ApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proxy")
public class ApiController {

    private final ApiService apiService;

    public ApiController(ApiService apiService) {
        this.apiService = apiService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse> executeDynamicRequest(@RequestBody ApiRequest apiRequest) {
        try {
//            System.out.println(Thread.currentThread().getName());
//            System.out.println("Is virtual: " + Thread.currentThread().isVirtual());
            ApiResponse response = apiService.executeRequest(apiRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(400, "Failed to execute request: " + e.getMessage()));
        }
    }
}