package com.akhil.jobapplicationtracker.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.service.ApplicationService;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin
public class ApplicationController {

    @Autowired
    private ApplicationService service;

    
    @PostMapping
    public Application create(@RequestBody Application app) {
        return service.saveApplication(app);
    }

    
    @GetMapping
    public List<Application> getAll() {
        return service.getAllApplications();
    }

    
    @GetMapping("/{id}")
    public Application getById(@PathVariable Long id) {
        return service.getApplicationById(id);
    }

    
    @PutMapping("/{id}")
    public Application update(@PathVariable Long id, @RequestBody Application app) {
        return service.updateApplication(id, app);
    }
    
    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        service.deleteApplication(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted successfully");

        return response;
    }
    
    @GetMapping("/status/{status}")
    public List<Application> getByStatus(@PathVariable String status) {
        return service.getByStatus(status);
    }

    
    @GetMapping("/search")
    public List<Application> search(@RequestParam String company) {
        return service.searchByCompany(company);
    }
}