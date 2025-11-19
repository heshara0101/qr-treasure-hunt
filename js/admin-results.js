// Admin Results Page with Debugging
console.log("DEBUG: admin-results.js loaded");

async function loadEventResults() {
    console.log("DEBUG: Loading event results...");

    try {
        // 1️⃣ Get current user
        const userRes = await api.getUser();
        const user = userRes.data;
        console.log("DEBUG: Current user:", user);

        if (user.role !== "admin") {
            alert("Unauthorized");
            return;
        }

        // 2️⃣ Fetch all events
        const eventsRes = await api.listEvents();
        console.log("DEBUG: Events Response:", eventsRes);

        if (!eventsRes.success || !eventsRes.data || eventsRes.data.length === 0) {
            console.warn("DEBUG: No events found");
            renderResultsTable([]); // clear table if no events
            return;
        }

        // 3️⃣ Render dropdown & auto-load first event
        renderEventsDropdown(eventsRes.data);

    } catch (error) {
        console.error("ERROR loading event results:", error);
    }
}

function renderEventsDropdown(events) {
    console.log("DEBUG: Rendering dropdown with events:", events);

    const select = document.getElementById("resultEvent");
    if (!select) {
        console.error("ERROR: resultEvent select not found!");
        return;
    }

    select.innerHTML = `<option value="">-- Select Event --</option>`;

    events.forEach(evt => {
        select.innerHTML += `<option value="${evt.id}">${evt.title}</option>`;
    });

    // Automatically load first event with results
    const firstEventId = events[0]?.id;
    if (firstEventId) {
        select.value = firstEventId;
        console.log("DEBUG: Loading first event by default:", firstEventId);
        loadResultsForEvent(firstEventId);
    }

    // Event listener for dropdown change
    select.onchange = () => {
        const eventId = select.value;
        console.log("DEBUG: Selected event ID:", eventId);
        if (eventId) {
            loadResultsForEvent(eventId);
        } else {
            renderResultsTable([]); // clear table if no event selected
        }
    };
}

async function loadResultsForEvent(eventId) {
    console.log("DEBUG: Loading results for event:", eventId);

    if (!eventId) {
        console.warn("DEBUG: No event ID provided, skipping loadResultsForEvent");
        renderResultsTable([]);
        return;
    }

    try {
        const resultsRes = await api.getEventResults(eventId);
        console.log("DEBUG: Event results response:", resultsRes);

        const results = resultsRes.data || [];
        console.log("DEBUG: resultsRes.data =", results);

        renderResultsTable(results);

    } catch (error) {
        console.error("ERROR loading event results:", error);
        renderResultsTable([]);
    }
}

function renderResultsTable(results) {
    console.log("DEBUG: Rendering results table:", results);

    const tbody = document.getElementById("resultsTableBody");
    if (!tbody) {
        console.error("ERROR: resultsTableBody not found!");
        return;
    }

    tbody.innerHTML = "";

    if (!results || results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No users found.</td></tr>`;
        return;
    }

    results.forEach(r => {
        const completedTasks = r.tasks_completed ?? 0;
        const totalTasks = r.total_tasks ?? 0;
        const progress = r.progress_percentage ?? 0;

        console.log("DEBUG: Rendering row for:", r);

        tbody.innerHTML += `
            <tr>
                <td>${r.name}</td>
                <td>${r.email}</td>
                <td>${completedTasks}</td>
                <td>${totalTasks}</td>
                <td>${progress}%</td>
            </tr>
        `;
    });
}

// Initial call to load events & results
document.addEventListener("DOMContentLoaded", () => {
    loadEventResults();
});
