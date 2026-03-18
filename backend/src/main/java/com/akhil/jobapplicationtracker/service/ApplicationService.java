package com.akhil.jobapplicationtracker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.repository.ApplicationRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository repository;

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    public Application createApplication(Application application) {
        return repository.save(application);
    }

    public void deleteApplication(Long id) {
        repository.deleteById(id);
    }

}