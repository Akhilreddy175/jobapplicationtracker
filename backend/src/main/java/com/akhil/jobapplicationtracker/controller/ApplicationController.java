package com.akhil.jobapplicationtracker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.service.ApplicationService;

@RestController
@RequestMapping("/applications")
@CrossOrigin
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Application> getApplications() {
        return service.getAllApplications();
    }

    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        return service.createApplication(application);
    }

    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Long id) {
        service.deleteApplication(id);
    }
}