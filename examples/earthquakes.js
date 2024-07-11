// Create a map centered at a specific location
var map = L.map("map").setView({ lat: 0, lng: 0 }, 2);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

async function loadData() {
    const response = await fetch("earthquakes.json");
    const data = await response.json();
    L.barChart(data, {
        title: "Earthquakes, 1900-2000",
        subTitle: "57.460 Significant Earthquakes",
        colors: ["#FF0000"],
        width: 1.5,
        height: 0, // not used
        zoom: 0.5, // real values * zoom
        showLegendInPopup: false,
        showLegend: false,
    }).addTo(map);
}
loadData();

map.on("click", function (e) {
    var coord = e.latlng;
    console.log("lat: ", coord.lat.toFixed(5), " , lng: ", coord.lng.toFixed(5));
});
