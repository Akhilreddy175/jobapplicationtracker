package com.akhil.jobapplicationtracker.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.akhil.jobapplicationtracker.model.Application;
import com.akhil.jobapplicationtracker.repository.ApplicationRepository;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository repository;

    public Application saveApplication(Application app, String userEmail) {
        app.setUserEmail(userEmail);
        return repository.save(app);
    }

    public List<Application> getAllApplications(String userEmail) {
        return repository.findByUserEmail(userEmail);
    }

    public Application getApplicationById(Long id, String userEmail) {
        return repository.findByIdAndUserEmail(id, userEmail).orElse(null);
    }

    public Application updateApplication(Long id, Application updatedApp, String userEmail) {
        Application existing = repository.findByIdAndUserEmail(id, userEmail).orElse(null);
        if (existing != null) {
            existing.setCompany(updatedApp.getCompany());
            existing.setRole(updatedApp.getRole());
            existing.setAppliedDate(updatedApp.getAppliedDate());
            existing.setStatus(updatedApp.getStatus());
            existing.setNotes(updatedApp.getNotes());
            existing.setUrl(updatedApp.getUrl());
            existing.setFollowupDate(updatedApp.getFollowupDate());
            return repository.save(existing);
        }
        return null;
    }

    public void deleteApplication(Long id, String userEmail) {
        repository.findByIdAndUserEmail(id, userEmail)
                  .ifPresent(app -> repository.deleteById(id));
    }

    public List<Application> getByStatus(String status, String userEmail) {
        return repository.findByStatusAndUserEmail(status, userEmail);
    }

    public List<Application> searchByCompany(String company, String userEmail) {
        return repository.findByCompanyContainingIgnoreCaseAndUserEmail(company, userEmail);
    }
}