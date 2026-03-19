package com.akhil.jobapplicationtracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.servlet.Filter;

@Configuration
public class FilterConfig {

    @Bean
    public Filter jwtFilter() {
        return new JwtFilter();
    }
}