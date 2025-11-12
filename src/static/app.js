document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


        const participantsList = details.participants.length > 0
          ? details.participants.map(p => `
              <li class="participant-item" style="list-style:none;display:flex;align-items:center;gap:8px;">
                <span>${p}</span>
                <span class="delete-participant" title="Remove" style="cursor:pointer;color:#c62828;font-size:18px;" data-activity="${name}" data-email="${p}">&#10060;</span>
              </li>
            `).join("")
          : "<li style='list-style:none;'><em>No participants yet</em></li>";


        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants (${details.participants.length}/${details.max_participants}):</strong>
            <ul class="participants-list" style="padding-left:0;">
              ${participantsList}
            </ul>
          </div>
        `;
        // Add event listeners for delete icons after rendering
        setTimeout(() => {
          activityCard.querySelectorAll('.delete-participant').forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activityName = icon.getAttribute('data-activity');
              const email = icon.getAttribute('data-email');
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: 'POST'
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message || 'Participant removed.';
                  messageDiv.className = 'success';
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || 'Failed to remove participant.';
                  messageDiv.className = 'error';
                }
                messageDiv.classList.remove('hidden');
                setTimeout(() => { messageDiv.classList.add('hidden'); }, 5000);
              } catch (error) {
                messageDiv.textContent = 'Error removing participant.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }
            });
          });
        }, 0);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
