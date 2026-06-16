package com.rental.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tenant")
public class TenantController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Tenant Dashboard";
    }
}
