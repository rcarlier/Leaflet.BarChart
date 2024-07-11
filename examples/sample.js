// Create map
var map = L.map("map").setView({ lat: 48.90948, lng: 2.24679 }, 7);

// Add tileLayer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add chart... ;-)
L.barChart({
    lat: 48.90948,
    lng: 2.24679,
    values: [10, 20, 30, 40],
}).addTo(map);
