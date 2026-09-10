package com.veeresh.automation.service;

import com.veeresh.automation.model.TestRun;
import com.veeresh.automation.model.TestResult;
import com.veeresh.automation.repository.TestRunRepository;
import com.veeresh.automation.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class AutomationService {
    
    @Autowired
    private TestRunRepository testRunRepository;
    
    @Autowired
    private TestResultRepository testResultRepository;

    // --- Test Run Methods ---
    public TestRun saveTestRun(TestRun testRun) {
        return testRunRepository.save(testRun);
    }

    public List<TestRun> getAllTestRuns() {
        return testRunRepository.findAll();
    }
    
    // --- Test Result Methods ---
    public List<TestResult> saveTestResults(List<TestResult> testResults) {
        return testResultRepository.saveAll(testResults);
    }
    
    public List<TestResult> getResultsByRunId(Long runId) {
        return testResultRepository.findByRunId(runId);
    }

    // --- Analytics Summary Method ---
    public Map<String, Object> getExecutionSummary() {
        List<TestRun> runs = testRunRepository.findAll();
        
        int totalRuns = runs.size();
        long totalTestsExecuted = runs.stream().mapToInt(r -> r.getTotalTests() != null ? r.getTotalTests() : 0).sum();
        long totalPassed = runs.stream().mapToInt(r -> r.getPassedTests() != null ? r.getPassedTests() : 0).sum();
        long totalFailed = runs.stream().mapToInt(r -> r.getFailedTests() != null ? r.getFailedTests() : 0).sum();
        
        double overallPassRate = totalTestsExecuted > 0 ? (double) totalPassed / totalTestsExecuted * 100 : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRuns", totalRuns);
        summary.put("totalTestsExecuted", totalTestsExecuted);
        summary.put("totalPassed", totalPassed);
        summary.put("totalFailed", totalFailed);
        summary.put("overallPassRate", Math.round(overallPassRate * 100.0) / 100.0);
        summary.put("recentRuns", runs.stream().limit(5).toList());
        
        return summary;
    }
}