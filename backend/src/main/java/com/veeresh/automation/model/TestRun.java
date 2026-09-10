package com.veeresh.automation.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_runs")
@Data
public class TestRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectName;
    private String framework;
    private String branch;
    private String environment;
    private String triggerType;
    private String status;
    
    private Integer totalTests;
    private Integer passedTests;
    private Integer failedTests;
    private Integer skippedTests;
    private Double passRate;
    private Long duration; // in milliseconds

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}