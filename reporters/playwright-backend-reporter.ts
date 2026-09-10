import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

class BackendReporter implements Reporter {
  private startTime!: Date;
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private testResultsPayload: any[] = [];

  onBegin() {
    this.startTime = new Date();
    console.log('🚀 Automation execution started. Results will be sent to Spring Boot backend.');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.totalTests++;
    
    let status = 'PASSED';
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests++;
      status = 'FAILED';
    } else if (result.status === 'skipped') {
      this.skippedTests++;
      status = 'SKIPPED';
    } else {
      this.passedTests++;
    }

    let errorMessage = null;
    let stackTrace = null;
    let errorType = null;

    if (result.error) {
      errorMessage = result.error.message || null;
      stackTrace = result.error.stack || null;
      errorType = result.error.value ? 'AssertionError' : 'Error';
    }

    // Safely extract browser/project name from test id
    const browserName = test.parent?.project()?.name ?? 'chromium';

    this.testResultsPayload.push({
      testName: test.title,
      suiteName: test.parent?.title || 'Default Suite',
      status: status,
      duration: result.duration,
      browser: browserName,
      environment: process.env.TEST_ENV || 'QA',
      errorType: errorType,
      errorMessage: errorMessage,
      stackTrace: stackTrace
    });
  }

  async onEnd(result: FullResult) {
    const finishTime = new Date();
    const durationMs = finishTime.getTime() - this.startTime.getTime();
    const passRate = this.totalTests > 0 ? Number(((this.passedTests / this.totalTests) * 100).toFixed(2)) : 0;

    const runPayload = {
      projectName: 'Portfolio Automation',
      framework: 'Playwright',
      branch: process.env.GIT_BRANCH || 'main',
      environment: process.env.TEST_ENV || 'QA',
      triggerType: process.env.CI ? 'GitHub Actions' : 'Local Manual',
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      skippedTests: this.skippedTests,
      passRate: passRate,
      duration: durationMs,
      status: result.status === 'passed' ? 'PASSED' : 'FAILED',
      startedAt: this.startTime.toISOString().slice(0, 19),
      finishedAt: finishTime.toISOString().slice(0, 19)
    };

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081';

    try {
      console.log('📤 Sending Test Run summary to Spring Boot backend...');
      
      const runResponse = await fetch(`${backendUrl}/api/automation/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runPayload)
      });

      if (!runResponse.ok) {
        console.error(`❌ Failed to save Test Run: ${runResponse.statusText}`);
        return;
      }

      const savedRun = await runResponse.json();
      const runId = savedRun.id;
      console.log(`✅ Test Run saved successfully with ID: ${runId}`);

      const resultsWithRunId = this.testResultsPayload.map(res => ({
        ...res,
        runId: runId
      }));

      console.log('📤 Sending individual Test Results...');
      
      const resultsResponse = await fetch(`${backendUrl}/api/automation/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultsWithRunId)
      });

      if (resultsResponse.ok) {
        console.log('🎉 All test results successfully synced to backend database!');
      } else {
        console.error(`❌ Failed to save test results: ${resultsResponse.statusText}`);
      }

    } catch (error) {
      console.error('⚠️ Error connecting to Spring Boot backend. Is the server running?', error);
    }
  }
}

export default BackendReporter;