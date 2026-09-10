package com.veeresh.automation.controller;

import com.veeresh.automation.model.TestRun;
import com.veeresh.automation.model.TestResult;
import com.veeresh.automation.service.AutomationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automation")
@CrossOrigin(origins = "*")
public class AutomationController {
    
    @Autowired
    private AutomationService automationService;

    // --- Test Run Endpoints ---
    @PostMapping("/runs")
    public TestRun createTestRun(@RequestBody TestRun testRun) {
        return automationService.saveTestRun(testRun);
    }

    @GetMapping("/runs")
    public List<TestRun> getTestRuns() {
        return automationService.getAllTestRuns();
    }
    
    // --- Test Result Endpoints ---
    // Accept an array of results to save them all at once
    @PostMapping("/results")
    public List<TestResult> createTestResults(@RequestBody List<TestResult> testResults) {
        return automationService.saveTestResults(testResults);
    }

    // Fetch all results for a specific run ID
    @GetMapping("/runs/{runId}/results")
    public List<TestResult> getResultsForRun(@PathVariable Long runId) {
        return automationService.getResultsByRunId(runId);
    }

    // --- Analytics Summary Endpoint ---
    @GetMapping("/summary")
    public Map<String, Object> getAutomationSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRuns", automationService.getAllTestRuns().size());
        return summary;
    }
}