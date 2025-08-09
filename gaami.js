document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector("#search-bar");
    const destinationInput = document.querySelector("#destination-input");
    const departingInput = document.querySelector(".input-container input[placeholder='Departing from']");
    const suggestionsBox = document.querySelector("#suggestions-box");
    const travelBox = document.querySelector(".travel-box");
    const videoContainer = document.querySelector(".video-container");
    const backgroundVideo = document.querySelector("#background-video");
    const continueBtn = document.querySelector(".continue-btn");

    function fetchPlaces(query, inputField) {
        if (query.length < 2) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
            return;
        }

        // Handle alternative city names
        const cityAliases = {
            'bangalore': 'Bengaluru',
            'bengaluru': 'Bangalore',
            'bombay': 'Mumbai',
            'mumbai': 'Bombay',
            'calcutta': 'Kolkata',
            'kolkata': 'Calcutta',
            'madras': 'Chennai',
            'chennai': 'Madras'
        };

        // Check if the query matches any city alias
        const normalizedQuery = query.toLowerCase();
        if (cityAliases[normalizedQuery]) {
            query = cityAliases[normalizedQuery];
        }

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=10`)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "block";

                // Add the alternative name if it exists
                if (cityAliases[normalizedQuery]) {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.innerText = cityAliases[normalizedQuery];
                    suggestionItem.addEventListener("click", function () {
                        inputField.value = cityAliases[normalizedQuery];
                        suggestionsBox.innerHTML = "";
                        suggestionsBox.style.display = "none";
                        updateBackgroundImage(cityAliases[normalizedQuery]);
                    });
                    suggestionsBox.appendChild(suggestionItem);
                }

                data.forEach(place => {
                    const name = place.display_name.split(",")[0];
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.innerText = name;
                    suggestionItem.addEventListener("click", function () {
                        inputField.value = name;
                        suggestionsBox.innerHTML = "";
                        suggestionsBox.style.display = "none";
                        updateBackgroundImage(name);
                    });
                    suggestionsBox.appendChild(suggestionItem);
                });
            })
            .catch(error => console.error("Error fetching location data:", error));
    }

    searchInput.addEventListener("input", function () {
        fetchPlaces(searchInput.value.trim(), searchInput);
    });

    destinationInput.removeAttribute("readonly");
    destinationInput.addEventListener("input", function () {
        fetchPlaces(destinationInput.value.trim(), destinationInput);
    });

    departingInput.addEventListener("input", function () {
        fetchPlaces(departingInput.value.trim(), departingInput);
    });

    function updateBackgroundImage(placeName) {
        console.log('Fetching background image for:', placeName); // Debug log
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${placeName}`)
            .then(response => response.json())
            .then(data => {
                let imageUrl = data.thumbnail ? data.thumbnail.source : null;
                console.log('Received image URL:', imageUrl); // Debug log
                
                if (imageUrl) {
                    videoContainer.style.background = `url('${imageUrl}') no-repeat center center/cover`;
                    backgroundVideo.style.display = "none";
                    // Store the background image URL in session storage
                    sessionStorage.setItem('backgroundImageUrl', imageUrl);
                    console.log('Stored background URL in session storage:', imageUrl); // Debug log
                } else {
                    videoContainer.style.background = "none";
                    backgroundVideo.style.display = "block";
                    sessionStorage.removeItem('backgroundImageUrl');
                    console.log('No image URL available, removed from session storage'); // Debug log
                }
            })
            .catch(error => {
                console.error("Error fetching place image:", error);
                videoContainer.style.background = "none";
                backgroundVideo.style.display = "block";
                sessionStorage.removeItem('backgroundImageUrl');
                console.log('Error occurred, removed background URL from session storage'); // Debug log
            });
    }

    // Creating the new box dynamically
    const newBox = document.createElement("div");
    newBox.classList.add("new-box");
    newBox.innerHTML = `
        <span class="back-arrow">⬅️</span>
        <span class="cancel-button">❌</span>
        <h3>Select Group Type</h3>
        <div class="group-selection">
            <button data-group="solo">👤 Solo</button>
            <button data-group="couple">👩‍❤️‍👨 Couple</button>
            <button data-group="friends">👥 Friends</button>
            <button data-group="family">👨‍👩‍👧 Family</button>
        </div>
        <h3>Budget Per Day (₹1000 - ₹10,000)</h3>
        <input type="range" id="budget-slider" min="1000" max="10000" step="500" value="5000">
        <p>Selected Budget: ₹<span id="budget-value">5000</span></p>
        <button class="continue-btn-2">Continue</button>
    `;
    document.body.appendChild(newBox);
    newBox.style.display = "none"; // Hide initially

    // Set minimum date for both inputs to today
    const fromDateInput = document.querySelector("#from-date");
    const tillDateInput = document.querySelector("#till-date");
    
    // Set minimum date to today for both inputs
    const today = new Date().toISOString().split('T')[0];
    fromDateInput.min = today;
    tillDateInput.min = today;

    // Update till-date minimum when from-date changes
    fromDateInput.addEventListener("change", function() {
        tillDateInput.min = this.value; // Set minimum till date to selected from date
        if (tillDateInput.value && tillDateInput.value < this.value) {
            tillDateInput.value = this.value; // Update till date if it's before from date
        }
    });

    // Validate till-date when it changes
    tillDateInput.addEventListener("change", function() {
        if (this.value < fromDateInput.value) {
            alert("Return date cannot be before departure date!");
            this.value = fromDateInput.value;
        }
    });

    // Add event listeners for header buttons
    const tripBtn = document.querySelector(".trip-btn");
    const userBtn = document.querySelector(".user-btn");

    tripBtn.addEventListener("click", function() {
        window.location.href = 'travel-details.html';
    });

    userBtn.addEventListener("click", function() {
        window.location.href = 'login.html';
    });

    // Add popular destinations function
    window.showPopularDestinations = function() {
        const popularDestinations = [
            "Mumbai, India",
            "Delhi, India",
            "Bangalore, India",
            "Chennai, India",
            "Kolkata, India"
        ];

        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "block";

        popularDestinations.forEach(destination => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.innerText = destination;
            suggestionItem.addEventListener("click", function () {
                searchInput.value = destination;
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "none";
                updateBackgroundImage(destination.split(",")[0]);
            });
            suggestionsBox.appendChild(suggestionItem);
        });
    };

    // Remove duplicate continue button event listener and update the existing one
    continueBtn.removeEventListener("click", function() {});
    continueBtn.addEventListener("click", function () {
        const departingValue = departingInput.value.trim();
        const destinationValue = destinationInput.value.trim();
        const fromDate = fromDateInput.value;
        const tillDate = tillDateInput.value;

        // Validate dates
        const selectedFromDate = new Date(fromDate);
        const selectedTillDate = new Date(tillDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!departingValue || !destinationValue || !fromDate || !tillDate) {
            alert("Please fill in all fields before continuing.");
            return;
        }

        if (selectedFromDate < today) {
            alert("Please select a future date for departure!");
            return;
        }

        if (selectedTillDate < selectedFromDate) {
            alert("Return date cannot be before departure date!");
            return;
        }

        // Store trip details
        const tripDetails = {
            departure: departingValue,
            destination: destinationValue,
            fromDate: fromDate,
            tillDate: tillDate
        };
        sessionStorage.setItem('tripDetails', JSON.stringify(tripDetails));

        // Show the new box
        travelBox.style.display = "none";
        newBox.style.display = "block";
    });

    // Back Arrow - Show old box again
    newBox.querySelector(".back-arrow").addEventListener("click", function () {
        newBox.style.display = "none";
        travelBox.style.display = "block";
    });

    // Cancel Button - Hide new box completely
    newBox.querySelector(".cancel-button").addEventListener("click", function () {
        newBox.style.display = "none";
    });

    // Budget Slider Update
    const budgetSlider = newBox.querySelector("#budget-slider");
    const budgetValue = newBox.querySelector("#budget-value");

    budgetSlider.addEventListener("input", function () {
        budgetValue.innerText = budgetSlider.value;
    });

    // Continue Button (Handle next steps)
    newBox.querySelector(".continue-btn-2").addEventListener("click", function () {
        const selectedBudget = budgetSlider.value;
        const selectedGroup = newBox.querySelector(".group-selection button.active")?.dataset.group || "solo";

        // Store all trip details in session storage
        const tripDetails = {
            departure: departingInput.value.trim(),
            destination: destinationInput.value.trim(),
            fromDate: fromDateInput.value,
            tillDate: tillDateInput.value,
            groupType: selectedGroup,
            budget: selectedBudget
        };

        // Save to session storage
        sessionStorage.setItem('tripDetails', JSON.stringify(tripDetails));

        // Redirect to travel details page
        window.location.href = 'travel-details.html';
    });

    // Group Selection Highlight
    newBox.querySelectorAll(".group-selection button").forEach(button => {
        button.addEventListener("click", function () {
            newBox.querySelectorAll(".group-selection button").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Validate trip details and show confirmation alert
    continueBtn.addEventListener("click", function () {
        const departingFrom = departingInput.value.trim();
        const destination = destinationInput.value.trim();
        const fromDate = fromDateInput.value;
        const tillDate = tillDateInput.value;

        if (!departingFrom || !destination || !fromDate || !tillDate) {
            alert("Please fill in all fields before continuing!");
            return;
        }

        console.log("Departing From:", departingFrom);
        console.log("Destination:", destination);
        console.log("From Date:", fromDate);
        console.log("Till Date:", tillDate);

        alert(`Trip planned from ${fromDate} to ${tillDate} from ${departingFrom} to ${destination}!`);
    });
});
