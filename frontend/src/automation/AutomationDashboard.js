import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081/api/automation"
    : "https://volunteers-backend-35oe.onrender.com/api/automation";

const CHART_COLORS = {
  primary: "#00d2ff",
  secondary: "#3a7bd5",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  text: "#f8f9fa",
  muted: "#9ca3af",
  grid: "rgba(255,255,255,0.06)",
};

function AutomationDashboard() {
  const [runs, setRuns] = useState([]);
  const [summary, setSummary] = useState({ totalRuns: 0 });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedRun, setSelectedRun] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [modalResults, setModalResults] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const [historySearch, setHistorySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================================================
  // Load dashboard data
  // =========================================================

  const loadDashboardData = async () => {
    setError("");

    try {
      setRefreshing(true);

      const [summaryResponse, runsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/summary`),
        fetch(`${API_BASE_URL}/runs`),
      ]);

      if (!summaryResponse.ok) {
        throw new Error("Failed to fetch automation summary");
      }

      if (!runsResponse.ok) {
        throw new Error("Failed to fetch automation runs");
      }

      const summaryData = await summaryResponse.json();
      const runsData = await runsResponse.json();

      const safeRuns = Array.isArray(runsData) ? runsData : [];

      safeRuns.sort(
        (a, b) =>
          new Date(a.startedAt || 0).getTime() -
          new Date(b.startedAt || 0).getTime()
      );

      setSummary(summaryData || { totalRuns: safeRuns.length });
      setRuns(safeRuns);
    } catch (err) {
      console.error("Automation dashboard error:", err);

      setError(
  "Unable to connect to the automation backend. Please check whether the Spring Boot service is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // =========================================================
  // Calculated metrics
  // =========================================================

  const metrics = useMemo(() => {
    const totalTests = runs.reduce(
      (sum, run) => sum + Number(run.totalTests || 0),
      0
    );

    const passedTests = runs.reduce(
      (sum, run) => sum + Number(run.passedTests || 0),
      0
    );

    const failedTests = runs.reduce(
      (sum, run) => sum + Number(run.failedTests || 0),
      0
    );

    const skippedTests = runs.reduce(
      (sum, run) => sum + Number(run.skippedTests || 0),
      0
    );

    const passedRuns = runs.filter(
      (run) => String(run.status).toUpperCase() === "PASSED"
    ).length;

    const failedRuns = runs.filter(
      (run) => String(run.status).toUpperCase() === "FAILED"
    ).length;

    const overallPassRate =
      totalTests > 0
        ? ((passedTests / totalTests) * 100).toFixed(1)
        : "0.0";

    const totalDuration = runs.reduce(
      (sum, run) => sum + Number(run.duration || 0),
      0
    );

    const averageDuration =
      runs.length > 0 ? totalDuration / runs.length : 0;

    return {
      totalRuns: Number(summary?.totalRuns || runs.length),
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      passedRuns,
      failedRuns,
      overallPassRate,
      averageDuration,
    };
  }, [runs, summary]);

  // =========================================================
  // Latest test
  // =========================================================

  const latestRun = useMemo(() => {
    if (!runs.length) return null;

    return [...runs].sort(
      (a, b) =>
        new Date(b.startedAt || 0).getTime() -
        new Date(a.startedAt || 0).getTime()
    )[0];
  }, [runs]);

  // =========================================================
  // Trend chart data
  // =========================================================

  const trendData = useMemo(() => {
    return runs.map((run) => ({
      name: `#${run.id}`,
      passed: Number(run.passedTests || 0),
      failed: Number(run.failedTests || 0),
      skipped: Number(run.skippedTests || 0),
      total: Number(run.totalTests || 0),
      passRate: Number(run.passRate || 0),
    }));
  }, [runs]);

  // =========================================================
  // Breakdown chart
  // =========================================================

  const breakdownData = useMemo(() => {
    return [
      {
        name: "Runs",
        value: metrics.totalRuns,
        fill: CHART_COLORS.secondary,
      },
      {
        name: "Passed",
        value: metrics.passedTests,
        fill: CHART_COLORS.green,
      },
      {
        name: "Failed",
        value: metrics.failedTests,
        fill: CHART_COLORS.red,
      },
      {
        name: "Skipped",
        value: metrics.skippedTests,
        fill: CHART_COLORS.yellow,
      },
    ];
  }, [metrics]);

  // =========================================================
  // Doughnut chart
  // =========================================================

  const doughnutData = useMemo(() => {
    return [
      {
        name: "Passed",
        value: metrics.passedTests,
        color: CHART_COLORS.green,
      },
      {
        name: "Failed",
        value: metrics.failedTests,
        color: CHART_COLORS.red,
      },
      {
        name: "Skipped",
        value: metrics.skippedTests,
        color: CHART_COLORS.yellow,
      },
    ];
  }, [metrics]);

  // =========================================================
  // History filtering
  // =========================================================

  const filteredRuns = useMemo(() => {
    const search = historySearch.toLowerCase().trim();

    return [...runs]
      .reverse()
      .filter((run) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          String(run.status).toUpperCase() === statusFilter;

        const searchableText = [
          run.id,
          run.projectName,
          run.branch,
          run.environment,
          run.framework,
          run.status,
          run.triggerType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !search || searchableText.includes(search);

        return matchesStatus && matchesSearch;
      });
  }, [runs, historySearch, statusFilter]);

  // =========================================================
  // Open Run Modal
  // =========================================================

  const openRunModal = async (run) => {
    setSelectedRun(run);
    setModalOpen(true);
    setModalSearch("");
    setModalResults([]);
    setModalLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/runs/${run.id}/results`
      );

      if (!response.ok) {
        throw new Error("Test results endpoint failed");
      }

      const results = await response.json();

      setModalResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Failed to load test results:", err);
      setModalResults([]);
    } finally {
      setModalLoading(false);
    }
  };

  // =========================================================
  // Close Modal
  // =========================================================

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRun(null);
    setModalResults([]);
    setModalSearch("");
  };

  // =========================================================
  // Filter individual test results
  // =========================================================

  const filteredModalResults = useMemo(() => {
    const search = modalSearch.toLowerCase().trim();

    if (!search) {
      return modalResults;
    }

    return modalResults.filter((result) => {
      return (
        String(result.testName || "")
          .toLowerCase()
          .includes(search) ||
        String(result.suiteName || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [modalResults, modalSearch]);

  // =========================================================
  // Formatting helpers
  // =========================================================

  const formatDuration = (milliseconds) => {
    const value = Number(milliseconds || 0);

    if (value === 0) return "0s";

    if (value < 1000) {
      return `${value}ms`;
    }

    const seconds = value / 1000;

    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const cleanBrowserName = (browser) => {
    if (!browser) return "Chromium";

    const lower = String(browser).toLowerCase();

    if (lower.includes("firefox")) {
      return "Firefox";
    }

    if (
      lower.includes("webkit") ||
      lower.includes("safari")
    ) {
      return "WebKit";
    }

    if (
      lower.includes("chromium") ||
      lower.includes("chrome")
    ) {
      return "Chromium";
    }

    if (String(browser).length > 12) {
      return "Chromium";
    }

    return browser;
  };

  const statusClass = (status) => {
    return String(status || "PASSED").toLowerCase();
  };

  // =========================================================
  // Reusable KPI Card
  // =========================================================

  const MetricCard = ({
    title,
    value,
    colorClass = "",
    icon,
  }) => {
    return (
      <div className="automation-metric-card">
        <div className="automation-metric-icon">
          {icon}
        </div>

        <div className="automation-metric-content">
          <h3>{title}</h3>
          <div
            className={`automation-metric-value ${colorClass}`}
          >
            {value}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <>
        <style>{dashboardStyles}</style>

        <div className="automation-dashboard-page">
          <div className="automation-loading">
            <div className="automation-spinner" />
            <h2>Loading Automation Dashboard...</h2>
            <p>
              Connecting to Spring Boot automation service
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>

      <div className="automation-dashboard-page">
        <div className="automation-dashboard-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="automation-glass-card automation-header">
            <div>
              <div className="automation-title-row">
                <div className="automation-title-icon">
                  🧪
                </div>

                <div>
                  <h1>Automation Dashboard</h1>

                  <p>
                    Portfolio Automation
                    <span> • </span>
                    Playwright
                    <span> • </span>
                    QA
                    <span> • </span>
                    main
                  </p>
                </div>
              </div>
            </div>

            <button
              className="automation-refresh-button"
              onClick={loadDashboardData}
              disabled={refreshing}
            >
              <span
                className={
                  refreshing
                    ? "automation-refresh-icon spinning"
                    : "automation-refresh-icon"
                }
              >
                ↻
              </span>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="automation-error">
              <span>⚠️</span>

              <div>
                <strong>Backend Connection Error</strong>
                <p>{error}</p>
              </div>

              <button onClick={loadDashboardData}>
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="automation-metrics-grid">

            <MetricCard
              title="Total Runs"
              value={metrics.totalRuns}
              colorClass="blue"
              icon="▶"
            />

            <MetricCard
              title="Total Tests"
              value={metrics.totalTests}
              icon="🧪"
            />

            <MetricCard
              title="Passed Tests"
              value={metrics.passedTests}
              colorClass="green"
              icon="✓"
            />

            <MetricCard
              title="Failed Tests"
              value={metrics.failedTests}
              colorClass="red"
              icon="✕"
            />

            <MetricCard
              title="Skipped Tests"
              value={metrics.skippedTests}
              colorClass="yellow"
              icon="→"
            />

            <MetricCard
              title="Overall Pass Rate"
              value={`${metrics.overallPassRate}%`}
              colorClass="blue"
              icon="%"
            />

            <MetricCard
              title="Passed Runs"
              value={metrics.passedRuns}
              colorClass="green"
              icon="✓"
            />

            <MetricCard
              title="Failed Runs"
              value={metrics.failedRuns}
              colorClass="red"
              icon="!"
            />

          </div>

          {/* =================================================
              LATEST TEST
          ================================================= */}

          {latestRun && (
            <section className="automation-glass-card automation-latest-card">

              <div className="automation-section-heading">
                <div>
                  <h2>⭐ Latest Test Run</h2>
                  <p>
                    Most recently executed automation run
                  </p>
                </div>

                <span
                  className={`automation-status-badge ${statusClass(
                    latestRun.status
                  )}`}
                >
                  {latestRun.status}
                </span>
              </div>

              <div className="automation-latest-grid">

                <div className="automation-latest-run">
                  <span className="automation-run-number">
                    #{latestRun.id}
                  </span>

                  <div>
                    <h3>
                      {latestRun.projectName ||
                        "Portfolio Automation"}
                    </h3>

                    <p>
                      {latestRun.framework || "Playwright"}
                      {" • "}
                      {latestRun.environment || "QA"}
                      {" • "}
                      {latestRun.branch || "main"}
                    </p>
                  </div>
                </div>

                <div className="automation-latest-stat">
                  <span>Tests</span>
                  <strong>
                    {latestRun.passedTests || 0}/
                    {latestRun.totalTests || 0}
                  </strong>
                </div>

                <div className="automation-latest-stat">
                  <span>Pass Rate</span>
                  <strong className="green-text">
                    {latestRun.passRate || 0}%
                  </strong>
                </div>

                <div className="automation-latest-stat">
                  <span>Duration</span>
                  <strong>
                    {formatDuration(latestRun.duration)}
                  </strong>
                </div>

                <div className="automation-latest-stat">
                  <span>Trigger</span>
                  <strong>
                    {latestRun.triggerType || "Local Manual"}
                  </strong>
                </div>

              </div>

              <div className="automation-latest-footer">
                Started: {formatDate(latestRun.startedAt)}
                <span>•</span>
                Finished: {formatDate(latestRun.finishedAt)}
              </div>

            </section>
          )}

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="automation-charts-grid">

            {/* Test Execution Trend */}

            <section className="automation-glass-card automation-chart-card">

              <div className="automation-section-heading">
                <div>
                  <h2>Test Execution Trend</h2>
                  <p>
                    Passed, failed and skipped tests per run
                  </p>
                </div>
              </div>

              <div className="automation-chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={trendData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.grid}
                    />

                    <XAxis
                      dataKey="name"
                      stroke={CHART_COLORS.muted}
                      tick={{
                        fill: CHART_COLORS.muted,
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      stroke={CHART_COLORS.muted}
                      tick={{
                        fill: CHART_COLORS.muted,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#10111a",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="passed"
                      name="Passed"
                      stroke={CHART_COLORS.green}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="failed"
                      name="Failed"
                      stroke={CHART_COLORS.red}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="skipped"
                      name="Skipped"
                      stroke={CHART_COLORS.yellow}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Execution Breakdown */}

            <section className="automation-glass-card automation-chart-card">

              <div className="automation-section-heading">
                <div>
                  <h2>Execution Summary Breakdown</h2>
                  <p>
                    Aggregated automation results
                  </p>
                </div>
              </div>

              <div className="automation-chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={breakdownData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_COLORS.grid}
                    />

                    <XAxis
                      dataKey="name"
                      stroke={CHART_COLORS.muted}
                      tick={{
                        fill: CHART_COLORS.muted,
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      stroke={CHART_COLORS.muted}
                      tick={{
                        fill: CHART_COLORS.muted,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#10111a",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="value"
                      name="Count"
                      radius={[8, 8, 0, 0]}
                    >
                      {breakdownData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                          />
                        )
                      )}
                    </Bar>

                  </BarChart>
                </ResponsiveContainer>

              </div>
            </section>
          </div>

          {/* =================================================
              DOUGHNUT + INSIGHTS
          ================================================= */}

          <div className="automation-secondary-grid">

            <section className="automation-glass-card automation-donut-card">

              <div className="automation-section-heading">
                <div>
                  <h2>Test Result Distribution</h2>
                  <p>Overall test outcome</p>
                </div>
              </div>

              <div className="automation-donut-wrapper">

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <PieChart>

                    <Pie
                      data={doughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {doughnutData.map(
                        (entry, index) => (
                          <Cell
                            key={`donut-${index}`}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#10111a",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Legend />

                  </PieChart>
                </ResponsiveContainer>

                <div className="automation-donut-center">
                  <strong>
                    {metrics.overallPassRate}%
                  </strong>

                  <span>Pass Rate</span>
                </div>

              </div>

            </section>

            {/* Execution Insights */}

            <section className="automation-glass-card automation-insights-card">

              <div className="automation-section-heading">
                <div>
                  <h2>Execution Insights</h2>
                  <p>Automation environment overview</p>
                </div>
              </div>

              <div className="automation-insights-list">

                <Insight
                  icon="🌎"
                  label="Environment"
                  value={
                    latestRun?.environment || "QA"
                  }
                />

                <Insight
                  icon="🧪"
                  label="Framework"
                  value={
                    latestRun?.framework || "Playwright"
                  }
                />

                <Insight
                  icon="🌿"
                  label="Branch"
                  value={
                    latestRun?.branch || "main"
                  }
                />

                <Insight
                  icon="▶"
                  label="Latest Trigger"
                  value={
                    latestRun?.triggerType ||
                    "Local Manual"
                  }
                />

                <Insight
                  icon="⏱"
                  label="Average Duration"
                  value={formatDuration(
                    metrics.averageDuration
                  )}
                />

                <Insight
                  icon="📊"
                  label="Total Executions"
                  value={metrics.totalRuns}
                />

              </div>
            </section>

          </div>

          {/* =================================================
              MY TEST WORKFLOW
          ================================================= */}

          <section className="automation-glass-card automation-workflow-card">

            <div className="automation-section-heading">
              <div>
                <h2>My Tests Workflow</h2>
                <p>
                  From writing a test to dashboard reporting
                </p>
              </div>
            </div>

            <div className="automation-workflow">

              <WorkflowStep
                number="01"
                icon="✍️"
                title="Write Test"
                description="Create Playwright test cases"
              />

              <div className="workflow-arrow">→</div>

              <WorkflowStep
                number="02"
                icon="▶️"
                title="Run Test"
                description="Execute automated tests"
              />

              <div className="workflow-arrow">→</div>

              <WorkflowStep
                number="03"
                icon="📤"
                title="Send Results"
                description="Publish execution results"
              />

              <div className="workflow-arrow">→</div>

              <WorkflowStep
                number="04"
                icon="🗄️"
                title="Store"
                description="Spring Boot + Database"
              />

              <div className="workflow-arrow">→</div>

              <WorkflowStep
                number="05"
                icon="📊"
                title="Dashboard"
                description="Analyze automation health"
              />

            </div>

          </section>

          {/* =================================================
              TEST HISTORY
          ================================================= */}

          <section className="automation-glass-card">

            <div className="automation-section-heading automation-history-heading">

              <div>
                <h2>Test History</h2>

                <p>
                  Click "View Run" to inspect execution
                  metrics and individual test results
                </p>
              </div>

              <div className="automation-history-count">
                {filteredRuns.length} of {runs.length} runs
              </div>

            </div>

            {/* Filters */}

            <div className="automation-table-toolbar">

              <input
                type="text"
                className="automation-search-input"
                placeholder="🔍 Search project, branch, environment..."
                value={historySearch}
                onChange={(event) =>
                  setHistorySearch(event.target.value)
                }
              />

              <select
                className="automation-filter-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="PASSED">
                  Passed
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

            </div>

            <div className="automation-table-wrapper">

              <table className="automation-data-table">

                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Project</th>
                    <th>Branch</th>
                    <th>Environment</th>
                    <th>Status</th>
                    <th>Pass Rate</th>
                    <th>Duration</th>
                    <th>Trigger</th>
                    <th>Started</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRuns.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="automation-table-empty"
                      >
                        No matching test runs found.
                      </td>
                    </tr>
                  ) : (
                    filteredRuns.map((run) => (
                      <tr key={run.id}>

                        <td>
                          <strong>
                            #{run.id}
                          </strong>
                        </td>

                        <td>
                          {run.projectName ||
                            "Portfolio Automation"}
                        </td>

                        <td>
                          <span className="automation-branch">
                            🌿 {run.branch || "main"}
                          </span>
                        </td>

                        <td>
                          <span className="automation-environment">
                            {run.environment || "QA"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`automation-status-badge ${statusClass(
                              run.status
                            )}`}
                          >
                            {run.status || "PASSED"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {run.passRate || 0}%
                          </strong>
                        </td>

                        <td>
                          {formatDuration(run.duration)}
                        </td>

                        <td>
                          {run.triggerType ||
                            "Local Manual"}
                        </td>

                        <td>
                          <span className="automation-date">
                            {formatDate(run.startedAt)}
                          </span>
                        </td>

                        <td>
                          <button
                            className="automation-view-button"
                            onClick={() =>
                              openRunModal(run)
                            }
                          >
                            View Run
                          </button>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>
      </div>

      {/* =====================================================
          RUN DETAILS MODAL
      ===================================================== */}

      {modalOpen && selectedRun && (
        <div
          className="automation-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="automation-modal-content">

            {/* Modal Header */}

            <div className="automation-modal-header">

              <div>
                <h2>
                  Run #{selectedRun.id} Details
                </h2>

                <p>
                  {selectedRun.projectName ||
                    "Portfolio Automation"}
                  {" • "}
                  {formatDate(
                    selectedRun.startedAt
                  )}
                </p>
              </div>

              <button
                className="automation-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* Modal Body */}

            <div className="automation-modal-body">

              {/* Top section */}

              <div className="automation-modal-top-grid">

                <div className="automation-modal-metadata">

                  <ModalInfo
                    label="Status"
                    value={
                      <span
                        className={`automation-status-badge ${statusClass(
                          selectedRun.status
                        )}`}
                      >
                        {selectedRun.status}
                      </span>
                    }
                  />

                  <ModalInfo
                    label="Pass Rate"
                    value={`${selectedRun.passRate || 0}%`}
                  />

                  <ModalInfo
                    label="Passed / Total"
                    value={`${selectedRun.passedTests || 0} / ${
                      selectedRun.totalTests || 0
                    }`}
                  />

                  <ModalInfo
                    label="Failed"
                    value={selectedRun.failedTests || 0}
                  />

                  <ModalInfo
                    label="Skipped"
                    value={selectedRun.skippedTests || 0}
                  />

                  <ModalInfo
                    label="Duration"
                    value={formatDuration(
                      selectedRun.duration
                    )}
                  />

                  <ModalInfo
                    label="Environment"
                    value={
                      selectedRun.environment || "QA"
                    }
                  />

                  <ModalInfo
                    label="Branch"
                    value={
                      selectedRun.branch || "main"
                    }
                  />

                  <ModalInfo
                    label="Framework"
                    value={
                      selectedRun.framework ||
                      "Playwright"
                    }
                  />

                  <ModalInfo
                    label="Trigger"
                    value={
                      selectedRun.triggerType ||
                      "Local Manual"
                    }
                  />

                </div>

                {/* Modal Doughnut */}

                <div className="automation-modal-donut">

                  <ResponsiveContainer
                    width="100%"
                    height={230}
                  >
                    <PieChart>

                      <Pie
                        data={[
                          {
                            name: "Passed",
                            value:
                              selectedRun.passedTests ||
                              0,
                          },
                          {
                            name: "Failed",
                            value:
                              selectedRun.failedTests ||
                              0,
                          },
                          {
                            name: "Skipped",
                            value:
                              selectedRun.skippedTests ||
                              0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >

                        <Cell
                          fill={CHART_COLORS.green}
                        />

                        <Cell
                          fill={CHART_COLORS.red}
                        />

                        <Cell
                          fill={CHART_COLORS.yellow}
                        />

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>

                </div>

              </div>

              {/* Individual results */}

              <div className="automation-results-section">

                <div className="automation-results-header">

                  <div>
                    <h3>
                      Individual Test Results
                    </h3>

                    <p>
                      Detailed results returned by the
                      automation API
                    </p>
                  </div>

                  <input
                    type="text"
                    className="automation-search-input modal-search"
                    placeholder="🔍 Search test name..."
                    value={modalSearch}
                    onChange={(event) =>
                      setModalSearch(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="automation-table-wrapper">

                  <table className="automation-data-table">

                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Suite</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Browser</th>
                        <th>Details</th>
                      </tr>
                    </thead>

                    <tbody>

                      {modalLoading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="automation-table-empty"
                          >
                            Loading test results...
                          </td>
                        </tr>
                      ) : filteredModalResults.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="automation-table-empty"
                          >
                            No individual test results
                            found for this run.
                          </td>
                        </tr>
                      ) : (
                        filteredModalResults.map(
                          (result, index) => (
                            <tr key={result.id || index}>

                              <td>
                                <strong>
                                  {result.testName ||
                                    "Unnamed Test"}
                                </strong>
                              </td>

                              <td>
                                {result.suiteName ||
                                  "Default Suite"}
                              </td>

                              <td>
                                <span
                                  className={`automation-status-badge ${statusClass(
                                    result.status
                                  )}`}
                                >
                                  {result.status ||
                                    "PASSED"}
                                </span>
                              </td>

                              <td>
                                {formatDuration(
                                  result.duration
                                )}
                              </td>

                              <td>
                                {cleanBrowserName(
                                  result.browser
                                )}
                              </td>

                              <td>
                                <button
                                  className="automation-view-button"
                                  onClick={() => {
                                    const message =
                                      result.errorMessage ||
                                      "Test passed successfully with no errors.";

                                    window.alert(
                                      message
                                    );
                                  }}
                                >
                                  View
                                </button>
                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===========================================================
// Small components
// ===========================================================

function Insight({ icon, label, value }) {
  return (
    <div className="automation-insight-item">
      <div className="automation-insight-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="automation-workflow-step">

      <div className="automation-workflow-number">
        {number}
      </div>

      <div className="automation-workflow-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

    </div>
  );
}

function ModalInfo({ label, value }) {
  return (
    <div className="automation-modal-info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

// ===========================================================
// Dashboard CSS
// ===========================================================

const dashboardStyles = `
  .automation-dashboard-page {
    min-height: 100vh;
    padding: 30px 20px;
    color: #f8f9fa;
    background-color: #050508;

    background-image:
      radial-gradient(
        at 0% 0%,
        rgba(58, 123, 213, 0.15) 0px,
        transparent 50%
      ),
      radial-gradient(
        at 100% 0%,
        rgba(0, 210, 255, 0.15) 0px,
        transparent 50%
      ),
      radial-gradient(
        at 100% 100%,
        rgba(58, 123, 213, 0.1) 0px,
        transparent 50%
      ),
      radial-gradient(
        at 0% 100%,
        rgba(0, 210, 255, 0.1) 0px,
        transparent 50%
      );

    background-attachment: fixed;
  }

  .automation-dashboard-container {
    max-width: 1400px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .automation-glass-card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;

    padding: 24px;

    box-shadow:
      0 8px 32px rgba(0,0,0,0.3);
  }

  /* HEADER */

  .automation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 20px;
  }

  .automation-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .automation-title-icon {
    width: 50px;
    height: 50px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    background: rgba(0,210,255,0.10);
    border: 1px solid rgba(0,210,255,0.20);

    font-size: 25px;
  }

  .automation-header h1 {
    margin: 0 0 5px;

    font-family: "Outfit", "Inter", sans-serif;

    font-size: 1.8rem;
    font-weight: 700;
  }

  .automation-header p {
    margin: 0;

    color: #9ca3af;
    font-size: 0.9rem;
  }

  .automation-header p span {
    color: #00d2ff;
  }

  .automation-refresh-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    border: 1px solid rgba(0,210,255,0.30);

    background: rgba(0,210,255,0.10);

    color: #00d2ff;

    padding: 10px 20px;

    border-radius: 50px;

    font-weight: 600;

    cursor: pointer;

    transition: 0.25s ease;
  }

  .automation-refresh-button:hover:not(:disabled) {
    background: #00d2ff;
    color: #000;

    box-shadow:
      0 0 20px rgba(0,210,255,0.4);

    transform: translateY(-2px);
  }

  .automation-refresh-button:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .automation-refresh-icon {
    font-size: 20px;
  }

  .spinning {
    display: inline-block;
    animation: automationSpin 0.8s linear infinite;
  }

  @keyframes automationSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ERROR */

  .automation-error {
    display: flex;
    align-items: center;
    gap: 14px;

    padding: 16px 20px;

    border-radius: 14px;

    background: rgba(239,68,68,0.10);

    border: 1px solid rgba(239,68,68,0.25);

    color: #fca5a5;
  }

  .automation-error > span {
    font-size: 22px;
  }

  .automation-error div {
    flex: 1;
  }

  .automation-error strong {
    color: #ef4444;
  }

  .automation-error p {
    margin: 3px 0 0;
    font-size: 0.85rem;
  }

  .automation-error button {
    border: 1px solid rgba(239,68,68,0.4);
    background: transparent;
    color: #ef4444;
    border-radius: 8px;
    padding: 7px 14px;
    cursor: pointer;
  }

  /* METRICS */

  .automation-metrics-grid {
    display: grid;

    grid-template-columns:
      repeat(auto-fit, minmax(160px, 1fr));

    gap: 14px;
  }

  .automation-metric-card {
    min-height: 105px;

    display: flex;
    align-items: center;

    gap: 13px;

    padding: 17px;

    border-radius: 16px;

    background: rgba(255,255,255,0.03);

    backdrop-filter: blur(16px);

    border: 1px solid rgba(255,255,255,0.08);

    transition: 0.25s ease;
  }

  .automation-metric-card:hover {
    transform: translateY(-3px);

    background: rgba(255,255,255,0.055);

    border-color:
      rgba(0,210,255,0.22);

    box-shadow:
      0 10px 25px rgba(0,0,0,0.25);
  }

  .automation-metric-icon {
    width: 40px;
    height: 40px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: rgba(0,210,255,0.08);

    color: #00d2ff;

    font-size: 17px;
  }

  .automation-metric-content {
    min-width: 0;
  }

  .automation-metric-card h3 {
    margin: 0 0 4px;

    font-size: 0.68rem;

    text-transform: uppercase;

    letter-spacing: 0.06em;

    color: #9ca3af;
  }

  .automation-metric-value {
    font-family: "Outfit", "Inter", sans-serif;

    font-size: 1.55rem;

    font-weight: 700;
  }

  .automation-metric-value.blue {
    color: #00d2ff;
  }

  .automation-metric-value.green {
    color: #22c55e;
  }

  .automation-metric-value.red {
    color: #ef4444;
  }

  .automation-metric-value.yellow {
    color: #eab308;
  }

  /* SECTION */

  .automation-section-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    gap: 15px;

    margin-bottom: 18px;
  }

  .automation-section-heading h2 {
    margin: 0;

    font-family: "Outfit", "Inter", sans-serif;

    font-size: 1.2rem;
  }

  .automation-section-heading p {
    margin: 5px 0 0;

    color: #9ca3af;

    font-size: 0.82rem;
  }

  /* STATUS */

  .automation-status-badge {
    display: inline-flex;

    align-items: center;

    padding: 5px 11px;

    border-radius: 20px;

    font-size: 0.72rem;

    font-weight: 700;

    border: 1px solid transparent;
  }

  .automation-status-badge.passed {
    color: #22c55e;

    background: rgba(34,197,94,0.12);

    border-color:
      rgba(34,197,94,0.30);
  }

  .automation-status-badge.failed {
    color: #ef4444;

    background: rgba(239,68,68,0.12);

    border-color:
      rgba(239,68,68,0.30);
  }

  /* LATEST */

  .automation-latest-card {
    position: relative;

    overflow: hidden;
  }

  .automation-latest-card::before {
    content: "";

    position: absolute;

    left: 0;
    top: 0;
    bottom: 0;

    width: 3px;

    background: #00d2ff;
  }

  .automation-latest-grid {
    display: grid;

    grid-template-columns:
      2fr repeat(4, 1fr);

    gap: 15px;

    align-items: center;
  }

  .automation-latest-run {
    display: flex;

    align-items: center;

    gap: 13px;
  }

  .automation-run-number {
    font-family: "Outfit", sans-serif;

    font-size: 1.4rem;

    font-weight: 700;

    color: #00d2ff;
  }

  .automation-latest-run h3 {
    margin: 0 0 4px;

    font-size: 1rem;
  }

  .automation-latest-run p {
    margin: 0;

    color: #9ca3af;

    font-size: 0.78rem;
  }

  .automation-latest-stat {
    padding-left: 15px;

    border-left:
      1px solid rgba(255,255,255,0.08);
  }

  .automation-latest-stat span {
    display: block;

    color: #9ca3af;

    font-size: 0.72rem;

    margin-bottom: 5px;
  }

  .automation-latest-stat strong {
    display: block;

    font-size: 0.9rem;
  }

  .green-text {
    color: #22c55e;
  }

  .automation-latest-footer {
    margin-top: 17px;
    padding-top: 13px;

    border-top:
      1px solid rgba(255,255,255,0.06);

    color: #9ca3af;

    font-size: 0.75rem;
  }

  .automation-latest-footer span {
    margin: 0 7px;
    color: #00d2ff;
  }

  /* CHARTS */

  .automation-charts-grid {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 20px;
  }

  .automation-chart-card {
    min-width: 0;
  }

  .automation-chart-container {
    width: 100%;
    height: 280px;
  }

  /* SECONDARY */

  .automation-secondary-grid {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 20px;
  }

  .automation-donut-card,
  .automation-insights-card {
    min-width: 0;
  }

  .automation-donut-wrapper {
    position: relative;

    height: 270px;
  }

  .automation-donut-center {
    position: absolute;

    left: 50%;
    top: 50%;

    transform:
      translate(-50%, -50%);

    text-align: center;

    pointer-events: none;
  }

  .automation-donut-center strong {
    display: block;

    font-family: "Outfit", sans-serif;

    font-size: 1.45rem;

    color: #00d2ff;
  }

  .automation-donut-center span {
    color: #9ca3af;

    font-size: 0.7rem;
  }

  /* INSIGHTS */

  .automation-insights-list {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 10px;
  }

  .automation-insight-item {
    display: flex;

    align-items: center;

    gap: 11px;

    padding: 13px;

    border-radius: 12px;

    background: rgba(255,255,255,0.025);

    border:
      1px solid rgba(255,255,255,0.06);
  }

  .automation-insight-icon {
    width: 35px;
    height: 35px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 10px;

    background: rgba(0,210,255,0.07);
  }

  .automation-insight-item span {
    display: block;

    color: #9ca3af;

    font-size: 0.68rem;

    margin-bottom: 3px;
  }

  .automation-insight-item strong {
    display: block;

    font-size: 0.82rem;

    overflow-wrap: anywhere;
  }

  /* WORKFLOW */

  .automation-workflow {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 12px;

    overflow-x: auto;

    padding: 10px 0;
  }

  .automation-workflow-step {
    min-width: 145px;

    text-align: center;

    padding: 14px;

    border-radius: 14px;

    background: rgba(255,255,255,0.025);

    border:
      1px solid rgba(255,255,255,0.07);
  }

  .automation-workflow-number {
    color: #00d2ff;

    font-size: 0.65rem;

    font-weight: 700;

    margin-bottom: 5px;
  }

  .automation-workflow-icon {
    font-size: 23px;

    margin-bottom: 7px;
  }

  .automation-workflow-step h3 {
    margin: 0 0 4px;

    font-size: 0.85rem;
  }

  .automation-workflow-step p {
    margin: 0;

    color: #9ca3af;

    font-size: 0.68rem;

    line-height: 1.4;
  }

  .workflow-arrow {
    color: #00d2ff;

    font-size: 22px;

    flex-shrink: 0;
  }

  /* TABLE */

  .automation-history-heading {
    align-items: center;
  }

  .automation-history-count {
    color: #9ca3af;

    font-size: 0.75rem;
  }

  .automation-table-toolbar {
    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 10px;

    margin-bottom: 15px;
  }

  .automation-search-input,
  .automation-filter-select {
    padding: 10px 13px;

    border-radius: 11px;

    background: rgba(255,255,255,0.025);

    border:
      1px solid rgba(255,255,255,0.09);

    color: #f8f9fa;

    outline: none;

    font-size: 0.8rem;
  }

  .automation-search-input {
    min-width: 280px;
  }

  .automation-filter-select {
    cursor: pointer;
  }

  .automation-filter-select option {
    background: #11121a;
    color: #fff;
  }

  .automation-search-input:focus,
  .automation-filter-select:focus {
    border-color: #00d2ff;

    box-shadow:
      0 0 15px rgba(0,210,255,0.12);
  }

  .automation-table-wrapper {
    width: 100%;

    overflow-x: auto;

    border-radius: 12px;
  }

  .automation-data-table {
    width: 100%;

    min-width: 1050px;

    border-collapse: collapse;

    text-align: left;
  }

  .automation-data-table th {
    padding: 13px 15px;

    background: rgba(255,255,255,0.04);

    color: #00d2ff;

    font-family: "Outfit", sans-serif;

    font-size: 0.69rem;

    text-transform: uppercase;

    letter-spacing: 0.05em;

    border-bottom:
      1px solid rgba(255,255,255,0.08);
  }

  .automation-data-table td {
    padding: 13px 15px;

    font-size: 0.78rem;

    border-bottom:
      1px solid rgba(255,255,255,0.06);
  }

  .automation-data-table tbody tr {
    transition: background 0.2s ease;
  }

  .automation-data-table tbody tr:hover {
    background: rgba(255,255,255,0.035);
  }

  .automation-branch {
    color: #cbd5e1;
  }

  .automation-environment {
    padding: 4px 8px;

    border-radius: 7px;

    background: rgba(58,123,213,0.10);

    color: #93c5fd;
  }

  .automation-date {
    white-space: nowrap;

    color: #9ca3af;
  }

  .automation-view-button {
    padding: 6px 11px;

    border-radius: 8px;

    background: rgba(0,210,255,0.08);

    color: #00d2ff;

    border:
      1px solid rgba(0,210,255,0.20);

    cursor: pointer;

    font-size: 0.7rem;

    transition: 0.2s ease;
  }

  .automation-view-button:hover {
    background: #00d2ff;

    color: #000;
  }

  .automation-table-empty {
    text-align: center;

    padding: 35px !important;

    color: #9ca3af;
  }

  /* MODAL */

  .automation-modal-overlay {
    position: fixed;

    inset: 0;

    z-index: 9999;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

    background: rgba(5,5,8,0.82);

    backdrop-filter: blur(9px);
  }

  .automation-modal-content {
    width: 100%;

    max-width: 1100px;

    max-height: 92vh;

    display: flex;

    flex-direction: column;

    background: #0d0e15;

    border:
      1px solid rgba(255,255,255,0.10);

    border-radius: 20px;

    box-shadow:
      0 20px 60px rgba(0,0,0,0.60);

    overflow: hidden;

    animation:
      automationModalIn 0.25s ease;
  }

  @keyframes automationModalIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .automation-modal-header {
    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 20px 24px;

    border-bottom:
      1px solid rgba(255,255,255,0.08);
  }

  .automation-modal-header h2 {
    margin: 0;

    font-family: "Outfit", sans-serif;

    font-size: 1.25rem;
  }

  .automation-modal-header p {
    margin: 4px 0 0;

    color: #9ca3af;

    font-size: 0.76rem;
  }

  .automation-modal-close {
    width: 35px;
    height: 35px;

    border-radius: 9px;

    border:
      1px solid rgba(255,255,255,0.08);

    background: transparent;

    color: #9ca3af;

    font-size: 23px;

    cursor: pointer;
  }

  .automation-modal-close:hover {
    color: #fff;

    background: rgba(255,255,255,0.05);
  }

  .automation-modal-body {
    padding: 22px;

    overflow-y: auto;

    display: flex;

    flex-direction: column;

    gap: 20px;
  }

  .automation-modal-top-grid {
    display: grid;

    grid-template-columns: 1.6fr 1fr;

    gap: 18px;
  }

  .automation-modal-metadata {
    display: grid;

    grid-template-columns:
      repeat(2, 1fr);

    gap: 10px;

    padding: 15px;

    border-radius: 13px;

    background: rgba(255,255,255,0.02);

    border:
      1px solid rgba(255,255,255,0.07);
  }

  .automation-modal-info {
    padding: 8px;
  }

  .automation-modal-info span {
    display: block;

    color: #9ca3af;

    font-size: 0.68rem;

    margin-bottom: 5px;
  }

  .automation-modal-info strong {
    font-size: 0.82rem;
  }

  .automation-modal-donut {
    min-height: 240px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    background: rgba(255,255,255,0.02);

    border:
      1px solid rgba(255,255,255,0.07);
  }

  .automation-results-section {
    min-width: 0;
  }

  .automation-results-header {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin-bottom: 12px;
  }

  .automation-results-header h3 {
    margin: 0;

    font-family: "Outfit", sans-serif;

    font-size: 1rem;
  }

  .automation-results-header p {
    margin: 4px 0 0;

    color: #9ca3af;

    font-size: 0.7rem;
  }

  .modal-search {
    min-width: 240px;
  }

  /* LOADING */

  .automation-loading {
    min-height: 70vh;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;
  }

  .automation-loading h2 {
    margin: 18px 0 5px;

    font-family: "Outfit", sans-serif;
  }

  .automation-loading p {
    margin: 0;

    color: #9ca3af;

    font-size: 0.85rem;
  }

  .automation-spinner {
    width: 45px;
    height: 45px;

    border-radius: 50%;

    border:
      3px solid rgba(255,255,255,0.08);

    border-top-color: #00d2ff;

    animation:
      automationSpin 0.8s linear infinite;
  }

  /* RESPONSIVE */

  @media (max-width: 1100px) {

    .automation-latest-grid {
      grid-template-columns:
        repeat(3, 1fr);
    }

    .automation-latest-run {
      grid-column: 1 / -1;
    }

  }

  @media (max-width: 900px) {

    .automation-charts-grid,
    .automation-secondary-grid {
      grid-template-columns: 1fr;
    }

    .automation-modal-top-grid {
      grid-template-columns: 1fr;
    }

  }

  @media (max-width: 700px) {

    .automation-dashboard-page {
      padding: 15px 10px;
    }

    .automation-header {
      align-items: flex-start;

      flex-direction: column;
    }

    .automation-refresh-button {
      width: 100%;

      justify-content: center;
    }

    .automation-latest-grid {
      grid-template-columns:
        repeat(2, 1fr);
    }

    .automation-latest-run {
      grid-column: 1 / -1;
    }

    .automation-latest-stat {
      border-left: none;

      border-top:
        1px solid rgba(255,255,255,0.06);

      padding: 10px 0 0;
    }

    .automation-insights-list {
      grid-template-columns: 1fr;
    }

    .automation-table-toolbar {
      flex-direction: column;

      align-items: stretch;
    }

    .automation-search-input,
    .automation-filter-select {
      width: 100%;

      min-width: 0;
    }

    .automation-workflow {
      justify-content: flex-start;
    }

    .workflow-arrow {
      display: none;
    }

    .automation-modal-metadata {
      grid-template-columns: 1fr 1fr;
    }

    .automation-results-header {
      flex-direction: column;

      align-items: stretch;
    }

    .modal-search {
      width: 100%;
    }

  }

  @media (max-width: 450px) {

    .automation-metrics-grid {
      grid-template-columns: 1fr 1fr;
    }

    .automation-metric-card {
      flex-direction: column;

      text-align: center;

      padding: 14px 8px;
    }

    .automation-latest-grid {
      grid-template-columns: 1fr 1fr;
    }

    .automation-modal-metadata {
      grid-template-columns: 1fr;
    }

  }
`;

export default AutomationDashboard;