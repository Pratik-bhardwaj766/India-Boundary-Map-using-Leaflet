/**
 * Dynamic Leaflet Implementation
 * Change the COUNTRY_NAME variable to display different boundaries
 */

// --- Configuration ---
const TARGET_COUNTRY = 'India'; // Change this to 'Brazil', 'Canada', etc.
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// 1. Initialize Map
const map = L.map('map', {
    center: [20, 0], // Default global center
    zoom: 2,
    zoomControl: false 
});

L.control.zoom({ position: 'topright' }).addTo(map);

// 2. Base Layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

// 3. Styling Configuration
const defaultStyle = {
    color: "#D32F2F",
    weight: 3,
    fillColor: "#FFCC80",
    fillOpacity: 0.4
};

const highlightStyle = {
    weight: 6,
    color: "#B71C1C",
    fillOpacity: 0.6,
    fillColor: "#FFA726"
};

fetch(GEOJSON_URL)
    .then(response => response.json())
    .then(data => {
        
        const countryFeature = data.features.filter(f => f.properties.name === TARGET_COUNTRY);

        if (countryFeature.length === 0) {
            console.error(`Country "${TARGET_COUNTRY}" not found in GeoJSON data.`);
            document.getElementById('loader').innerText = "Country not found.";
            return;
        }

        const boundaryLayer = L.geoJSON(countryFeature, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`
                    <div class="custom-popup">
                        <h3 style="margin:0">Country: ${TARGET_COUNTRY}</h3>
                        <p>This is the official boundary of ${TARGET_COUNTRY} loaded via GeoJSON.</p>
                    </div>
                `);

                layer.on({
                    mouseover: (e) => {
                        e.target.setStyle(highlightStyle);
                        e.target.bringToFront();
                    },
                    mouseout: (e) => {
                        boundaryLayer.resetStyle(e.target);
                    },
                    click: (e) => {
                        map.flyTo(e.latlng, map.getZoom() + 1);
                        console.log(`${TARGET_COUNTRY} clicked at:`, e.latlng);
                    }
                });
            }
        }).addTo(map);

        // 5. Layer Control
        const baseMaps = { "Street": osm, "Satellite": satellite };
        const overlayMaps = {};
        overlayMaps[`${TARGET_COUNTRY} Boundary`] = boundaryLayer;

        L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

        // 6. Finalize View
        map.fitBounds(boundaryLayer.getBounds()); 
        document.getElementById('loader').style.display = 'none';
    })
    .catch(err => {
        console.error("Failed to load GeoJSON:", err);
        document.getElementById('loader').innerText = "Error loading map data.";
    });