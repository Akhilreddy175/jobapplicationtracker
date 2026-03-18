package com.akhil.jobapplicationtracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.service.ApplicationService;

@RestController
@RequestMapping("/applications")
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
    public String delete(@PathVariable Long id) {
        service.deleteApplication(id);
        return "Deleted successfully";
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