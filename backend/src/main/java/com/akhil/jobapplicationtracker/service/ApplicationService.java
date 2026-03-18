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

    
    public Application saveApplication(Application app) {
        return repository.save(app);
    }

    
    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    
    public Application getApplicationById(Long id) {
        return repository.findById(id).orElse(null);
    }

    
    public Application updateApplication(Long id, Application updatedApp) {
        Application existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setCompany(updatedApp.getCompany());
            existing.setRole(updatedApp.getRole());
            existing.setDateApplied(updatedApp.getDateApplied());
            existing.setStatus(updatedApp.getStatus());
            existing.setNotes(updatedApp.getNotes());

            return repository.save(existing);
        }
        return null;
    }

    
    public void deleteApplication(Long id) {
        repository.deleteById(id);
    }

    
    public List<Application> getByStatus(String status) {
        return repository.findByStatus(status);
    }

    
    public List<Application> searchByCompany(String company) {
        return repository.findByCompanyContainingIgnoreCase(company);
    }
}