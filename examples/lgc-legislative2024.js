// Create a map centered at a specific location
var map = L.map("map").setView({ lat: 48.9082, lng: 2.24428 }, 16);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

async function loadData() {
    const response = await fetch("lgc-legislative2024.json");
    const lgc = await response.json();
    L.barChart(lgc, {
        title: "Législatives 2024",
        legend: [
            "Union de la gauche",
            "Rassemblement National",
            "Extrême gauche",
            "Les Républicains",
            "Reconquête !",
        ],
        unit: "%",
        colors: ["#EA537C", "#000957", "#F00000", "#4BA5E4", "#7B6047"],
        width: 0.0005,
        height: 0.001,
        unitDecimal: 1,
        unitZerofill: 2,
        showLegendInPopup: true,
    }).addTo(map);
}
loadData();

map.on("click", function (e) {
    var coord = e.latlng;
    console.log("lat: ", coord.lat.toFixed(5), " , lng: ", coord.lng.toFixed(5));
});
