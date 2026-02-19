document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#student-form");
  const nameInput = document.querySelector("#student-name");
  const marksInput = document.querySelector("#student-marks");
  const tableBody = document.querySelector("#student-table");
  const message = document.querySelector("#form-message");
  const emptyState = document.querySelector("#empty-state");
  const clearButton = document.querySelector("#clear-records");

  const STORAGE_KEY = "studentRecords";

  if (!form || !nameInput || !marksInput || !tableBody || !message || !emptyState || !clearButton) {
    console.error("Required DOM elements not found — event listeners not attached.");
    return;
  }

  const getRecords = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const setRecords = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  };

  const renderRecords = () => {
    const records = getRecords();
    tableBody.innerHTML = "";

    records.forEach((record) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      const marksCell = document.createElement("td");

      nameCell.textContent = record.name;
      marksCell.textContent = record.marks;

      row.appendChild(nameCell);
      row.appendChild(marksCell);
      tableBody.appendChild(row);
    });

    emptyState.style.display = records.length ? "none" : "block";
  };

  const showMessage = (text, type = "success") => {
    message.textContent = text;
    message.classList.toggle("error", type === "error");
  };

  const resetMessage = () => {
    message.textContent = "";
    message.classList.remove("error");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    resetMessage();

    const name = nameInput.value.trim();
    const marks = Number(marksInput.value);

    if (!name) {
      showMessage("Please enter a student name.", "error");
      return;
    }

    if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      showMessage("Marks must be a number between 0 and 100.", "error");
      return;
    }

    const records = getRecords();
    records.push({ name, marks });
    setRecords(records);

    renderRecords();
    showMessage("Record saved locally.");
    form.reset();
    nameInput.focus();
  });

  clearButton.addEventListener("click", () => {
    setRecords([]);
    renderRecords();
    showMessage("All records cleared.");
  });

  renderRecords();
});