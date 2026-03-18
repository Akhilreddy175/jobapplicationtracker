package com.akhil.jobapplicationtracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.akhil.jobapplicationtracker.model.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByStatus(String status);

}