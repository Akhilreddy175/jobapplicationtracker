package com.akhil.jobapplicationtracker.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.service.ApplicationService;
import com.akhil.jobapplicationtracker.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin
public class ApplicationController {

    @Autowired
    private ApplicationService service;

    private String getEmailFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return JwtUtil.validateToken(token);
    }

    @PostMapping
    public Application create(@RequestBody Application app, HttpServletRequest request) {
        return service.saveApplication(app, getEmailFromRequest(request));
    }

    @GetMapping
    public List<Application> getAll(HttpServletRequest request) {
        return service.getAllApplications(getEmailFromRequest(request));
    }

    @GetMapping("/{id}")
    public Application getById(@PathVariable Long id, HttpServletRequest request) {
        return service.getApplicationById(id, getEmailFromRequest(request));
    }

    @PutMapping("/{id}")
    public Application update(@PathVariable Long id, @RequestBody Application app,
                              HttpServletRequest request) {
        return service.updateApplication(id, app, getEmailFromRequest(request));
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id, HttpServletRequest request) {
        service.deleteApplication(id, getEmailFromRequest(request));
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted successfully");
        return response;
    }

    @GetMapping("/status/{status}")
    public List<Application> getByStatus(@PathVariable String status, HttpServletRequest request) {
        return service.getByStatus(status, getEmailFromRequest(request));
    }

    @GetMapping("/search")
    public List<Application> search(@RequestParam String company, HttpServletRequest request) {
        return service.searchByCompany(company, getEmailFromRequest(request));
    }
}