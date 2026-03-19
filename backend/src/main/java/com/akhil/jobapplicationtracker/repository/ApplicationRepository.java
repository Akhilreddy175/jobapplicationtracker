package com.akhil.jobapplicationtracker.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.akhil.jobapplicationtracker.model.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserEmail(String userEmail);
    List<Application> findByStatusAndUserEmail(String status, String userEmail);
    List<Application> findByCompanyContainingIgnoreCaseAndUserEmail(String company, String userEmail);
    Optional<Application> findByIdAndUserEmail(Long id, String userEmail);
}