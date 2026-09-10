package com.veeresh.automation.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "test_results")
@Data
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long runId;
    private String testName;
    private String suiteName;
    private String status;
    private Long duration; // in milliseconds
    private String browser;
    private String environment;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    private String errorType;
    
    @Column(columnDefinition = "TEXT")
    private String stackTrace;
}