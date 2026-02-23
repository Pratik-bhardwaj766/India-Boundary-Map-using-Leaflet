/**
 * Advanced Leaflet Implementation
 * Features: Auto-fit, Dynamic Styling, Layer Toggling, and Event Handling
 */

// 1. Initialize Map
const map = L.map('map', {
    center: [22.9734, 78.6569],
    zoom: 5,
    zoomControl: false // Moved to top-right for cleaner UI
});

// Add Zoom Control to Top Right
L.control.zoom({ position: 'topright' }).addTo(map);

// 2. Base Layers (Requirement 4)
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap'
});

// 3. Styling Configuration (Requirement 2)
const indiaStyle = {
    color: "#D32F2F",      // Deep Red Border
    weight: 3,
    fillColor: "#FFCC80",  // Soft Orange Fill
    fillOpacity: 0.4,
    dashArray: ''          // Can be '5, 5' for dashed lines
};

const highlightStyle = {
    weight: 6,
    color: "#B71C1C",
    fillOpacity: 0.6,
    fillColor: "#FFA726"
};

// 4. Fetch GeoJSON Data 
const geojsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        // Filter: Extract India from the global dataset
        const indiaFeature = data.features.filter(f => f.properties.name === "India");

        const indiaLayer = L.geoJSON(indiaFeature, {
            style: indiaStyle,
            onEachFeature: (feature, layer) => {
                // Click Popup (Requirement 3)
                layer.bindPopup(`
                    <div class="custom-popup">
                        <h3 style="margin:0">Country: India</h3>
                        <p>This is the official boundary loaded via GeoJSON.</p>
                        <small>Coordinates Logged to Console</small>
                    </div>
                `);

                // Interactivity (Requirement 3 & Bonus)
                layer.on({
                    mouseover: (e) => {
                        const l = e.target;
                        l.setStyle(highlightStyle);
                        l.bringToFront();
                    },
                    mouseout: (e) => {
                        indiaLayer.resetStyle(e.target);
                    },
                    click: (e) => {
                        map.flyTo(e.latlng, 6); // Smooth zoom on click
                        console.log("Location Clicked:", e.latlng);
                    }
                });
            }
        }).addTo(map);

        // 5. Layer Control Setup (Requirement 4)
        const baseMaps = {
            "Standard Street": osm,
            "Satellite Imagery": satellite,
            "Terrain Map": terrain
        };

        const overlayMaps = {
            "<b>India Boundary</b>": indiaLayer
        };

        L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

        // 6. Bonus Features
        map.fitBounds(indiaLayer.getBounds()); // Auto-fit to India
        document.getElementById('loader').style.display = 'none'; // Hide loader
    })
    .catch(err => {
        console.error("Failed to load GeoJSON:", err);
        document.getElementById('loader').innerText = "Error loading map data.";
    });