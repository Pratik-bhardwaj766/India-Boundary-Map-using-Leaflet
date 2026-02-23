// Basic map setup (centered on India)
const map = L.map('map').setView([22.9734, 78.6569], 5);

// Base layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
});

// Country styling (India highlighted as per requirements)
function getCountryStyle(feature) {
    const isIndia = feature.properties.name === 'India';

    if (isIndia) {
        return {
            color: 'red',       // bold red border
            weight: 4,          // 3–4px equivalent
            fillColor: '#ffcc99',
            fillOpacity: 0.5,
        };
    }

    return {
        color: 'grey',         // thin grey borders
        weight: 1,
        fillColor: '#f0f0f0',
        fillOpacity: 0.8,
    };
}

// Load GeoJSON dynamically (source: provided URL)
const geojsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

let countriesLayer;

fetch(geojsonUrl)
    .then((response) => response.json())
    .then((data) => {
        countriesLayer = L.geoJSON(data, {
            style: getCountryStyle,
            onEachFeature: function (feature, layer) {
                // Optional popup showing country name
                const countryName = feature.properties.name || 'Unknown';
                layer.bindPopup(`<strong>Country: ${countryName}</strong>`);

                // Bonus: log coordinates on click
                layer.on('click', function (e) {
                    console.log('Clicked at:', e.latlng);
                });
            }
        }).addTo(map);

        // Layer control for base maps and overlays
        const baseMaps = {
            'OpenStreetMap': osm,
            Satellite: satellite,
        };

        const overlayMaps = {
            'World Countries': countriesLayer,
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);
    })
    .catch((error) => console.error('Error loading the GeoJSON:', error));