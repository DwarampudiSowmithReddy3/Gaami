// No API keys needed for OpenStreetMap
class TravelDetails {
    constructor(departure, destination, fromDate, tillDate, groupType, budget) {
        this.departure = departure;
        this.destination = destination;
        this.fromDate = fromDate;
        this.tillDate = tillDate;
        this.groupType = groupType;
        this.budget = budget;
        this.map = null;
        this.markers = [];
        this.transportOptions = {};
        this.placesToVisit = [];
        this.hotels = [];
        this.foodRecommendations = [];
        this.weatherForecast = {};
    }

    async initMap() {
        // Initialize the map
        this.map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add markers for departure and destination
        const departureCoords = await this.getCoordinates(this.departure);
        const destinationCoords = await this.getCoordinates(this.destination);

        if (departureCoords) {
            L.marker(departureCoords)
                .addTo(this.map)
                .bindPopup(`Departure: ${this.departure}`)
                .openPopup();
        }

        if (destinationCoords) {
            L.marker(destinationCoords)
                .addTo(this.map)
                .bindPopup(`Destination: ${this.destination}`)
                .openPopup();
        }

        // Fit map to show both markers
        if (departureCoords && destinationCoords) {
            this.map.fitBounds([departureCoords, destinationCoords], {
                padding: [50, 50]
            });
        }
    }

    async getCoordinates(city) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
            const data = await response.json();
            if (data && data[0]) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }

    async fetchTransportOptions() {
        try {
            const formattedDate = this.fromDate.split('T')[0];

            const [trainRes, busRes, flightRes] = await Promise.all([
                fetch(`http://localhost:5001/api/trains?source=${encodeURIComponent(this.departure)}&destination=${encodeURIComponent(this.destination)}&date=${formattedDate}`),
                fetch(`http://localhost:5001/api/buses?source=${encodeURIComponent(this.departure)}&destination=${encodeURIComponent(this.destination)}&date=${formattedDate}`),
                fetch(`http://localhost:5001/api/flights?source=${encodeURIComponent(this.departure)}&destination=${encodeURIComponent(this.destination)}`)
            ]);

            // Handle each response individually
            const trains = trainRes.ok ? await trainRes.json() : [];
            const buses = busRes.ok ? await busRes.json() : [];
            const flights = flightRes.ok ? await flightRes.json() : [];

            // Log the responses for debugging
            console.log('API Responses:', {
                trains: { status: trainRes.status, data: trains },
                buses: { status: busRes.status, data: buses },
                flights: { status: flightRes.status, data: flights }
            });

            return {
                trains: Array.isArray(trains) ? trains : [],
                buses: Array.isArray(buses) ? buses : [],
                flights: Array.isArray(flights) ? flights : []
            };
        } catch (error) {
            console.error('Error fetching transport options:', error);
            return {
                trains: [],
                buses: [],
                flights: []
            };
        }
    }

    async fetchPlacesToVisit() {
        try {
            const response = await fetch('./train-api/data/places.json');
            const allPlaces = await response.json();
            
            // Filter places based on the destination location
            const places = allPlaces.filter(place => 
                place.location.toLowerCase() === this.destination.toLowerCase()
            );

            console.log('Fetched places:', places); // Add logging to debug
            return places;
        } catch (error) {
            console.error('Error fetching places:', error);
            return [];
        }
    }

    async fetchHotels() {
        try {
            const response = await fetch('./train-api/data/hotels.json');
            const allHotels = await response.json();
            
            // Filter hotels based on the destination location
            const hotels = allHotels.filter(hotel => 
                hotel.location.toLowerCase() === this.destination.toLowerCase()
            );

            console.log(`Fetched hotels for ${this.destination}:`, hotels);
            return hotels;
        } catch (error) {
            console.error('Error fetching hotels:', error);
            return [];
        }
    }

    async fetchFoodRecommendations() {
        try {
            const response = await fetch('./train-api/data/food.json');
            const allFood = await response.json();
            
            // Filter food recommendations based on the destination location
            const food = allFood.filter(item => 
                item.location.toLowerCase() === this.destination.toLowerCase()
            );

            console.log(`Fetched food recommendations for ${this.destination}:`, food);
            return food;
        } catch (error) {
            console.error('Error fetching food recommendations:', error);
            return [];
        }
    }

    async fetchWeatherForecast() {
        try {
            // Here you would implement actual API calls to fetch weather data
            // For now, return empty object
            return {};
        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            return {};
        }
    }

    // Helper function to calculate days between dates
    getDaysDifference() {
        const from = new Date(this.fromDate);
        const till = new Date(this.tillDate);
        return Math.ceil((till - from) / (1000 * 60 * 60 * 24));
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const sectionButtons = document.querySelectorAll('.section-btn');
    const sectionContent = document.getElementById('section-content');
    const mapContainer = document.querySelector('.map-container');
    const toggleMapBtn = document.getElementById('toggle-map');
    let travelDetailsInstance = null;

    // Get trip details from session storage
    const tripDetails = JSON.parse(sessionStorage.getItem('tripDetails'));
    if (tripDetails) {
        travelDetailsInstance = new TravelDetails(
            tripDetails.departure,
            tripDetails.destination,
            tripDetails.fromDate,
            tripDetails.tillDate,
            tripDetails.groupType,
            tripDetails.budget
        );
        
        // Initialize the map
        await travelDetailsInstance.initMap();
        
        // Show flights section by default
        showSection('flights');
    }

    // Handle section button clicks
    sectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            showSection(section);
        });
    });

    // Handle map toggle
    toggleMapBtn.addEventListener('click', () => {
        mapContainer.classList.toggle('collapsed');
        mapContainer.classList.toggle('expanded');
        if (travelDetailsInstance && travelDetailsInstance.map) {
            travelDetailsInstance.map.invalidateSize();
        }
    });

    // Handle select buttons for transport options, place names, hotel names, and food names
    sectionContent.addEventListener('click', async (e) => {
        console.log('Clicked element:', e.target);
        if (e.target.classList.contains('select-btn')) {
            const transportId = e.target.dataset.id;
            const section = document.querySelector('.section-btn.active').dataset.section;
            
            // Store the selected transport in session storage
            const selectedTransport = {
                type: section,
                id: transportId,
                timestamp: new Date().toISOString()
            };
            sessionStorage.setItem('selectedTransport', JSON.stringify(selectedTransport));
            
            // Show confirmation
            alert(`Selected ${section.slice(0, -1)} ${transportId}!`);
        } else if (e.target.classList.contains('place-name')) {
            const placeName = e.target.dataset.placeName;
            if (placeName) {
                fetchAndDisplayPlaceImages(placeName);
            }
        } else if (e.target.classList.contains('hotel-name')) {
            console.log('Hotel name element clicked:', e.target.dataset.hotelName);
            const hotelName = e.target.dataset.hotelName;
            if (hotelName) {
                fetchAndDisplayPlaceImages(hotelName);
            }
        } else if (e.target.classList.contains('food-name')) {
            const foodName = e.target.dataset.foodName;
            if (foodName) {
                fetchAndDisplayPlaceImages(foodName);
            }
        }
    });

    async function showSection(section) {
        sectionContent.innerHTML = '<div style="text-align:center; width:100%;">Loading...</div>';
        sectionButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.section-btn[data-section="${section}"]`).classList.add('active');

        if (!travelDetailsInstance) return;

        try {
            if (section === 'buses' || section === 'trains' || section === 'flights') {
                const data = await travelDetailsInstance.fetchTransportOptions();
                let items = [];
                if (section === 'trains') items = data.trains;
                if (section === 'flights') items = data.flights;
                if (section === 'buses') items = data.buses;

                console.log(`Displaying ${section}:`, {
                    count: items.length,
                    sample: items[0]
                });

                if (!items.length) {
                    sectionContent.innerHTML = `<div style='text-align:center;width:100%;'>No ${section} available for this route.</div>`;
                } else {
                    sectionContent.innerHTML = items.map(item => `
                        <div class="scale-card">
                            <div class="card-col"><b>${item.operator || item.name || item.airline}</b></div>
                            <div class="card-col"><span>🕒</span> ${item.departureTime} — ${item.arrivalTime}</div>
                            <div class="card-col"><span>💰</span> ₹${item.price}</div>
                            <button class="select-btn" data-id="${item.id}">Select</button>
                        </div>
                    `).join('');
                }
            } else if (section === 'places') {
                const places = await travelDetailsInstance.fetchPlacesToVisit();
                
                if (!places.length) {
                    sectionContent.innerHTML = `<div style='text-align:center;width:100%;'>No places available for ${travelDetailsInstance.destination}.</div>`;
                } else {
                    sectionContent.innerHTML = places.map(place => `
                        <div class="scale-card">
                            <div class="card-col"><b class="place-name" data-place-name="${place.name}" style="cursor: pointer;">${place.name}</b></div>
                            <div class="card-col"><span>🏷️</span> ${place.category}</div>
                            <div class="card-col"><span>⭐</span> ${place.rating}</div>
                            <div class="card-col"><span>💰</span> ₹${place.entryFee}</div>
                            <div class="card-col"><span>⏰</span> ${place.bestTimeToVisit}</div>
                            <div class="card-col description">${place.description}</div>
                            <div class="card-col highlights">
                                <b>Highlights:</b> ${place.highlights.join(', ')}
                            </div>
                        </div>
                    `).join('');
                }
            } else if (section === 'hotels') {
                const hotels = await travelDetailsInstance.fetchHotels();
                if (!hotels.length) {
                    sectionContent.innerHTML = `<div style='text-align:center;width:100%;'>No hotels found.</div>`;
                } else {
                    sectionContent.innerHTML = hotels.map(hotel => `
                        <div class="scale-card">
                            <div class="card-col"><b><span class="hotel-name" data-hotel-name="${hotel.name}" style="cursor: pointer;">${hotel.name}</span></b></div>
                            <div class="card-col"><span>🏷️</span> ${hotel.category || 'N/A'}</div>
                            <div class="card-col"><span>⭐</span> ${hotel.rating || 'N/A'}</div>
                            <div class="card-col"><span>💰</span> ₹${hotel.price || 'N/A'}</div>
                            <div class="card-col description">${hotel.description || ''}</div>
                            <!-- Add other relevant hotel info here if available, e.g., address, amenities -->
                            <!-- <button class="select-btn" data-id="${hotel.id}">Select</button> -->
                        </div>
                    `).join('');
                }
            } else if (section === 'food') {
                const food = await travelDetailsInstance.fetchFoodRecommendations();
                if (!food.length) {
                    sectionContent.innerHTML = `<div style='text-align:center;width:100%;'>No food recommendations found.</div>`;
                } else {
                    sectionContent.innerHTML = food.map(restaurant => `
                        <div class="food-card">
                            <h4><b class="food-name" data-food-name="${restaurant.name}" style="cursor: pointer;">${restaurant.name}</b></h4>
                            
                            <p>${restaurant.description || ''}</p>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error showing section:', error);
            sectionContent.innerHTML = `<div style='text-align:center;width:100%;'>Error loading ${section}. Please try again.</div>`;
        }
    }

    async function fetchAndDisplayPlaceImages(itemName) {
        console.log(`Fetching images for: ${itemName} from Wikipedia`);

        const wikipediaApiUrl = 'https://en.wikipedia.org/w/api.php';
        const params = {
            action: 'query',
            format: 'json',
            titles: itemName,
            prop: 'images',
            imlimit: '10', // Get up to 10 images
            origin: '*'
        };

        const url = new URL(wikipediaApiUrl);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Wikipedia API response:', data);

            const pages = data.query.pages;
            const imageFilenames = [];

            // Extract image filenames
            for (const pageId in pages) {
                const page = pages[pageId];
                if (page.images) {
                    page.images.forEach(image => {
                        imageFilenames.push(image.title);
                    });
                }
            }

            console.log('Image filenames:', imageFilenames);

            if (imageFilenames.length > 0) {
                // Now fetch the full image info (including URLs)
                const imageInfoParams = {
                    action: 'query',
                    format: 'json',
                    titles: imageFilenames.join('|'), // Join filenames with | for batch request
                    prop: 'imageinfo',
                    iiprop: 'url',
                    origin: '*'
                };
                
                const imageInfoUrl = new URL(wikipediaApiUrl);
                Object.keys(imageInfoParams).forEach(key => imageInfoUrl.searchParams.append(key, imageInfoParams[key]));

                const imageInfoResponse = await fetch(imageInfoUrl);
                if (!imageInfoResponse.ok) {
                    throw new Error(`HTTP error! status: ${imageInfoResponse.status}`);
                }
                const imageInfoData = await imageInfoResponse.json();
                console.log('Wikipedia Image Info API response:', imageInfoData);

                const imageInfoPages = imageInfoData.query.pages;
                const imageUrls = [];

                for (const pageId in imageInfoPages) {
                    const page = imageInfoPages[pageId];
                    if (page.imageinfo) {
                        imageUrls.push(page.imageinfo[0].url);
                    }
                }

                console.log('Image URLs:', imageUrls);

                displayImagesInModal(itemName, imageUrls);

            } else {
                console.log('No images found for this item on Wikipedia.');
                const imageContainer = document.getElementById('imageContainer');
                imageContainer.innerHTML = '<p>No images found for this item.</p>';
                document.getElementById('imageModal').style.display = 'block';
            }

        } catch (error) {
            console.error('Error fetching images from Wikipedia:', error);
            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = '<p>Error loading images.</p>';
            document.getElementById('imageModal').style.display = 'block';
        }
    }

    function displayImagesInModal(itemName, imageUrls) {
        const modal = document.getElementById('imageModal');
        const imageContainer = document.getElementById('imageContainer');
        imageContainer.innerHTML = ''; // Clear previous content

        if (imageUrls.length > 0) {
            imageUrls.forEach(url => {
                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.alt = itemName;
                imageContainer.appendChild(imgElement);
            });
        } else {
            imageContainer.innerHTML = '<p>No images found for this item.</p>';
        }

        modal.style.display = 'block'; // Show the modal
    }

    // Get the modal and the close button
    const modal = document.getElementById('imageModal');
    const closeButton = document.querySelector('.close-button');

    // When the user clicks on (x), close the modal
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
