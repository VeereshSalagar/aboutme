import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAdmin, isSessionValid } from "./App";
import "./App.css";

const API_BASE_URL = "https://volunteers-backend-35oe.onrender.com";

function AdminDashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Dynamic rows per page: 5, 10, 20, 50, or all

  const navigate = useNavigate();

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/volunteers`);
      if (!response.ok) throw new Error("Failed to fetch volunteers");
      const data = await response.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") || localStorage.getItem("isAdminLoggedIn");
    if (!isAdmin || !isSessionValid()) {
      logoutAdmin();
      localStorage.removeItem("isAdmin");
      navigate("/admin-login");
    } else {
      fetchVolunteers();
    }
  }, [navigate]);

  const deleteVolunteer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) fetchVolunteers();
    } catch (error) {
      console.error("Error deleting volunteer:", error);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" ? "desc" : "asc");
    }
  };

  // 1. Search Filtering
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      const q = searchTerm.toLowerCase();
      return (
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.mobileNumber && v.mobileNumber.toLowerCase().includes(q))
      );
    });
  }, [volunteers, searchTerm]);

  // 2. Sorting Process
  const sortedVolunteers = useMemo(() => {
    return [...filteredVolunteers].sort((a, b) => {
      if (sortField === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }

      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredVolunteers, sortField, sortDirection]);

  // 3. Pagination Slicing with dynamic rowsPerPage
  const effectiveRowsPerPage = rowsPerPage === "all" ? sortedVolunteers.length || 1 : Number(rowsPerPage);
  const totalPages = Math.ceil(sortedVolunteers.length / effectiveRowsPerPage) || 1;

  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") return sortedVolunteers;
    const start = (currentPage - 1) * effectiveRowsPerPage;
    return sortedVolunteers.slice(start, start + effectiveRowsPerPage);
  }, [sortedVolunteers, currentPage, effectiveRowsPerPage, rowsPerPage]);

  const handleRowsPerPageChange = (e) => {
    const value = e.target.value;
    setRowsPerPage(value === "all" ? "all" : Number(value));
    setCurrentPage(1); // Reset back to page 1 on page size change
  };

  // Timestamp Formatter
  const formatTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  // 4. CSV Export Function
  const exportToCSV = () => {
    if (sortedVolunteers.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["ID,Name,Email,Mobile,CreatedAt"];
    const rows = sortedVolunteers.map(
      (v) => `"${v.id}","${v.name || ""}","${v.email || ""}","${v.mobileNumber || ""}","${formatTimestamp(v.createdAt)}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `volunteers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  return (
    <div className="card">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Action Toolbar */}
      <div className="table-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search name, email, or mobile..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="toolbar-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Rows Per Page Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label htmlFor="rowsPerPageSelect" style={{ fontSize: "0.9rem", color: "var(--text-muted, #9ca3af)" }}>
              Show:
            </label>
            <select
              id="rowsPerPageSelect"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#1a1a24",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="all">All ({volunteers.length})</option>
            </select>
          </div>

          <span className="badge">
            {sortedVolunteers.length} of {volunteers.length} Records
          </span>
          <button className="btn-secondary-action" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => handleSort("name")}>
                Name <span className="sort-icon">{getSortIcon("name")}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort("email")}>
                Email <span className="sort-icon">{getSortIcon("email")}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort("mobileNumber")}>
                Mobile <span className="sort-icon">{getSortIcon("mobileNumber")}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort("createdAt")}>
                Created At <span className="sort-icon">{getSortIcon("createdAt")}</span>
              </th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="table-status-cell">
                  Loading records...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td>{v.mobileNumber}</td>
                  <td style={{ color: "var(--text-muted, #9ca3af)", whiteSpace: "nowrap" }}>
                    {formatTimestamp(v.createdAt)}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn-delete"
                      onClick={() => deleteVolunteer(v.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-status-cell">
                  {searchTerm ? "No matching records found" : "No records found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Logout Controls */}
      <div className="pagination-container">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="pagination-btn"
            disabled={currentPage === 1 || rowsPerPage === "all"}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ◀ Prev
          </button>
          <span className="badge">
            {rowsPerPage === "all" ? `Showing All (${sortedVolunteers.length})` : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages || rowsPerPage === "all"}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ▶
          </button>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;