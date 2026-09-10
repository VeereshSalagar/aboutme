const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8081/api/automation"
  : "https://your-production-backend-domain.com/api/automation"; // Replace with your deployed Spring Boot URL later

export const automationApi = {
  async getTestRuns() {
    const response = await fetch(`${API_BASE_URL}/runs`);
    if (!response.ok) throw new Error("Failed to fetch test runs");
    return response.json();
  },

  async getAutomationSummary() {
    const response = await fetch(`${API_BASE_URL}/summary`);
    if (!response.ok) throw new Error("Failed to fetch execution summary");
    return response.json();
  },

  async getResultsForRun(runId) {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/results`);
    if (!response.ok) throw new Error(`Failed to fetch results for run #${runId}`);
    return response.json();
  }
};