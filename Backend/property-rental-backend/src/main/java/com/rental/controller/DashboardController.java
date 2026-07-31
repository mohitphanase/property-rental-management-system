package com.rental.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.DashboardResponseDto;
import com.rental.service.DashboardServiceImpl;
import com.rental.dto.Resp;

@RestController
@RequestMapping("/owner/dashboard")
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    public DashboardController(DashboardServiceImpl dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public Resp<DashboardResponseDto> getDashboard() {
        return Resp.success(dashboardService.getDashboardData());
    }
}