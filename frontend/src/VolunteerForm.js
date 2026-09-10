import React, { useState } from "react";

//const API_BASE_URL = "https://volunteers-backend-35oe.onrender.com";
const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "https://volunteers-backend-35oe.onrender.com" // or "http://localhost:8081" if running Spring Boot locally
    : "https://volunteers-backend-35oe.onrender.com";
function VolunteerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const volunteer = { name, email, mobileNumber };

    try {
      const response = await fetch(`${API_BASE_URL}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volunteer),
      });

      if (response.ok) {
        setSuccessMessage("Registration submitted successfully!");
        setName("");
        setEmail("");
        setMobileNumber("");

        // Clear the success message after 4 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 4000);
      } else {
        setSuccessMessage("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting volunteer:", error);
      setSuccessMessage("Submission failed due to a network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h1>Volunteer Registration</h1>

      {successMessage && (
        <p
          style={{
            color: successMessage.includes("successfully") ? "green" : "red",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {successMessage}
        </p>
      )}

      {/* Wrapping inside <form> enables Enter key submission on all inputs */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Enter Mobile"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default VolunteerForm;