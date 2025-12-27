// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const resultSection = document.getElementById("resultSection");
  const feedbackDiv = document.getElementById("feedback");

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("resume");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🔗 Call FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response from backend.");
      }

      const result = await response.json();

      // ✅ Show result
      feedbackDiv.innerText = result.feedback || "No feedback received.";
      resultSection.style.display = "block";
    } catch (error) {
      console.error("Error:", error);
      feedbackDiv.innerText = "❌ Error fetching feedback. Please try again.";
      resultSection.style.display = "block";
    }
  });
});
