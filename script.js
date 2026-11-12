
/* CampusConnect - Shared JavaScript
   Events and registrations are stored in this browser using localStorage.
   Front-end demo only.
*/

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const STORAGE_KEY = "campusEvents";
    const REGISTRATION_KEY = "campusRegistrations";

    // =====================================
    // 1. COMMON FUNCTIONS
    // =====================================

    function getEvents() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not read events:", error);
            return [];
        }
    }

    function saveEvents(events) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    function getRegistrations() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(REGISTRATION_KEY) || "[]"
            );
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not read registrations:", error);
            return [];
        }
    }

    function saveRegistrations(registrations) {
        localStorage.setItem(
            REGISTRATION_KEY,
            JSON.stringify(registrations)
        );
    }

    function getFeedback() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("campusFeedback") || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Could not read feedback:", error);
        return [];
    }
}

function saveFeedback(feedback) {
    localStorage.setItem(
        "campusFeedback",
        JSON.stringify(feedback)
    );
}

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function prettyDate(dateValue) {
        if (!dateValue) return "Date not set";

        const date = new Date(dateValue + "T00:00:00");

        if (Number.isNaN(date.getTime())) return dateValue;

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function categoryClass(category) {
        const value = String(category || "other").toLowerCase();

        if (value.includes("cultur")) return "cat-cultural";
        if (value.includes("workshop")) return "cat-workshop";
        if (value.includes("seminar")) return "cat-seminar";

        if (value.includes("technical") || value.includes("compet")) {
            return "cat-competition";
        }

        return "cat-other";
    }

    function categoryValue(category) {
        return categoryClass(category).replace("cat-", "");
    }


    // =====================================
    // 2. ADD EVENT FORM
    // =====================================

    const addForm = document.getElementById("add-event-form");

    if (addForm) {
        const dateInput = document.getElementById("event-date");

        if (dateInput) {
            const today = new Date();

            const localToday = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().split("T")[0];

            dateInput.min = localToday;
        }

        addForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!addForm.reportValidity()) return;

            const capacityInput =
                document.getElementById("event-capacity");

            const eventData = {
                id: Date.now(),
                name: document.getElementById("event-name").value.trim(),
                category: document.getElementById("event-category").value,
                date: document.getElementById("event-date").value,
                time: document.getElementById("event-time").value,
                venue: document.getElementById("event-venue").value.trim(),

                capacity: capacityInput && capacityInput.value
                    ? Number(capacityInput.value)
                    : 0,

                image: document.getElementById("event-image").value.trim(),

                description: document
                    .getElementById("event-description")
                    .value.trim(),

                createdAt: new Date().toISOString()
            };

            if (
                !eventData.name ||
                !eventData.category ||
                !eventData.date ||
                !eventData.time ||
                !eventData.venue ||
                !eventData.description
            ) {
                alert("Please complete all required fields.");
                return;
            }

            const events = getEvents();
            events.push(eventData);

            try {
                saveEvents(events);

                alert("Event added successfully!");

                addForm.reset();

                window.location.href = "dashboard.html";

            } catch (error) {
                alert("Unable to save event. Check browser storage.");
                console.error(error);
            }
        });
    }


    // =====================================
    // 3. DISPLAY ORGANIZER-CREATED EVENTS
    // =====================================

    const cardGrid = document.querySelector(".card-grid");

    if (cardGrid) {
        getEvents().forEach(function (item) {
            const card = document.createElement("article");

            card.className =
                "event-card " + categoryClass(item.category);

            card.dataset.customEvent = "true";
            card.dataset.category = categoryValue(item.category);

            const safeName = escapeHTML(item.name);
            const safeCategory = escapeHTML(item.category);
            const safeVenue = escapeHTML(item.venue);
            const safeDescription = escapeHTML(item.description);
            const safeTime = escapeHTML(item.time);

            const imageMarkup = item.image
                ? '<img src="' + escapeHTML(item.image) +
                  '" alt="' + safeName +
                  '" style="width:100%;max-height:190px;object-fit:cover;border-radius:10px;margin-bottom:12px;">'
                : "";

            card.innerHTML =
                '<div class="card-body">' +

                    imageMarkup +

                    '<div class="card-tags">' +
                        '<span class="badge">' + safeCategory + '</span>' +
                        '<span class="seat-chip ok">New event</span>' +
                    '</div>' +

                    '<h3>' + safeName + '</h3>' +

                    '<ul class="meta">' +
                        '<li><span>Date: ' +
                            escapeHTML(prettyDate(item.date)) +
                        '</span></li>' +

                        '<li><span>Time: ' +
                            safeTime +
                        '</span></li>' +

                        '<li><span>Venue: ' +
                            safeVenue +
                        '</span></li>' +
                    '</ul>' +

                    '<p class="desc">' +
                        safeDescription +
                    '</p>' +

                    '<p class="audience"><strong>Capacity:</strong> ' +
                        (item.capacity > 0
                            ? escapeHTML(item.capacity) + " participants"
                            : "Not specified") +
                    '</p>' +

                '</div>' +

                '<div class="card-actions">' +
                    '<a class="btn btn-primary" href="register.html">Register</a>' +
                '</div>';

            cardGrid.appendChild(card);
        });
    }


    // =====================================
    // 4. EVENT SEARCH AND CHIP FILTERS
    // =====================================

    const searchInput = document.getElementById("event-search");

    const searchForm = document.querySelector(
        ".toolbar form.search"
    );

    const chips = Array.from(
        document.querySelectorAll(".toolbar .chip")
    );

    if (cardGrid && (searchInput || chips.length)) {
        let activeCategory = "all";

        function filterCards() {
            const query = searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

            cardGrid.querySelectorAll(".event-card").forEach(function (card) {
                const text = card.textContent.toLowerCase();

                const categoryMatches =
                    activeCategory === "all" ||
                    card.classList.contains("cat-" + activeCategory);

                const textMatches =
                    !query || text.includes(query);

                card.hidden = !(categoryMatches && textMatches);
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterCards);
        }

        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards();
            });

            const searchButton = searchForm.querySelector(
                'button[type="button"]'
            );

            if (searchButton) {
                searchButton.addEventListener("click", filterCards);
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                const label = chip.textContent.trim().toLowerCase();

                activeCategory = label === "all"
                    ? "all"
                    : label.replace(/s$/, "");

                if (label.includes("competition")) {
                    activeCategory = "competition";
                }

                chips.forEach(function (other) {
                    other.setAttribute(
                        "aria-pressed",
                        String(other === chip)
                    );
                });

                filterCards();
            });
        });
    }


    // =====================================
    // 5. ORGANIZER DASHBOARD EVENT TABLE
    // =====================================

    const dashboardBody = document.getElementById("reg-body");

    if (dashboardBody) {
        const savedEvents = getEvents();

        // Keep existing demo table columns aligned.
        Array.from(dashboardBody.rows).forEach(function (row) {
            if (row.cells.length === 6) {
                row.appendChild(document.createElement("td"));
            }
        });

        // Display organizer-created events.
        savedEvents.forEach(function (item) {
            const row = document.createElement("tr");

            const capacity = Number(item.capacity) || 0;

            row.innerHTML =
                '<th scope="row">' +
                    escapeHTML(item.name) +
                '</th>' +

                '<td>' +
                    escapeHTML(prettyDate(item.date)) +
                '</td>' +

                '<td>0</td>' +

                '<td>' +
                    (capacity > 0
                        ? escapeHTML(capacity)
                        : "Not set") +
                '</td>' +

                '<td>' +
                    '<div class="meter meter-sm fill-0" role="img" aria-label="0 percent full">' +
                        '<span></span>' +
                    '</div>' +
                '</td>' +

                '<td><span class="seat-chip ok">New</span></td>' +

                '<td>' +
                    '<button type="button" class="delete-event" data-event-id="' +
                        escapeHTML(String(item.id)) +
                    '">' +
                        'Delete' +
                    '</button>' +
                '</td>';

            dashboardBody.appendChild(row);
        });

        // Update active event count.
        const activeEvents = document.getElementById("active-events");

        if (activeEvents) {
            activeEvents.textContent = String(
                6 + savedEvents.length
            );
        }

        // Delete event functionality.
        dashboardBody.addEventListener("click", function (event) {
            const deleteButton = event.target.closest(".delete-event");

            if (!deleteButton) return;

            const eventId = deleteButton.dataset.eventId;

            const confirmDelete = confirm(
                "Are you sure you want to delete this event?"
            );

            if (!confirmDelete) return;

            const updatedEvents = getEvents().filter(function (item) {
                return String(item.id) !== String(eventId);
            });

            saveEvents(updatedEvents);

            const row = deleteButton.closest("tr");

            if (row) {
                row.remove();
            }

            if (activeEvents) {
                activeEvents.textContent = String(
                    6 + updatedEvents.length
                );
            }

            alert("Event deleted successfully!");
        });
    }


    // =====================================
    // 6. EVENT FILTER BUTTONS
    // =====================================

    const filterButtons = document.querySelectorAll(".filter-btn");
    const noResults = document.getElementById("no-results");

    if (filterButtons.length || noResults) {
        let selectedCategory = "all";

        function filterEvents() {
            const cards = document.querySelectorAll(".event-card");

            const searchText = searchInput
                ? searchInput.value.toLowerCase().trim()
                : "";

            let visibleCount = 0;

            cards.forEach(function (card) {
                const text = card.textContent.toLowerCase();

                const category = (
                    card.dataset.category ||
                    card.className.match(/cat-([a-z]+)/)?.[1] ||
                    "other"
                ).toLowerCase();

                const matchesSearch = text.includes(searchText);

                const matchesCategory =
                    selectedCategory === "all" ||
                    category === selectedCategory;

                if (matchesSearch && matchesCategory) {
                    card.hidden = false;
                    visibleCount++;
                } else {
                    card.hidden = true;
                }
            });

            if (noResults) {
                noResults.hidden = visibleCount !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterEvents);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedCategory =
                    button.dataset.category || "all";

                filterButtons.forEach(function (btn) {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                filterEvents();
            });
        });

        filterEvents();
    }


    // =====================================
    // 7. CAMPUSCONNECT DEMO LOGIN
    // =====================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document
                .getElementById("login-email")
                .value.trim();

            const password = document
                .getElementById("login-password")
                .value;

            const selectedRole = document.querySelector(
                'input[name="role"]:checked'
            );

            if (!email || !password) {
                alert("Please enter email and password.");
                return;
            }

            if (!selectedRole) {
                alert("Please select your login role.");
                return;
            }

            // Demo login only. This is not real authentication.
            localStorage.setItem("campusUser", email);
            localStorage.setItem("campusRole", selectedRole.value);

            alert("Login Successful!");

            if (selectedRole.value === "organizer") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "events.html";
            }
        });
    }


    // =====================================
    // 8. STUDENT REGISTRATION SYSTEM
    // =====================================

    const registrationForm = document.getElementById("reg-form");

    if (registrationForm) {
        const eventSelect = document.getElementById("event-select");

        // Add organizer-created events to the dropdown.
        if (eventSelect) {
            getEvents().forEach(function (item) {
                const option = document.createElement("option");

                option.value = "custom-" + item.id;

                option.textContent =
                    item.name + " (" + prettyDate(item.date) + ")";

                eventSelect.appendChild(option);
            });
        }

        registrationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!registrationForm.reportValidity()) return;

            if (!eventSelect) {
                alert("Event selection field was not found.");
                return;
            }

            const studentName = document
                .getElementById("full-name").value.trim();

            const studentId = document
                .getElementById("student-id").value.trim();

            const email = document
                .getElementById("email").value.trim().toLowerCase();

            const phone = document
                .getElementById("phone").value.trim();

            const department =
                document.getElementById("department").value;

            const year =
                document.getElementById("year").value;

            const selectedEvent = eventSelect.value;

            const teamName = document
                .getElementById("team-name").value.trim();

            const teamSize =
                document.getElementById("team-size").value;

            const notes =
                document.getElementById("notes").value.trim();

            if (!selectedEvent) {
                alert("Please select an event.");
                return;
            }

            // Find selected custom event.
            let eventName = selectedEvent;
            let eventId = selectedEvent;
            let capacity = 0;

            if (selectedEvent.startsWith("custom-")) {
                const id = selectedEvent.replace("custom-", "");

                const selectedCustomEvent = getEvents().find(
                    function (item) {
                        return String(item.id) === id;
                    }
                );

                if (!selectedCustomEvent) {
                    alert("This event is no longer available.");
                    return;
                }

                eventName = selectedCustomEvent.name;
                eventId = String(selectedCustomEvent.id);
                capacity = Number(selectedCustomEvent.capacity) || 0;
            }

            const registrations = getRegistrations();

            // Prevent duplicate registration.
            const alreadyRegistered = registrations.some(
                function (item) {
                    return (
                        String(item.eventId) === String(eventId) &&
                        (
                            String(item.studentId || "").toLowerCase() ===
                                studentId.toLowerCase() ||

                            String(item.email || "").toLowerCase() === email
                        )
                    );
                }
            );

            if (alreadyRegistered) {
                alert("You have already registered for this event!");
                return;
            }

            // Check event capacity.
            if (capacity > 0) {
                const registeredCount = registrations.filter(
                    function (item) {
                        return String(item.eventId) === String(eventId);
                    }
                ).length;

                if (registeredCount >= capacity) {
                    alert("Sorry! This event is full.");
                    return;
                }
            }

            // Create registration record.
            const registration = {
                id: Date.now(),
                studentName: studentName,
                studentId: studentId,
                email: email,
                phone: phone,
                department: department,
                year: year,
                eventId: String(eventId),
                eventName: eventName,
                teamName: teamName,
                teamSize: teamSize,
                notes: notes,
                registeredAt: new Date().toISOString(),
                checkedIn: false,
                checkedInAt: null
            };

            // Save registration.
            try {
                registrations.push(registration);
                saveRegistrations(registrations);

                // Remember latest registration for confirmation page.
                localStorage.setItem(
                    "lastRegistrationId",
                    String(registration.id)
                );

                const params = new URLSearchParams();

                params.set("name", studentName);
                params.set("event", eventName);
                params.set("studentId", studentId);
                params.set("registrationId", String(registration.id));

                alert("Registration successful!");

                window.location.href =
                    "confirmation.html?" + params.toString();

            } catch (error) {
                console.error("Registration error:", error);
                alert("Unable to save registration. Please try again.");
            }
        });
    }


    // =====================================
    // 9. DASHBOARD REGISTRATION STATISTICS
    // =====================================

    const registrationsBody =
        document.getElementById("recent-reg-body");

    const totalRegistrations =
        document.getElementById("total-regs");

    const allRegistrations = getRegistrations();

    if (totalRegistrations) {
        totalRegistrations.textContent = (
            1223 + allRegistrations.length
        ).toLocaleString("en-IN");
    }

    // Show latest registrations first.
    if (registrationsBody && allRegistrations.length > 0) {
        const sortedRegistrations = [...allRegistrations].sort(
            function (a, b) {
                return new Date(b.registeredAt || 0) -
                    new Date(a.registeredAt || 0);
            }
        );

        sortedRegistrations.forEach(function (item) {
            const row = document.createElement("tr");

            const registeredDate = item.registeredAt
                ? new Date(item.registeredAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                : "N/A";

            const statusText = item.checkedIn
                ? "Checked In"
                : "Confirmed";

            row.innerHTML =
                "<th scope='row'>" +
                    escapeHTML(item.studentName) +
                "</th>" +

                "<td>" +
                    escapeHTML(item.studentId) +
                "</td>" +

                "<td>" +
                    escapeHTML(item.eventName) +
                "</td>" +

                "<td>" +
                    escapeHTML(registeredDate) +
                "</td>" +

                "<td><span class='seat-chip ok'>" +
                    statusText +
                "</span></td>";

            registrationsBody.appendChild(row);
        });
    }


    // =====================================
    // 10. CONFIRMATION PAGE + QR DIGITAL PASS
    // =====================================

    if (window.location.pathname.endsWith("confirmation.html")) {
        const params = new URLSearchParams(window.location.search);

        // Get ID from URL or latest saved registration.
        const registrationId =
            params.get("registrationId") ||
            localStorage.getItem("lastRegistrationId");

        const savedRegistrations = getRegistrations();

        const registration = savedRegistrations.find(
            function (item) {
                return String(item.id) === String(registrationId);
            }
        );

        if (registration) {
            function setText(id, value) {
                const element = document.getElementById(id);

                if (element) {
                    element.textContent = value || "Not provided";
                }
            }

            // Display registration details.
            setText("slip-status", "✔ Registration Successful");
            setText("slip-event", registration.eventName);
            setText("slip-event-copy", registration.eventName);
            setText("slip-name", registration.studentName);
            setText("slip-student-id", registration.studentId);
            setText("slip-email", registration.email);
            setText("slip-department", registration.department);
            setText("slip-year", registration.year);
            setText("slip-reference", "CC-" + registration.id);

            // Generate unique QR Digital Entry Pass.
            const qrElement =
                document.getElementById("registration-qr");

            const qrPassCode =
                document.getElementById("qr-pass-code");

            const qrCodeText = "CC-" + registration.id;

            if (qrPassCode) {
                qrPassCode.textContent = qrCodeText;
            }

            if (qrElement) {
                qrElement.innerHTML = "";

                if (typeof QRCode !== "undefined") {
                    new QRCode(qrElement, {
                        text: qrCodeText,
                        width: 180,
                        height: 180,
                        colorDark: "#111827",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } else {
                    qrElement.textContent =
                        "QR library not loaded. Please refresh the page.";
                }
            }

        } else {
            const status = document.getElementById("slip-status");

            if (status) {
                status.textContent =
                    "Registration not found. Please register for an event first.";
            }
        }
    }


    // =====================================
    // 11. QR ENTRY PASS: ONE-TIME CHECK-IN
    // =====================================

    const verifyForm =
        document.getElementById("verify-pass-form");

    if (verifyForm) {
        verifyForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const input = document.getElementById("pass-code");

            const result =
                document.getElementById("verification-result");

            if (!input || !result) return;

            const enteredCode =
                input.value.trim().toUpperCase();

            // Validate QR pass code format.
            if (!/^CC-\d+$/.test(enteredCode)) {
                result.textContent = "❌ Invalid QR Pass Code.";
                return;
            }

            const registrationId =
                enteredCode.replace(/^CC-/, "");

            const registrations = getRegistrations();

            const matchedRegistration = registrations.find(
                function (item) {
                    return String(item.id) === registrationId;
                }
            );

            if (!matchedRegistration) {
                result.textContent =
                    "❌ INVALID PASS | Registration not found.";
                return;
            }

            // Stop a second check-in using the same pass.
            if (matchedRegistration.checkedIn === true) {
                result.textContent =
                    "⚠️ ALREADY USED | " +
                    matchedRegistration.studentName +
                    " has already checked in.";

                return;
            }

            // Save first successful check-in.
            matchedRegistration.checkedIn = true;

            matchedRegistration.checkedInAt =
                new Date().toISOString();

            try {
                saveRegistrations(registrations);

                result.textContent =
                    "✅ ENTRY APPROVED | Student: " +
                    matchedRegistration.studentName +
                    " | Student ID: " +
                    matchedRegistration.studentId +
                    " | Event: " +
                    matchedRegistration.eventName;

                input.value = "";

            } catch (error) {
                result.textContent =
                    "❌ Could not save check-in. Please try again.";

                console.error("Check-in error:", error);
            }
        });
    }

                // =====================================
    // 12. STUDENT EVENT FEEDBACK SYSTEM
    // =====================================

    const feedbackForm = document.getElementById("feedback-form");

    if (feedbackForm) {
        const params = new URLSearchParams(window.location.search);

        const registrationId =
            params.get("registrationId") ||
            localStorage.getItem("lastRegistrationId");

        const ratingInput =
            document.getElementById("feedback-rating");

        const commentInput =
            document.getElementById("feedback-comment");

        const feedbackMessage =
            document.getElementById("feedback-message");

        const registrations = getRegistrations();

        const registration = registrations.find(function (item) {
            return String(item.id) === String(registrationId);
        });

        const feedbacks = getFeedback();

        const existingFeedback = feedbacks.find(function (item) {
            return String(item.registrationId) ===
                String(registrationId);
        });

        const submitButton =
            feedbackForm.querySelector('button[type="submit"]');

        if (!registration) {
            feedbackMessage.textContent =
                "Registration not found. Please open your confirmation slip.";

            feedbackForm.querySelectorAll("input, select, textarea, button")
                .forEach(function (element) {
                    element.disabled = true;
                });

        } else if (registration.checkedIn !== true) {
            feedbackMessage.textContent =
                "Feedback will become available after your event entry is verified.";

            feedbackForm.querySelectorAll("input, select, textarea, button")
                .forEach(function (element) {
                    element.disabled = true;
                });

        } else if (existingFeedback) {
            feedbackMessage.textContent =
                "You have already submitted feedback for this event. Thank you!";

            if (ratingInput) {
                ratingInput.value = String(existingFeedback.rating);
                ratingInput.disabled = true;
            }

            if (commentInput) {
                commentInput.value = existingFeedback.comment;
                commentInput.disabled = true;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }
        }

        feedbackForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!registration || registration.checkedIn !== true) {
                feedbackMessage.textContent =
                    "Only verified attendees can submit feedback.";
                return;
            }

            const currentFeedbacks = getFeedback();

            const alreadySubmitted = currentFeedbacks.some(
                function (item) {
                    return String(item.registrationId) ===
                        String(registration.id);
                }
            );

            if (alreadySubmitted) {
                feedbackMessage.textContent =
                    "You have already submitted feedback.";
                return;
            }

            const rating = Number(ratingInput.value);
            const comment = commentInput.value.trim();

            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                feedbackMessage.textContent =
                    "Please select a rating between 1 and 5.";
                return;
            }

            if (!comment) {
                feedbackMessage.textContent =
                    "Please write your feedback.";
                return;
            }

            const feedbackRecord = {
                registrationId: String(registration.id),
                studentName: registration.studentName,
                eventName: registration.eventName,
                rating: rating,
                comment: comment,
                submittedAt: new Date().toISOString()
            };

            try {
                currentFeedbacks.push(feedbackRecord);
                saveFeedback(currentFeedbacks);

                feedbackMessage.textContent =
                    "Thank you! Your feedback has been submitted successfully.";

                ratingInput.disabled = true;
                commentInput.disabled = true;

                if (submitButton) {
                    submitButton.disabled = true;
                }

            } catch (error) {
                console.error("Feedback save error:", error);

                feedbackMessage.textContent =
                    "Unable to save feedback. Please try again.";
            }
        });
    }


    // =====================================
    // 13. ORGANIZER FEEDBACK DASHBOARD
    // =====================================

    const feedbackList =
        document.getElementById("feedback-list");

    if (feedbackList) {
        const feedbacks = getFeedback();

        const feedbackCount =
            document.getElementById("feedback-count");

        const averageRating =
            document.getElementById("average-rating");

        if (feedbackCount) {
            feedbackCount.textContent = String(feedbacks.length);
        }

        const totalRating = feedbacks.reduce(
            function (total, item) {
                return total + Number(item.rating || 0);
            },
            0
        );

        const average = feedbacks.length
            ? (totalRating / feedbacks.length).toFixed(1)
            : "0.0";

        if (averageRating) {
            averageRating.textContent = average + " / 5";
        }

        if (feedbacks.length === 0) {
            feedbackList.innerHTML =
                '<tr><td colspan="5">No feedback submitted yet.</td></tr>';
        } else {
            feedbackList.innerHTML = "";

            const sortedFeedback = [...feedbacks].sort(
                function (a, b) {
                    return new Date(b.submittedAt) -
                        new Date(a.submittedAt);
                }
            );

            sortedFeedback.forEach(function (item) {
                const row = document.createElement("tr");

                const date = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    })
                    : "N/A";

                row.innerHTML =
                    "<td>" +
                        escapeHTML(item.studentName) +
                    "</td>" +

                    "<td>" +
                        escapeHTML(item.eventName) +
                    "</td>" +

                    "<td>" +
                        "★".repeat(Math.min(5, Math.max(0, Number(item.rating) || 0))) +
                        " (" + escapeHTML(item.rating) + "/5)" +
                    "</td>" +

                    "<td>" +
                        escapeHTML(item.comment) +
                    "</td>" +

                    "<td>" +
                        escapeHTML(date) +
                    "</td>";

                feedbackList.appendChild(row);
            });
        }
    }
});
