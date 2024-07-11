L.BarChart = L.LayerGroup.extend({
    initialize: function (data, options) {
        /**
         * Verify data
         */
        // data required !
        if (data === null) {
            throw new Error("Invalid data");
        }
        // is array or object
        if (!Array.isArray(data)) {
            // but need to be an array...
            if (typeof data === "object") {
                data = [data];
            } else {
                throw new Error("Data must be an array or an object");
            }
        }
        // check first point...
        let numValues;
        if (data[0] && data[0].values) {
            numValues = data[0].values.length;
        } else {
            throw new Error("Invalid data: all data point must have values");
        }
        for (let i = 0; i < data.length; i++) {
            let point = data[i];
            let values = point.values;
            // values are required
            if (!Array.isArray(values) || values.length === 0) {
                console.log(point);
                throw new Error("Invalid values for data point ");
            }
            // same num. of values
            if (values.length !== numValues) {
                console.log(point);
                throw new Error("Different number of values ");
            }
            // label is not object or array
            if (point.label !== undefined) {
                if (Array.isArray(point.label) || typeof point.label === "object") {
                    console.log(point);
                    throw new Error("Invalid label");
                }
            }
            // coords are valid
            if (point.lat === undefined || (point.lng === undefined && point.lon === undefined)) {
                console.log(point);
                throw new Error("Missing latitude or longitude");
            }
            if (point.lon !== undefined) {
                point.lng = point.lon;
                delete point.lon;
            }
        }
        this._data = data;
        /**
         * Verify options
         */
        // colors are array
        if (options.colors !== undefined) {
            if (!Array.isArray(options.colors)) {
                console.log(options.colors);
                throw new Error("Invalid colors option");
            }
            if (options.colors.length >= 2) {
                let uniqueColors = new Set(options.colors);
                if (uniqueColors.size !== options.colors.length) {
                    console.log(options.colors);
                    throw new Error("Colors option contains duplicate values");
                }
            }
        }
        // width, height, zoom need to be numbers
        if (options.width !== undefined && typeof options.width !== "number") {
            console.log(options.width);
            throw new Error("Invalid width option");
        }
        if (options.height !== undefined && typeof options.height !== "number") {
            console.log(options.height);
            throw new Error("Invalid height option");
        }
        if (options.zoom !== undefined && typeof options.zoom !== "number") {
            console.log(options.zoom);
            throw new Error("Invalid zoom option");
        }
        // fillOpacity too...
        if (options.fillOpacity !== undefined && typeof options.fillOpacity !== "number") {
            console.log(options.fillOpacity);
            throw new Error("Invalid fillOpacity option");
        }
        // formating option too
        if (options.unitDecimal !== undefined && typeof options.unitDecimal !== "number") {
            console.log(options.unitDecimal);
            throw new Error("Invalid unitDecimal option");
        }
        if (options.unitZerofill !== undefined && typeof options.unitZerofill !== "number") {
            console.log(options.unitZerofill);
            throw new Error("Invalid unitZerofill option");
        }
        // legend need to be an array, same size as points values
        if (options.legend !== undefined) {
            if (!Array.isArray(options.legend) || options.legend.length !== numValues) {
                console.log(options.legend);
                throw new Error("Invalid legend option");
            }
        }
        // legend is in good position
        if (options.legendPos !== undefined) {
            let validOpt = ["bottomleft", "bottomright", "topleft", "topright"];
            if (!validOpt.includes(options.legendPos)) {
                console.log(options.legendPos);
                console.log("Must be:", validOpt);
                throw new Error("Invalid legendPos option");
            }
        }
        if (options.showLegend !== undefined && typeof options.showLegend !== "boolean") {
            console.log(options.showLegend);
            throw new Error("Invalid showLegend option");
        }
        if (
            options.showLegendInPopup !== undefined &&
            typeof options.showLegendInPopup !== "boolean"
        ) {
            console.log(options.showLegendInPopup);
            throw new Error("Invalid showLegendInPopup option");
        }

        // unitPos is in good value
        if (options.unitPos !== undefined) {
            let validOpt = ["after", "before"];
            if (!validOpt.includes(options.unitPos)) {
                console.log(options.unitPos);
                console.log("Must be:", validOpt);
                throw new Error("Invalid unitPos option");
            }
        }

        // title, subTitle, unit is not obj or array
        if (options.title !== undefined) {
            if (Array.isArray(options.title) || typeof options.title === "object") {
                console.log(options.title);
                throw new Error("Invalid title option");
            }
        }
        if (options.subTitle !== undefined) {
            if (Array.isArray(options.subTitle) || typeof options.subTitle === "object") {
                console.log(options.subTitle);
                throw new Error("Invalid subTitle option");
            }
        }
        if (options.unit !== undefined) {
            if (Array.isArray(options.unit) || typeof options.unit === "object") {
                console.log(options.unit);
                throw new Error("Invalid unit option");
            }
        }

        this._opt = options || {};
        // default values...
        this._opt.width = this._opt.width || 0.3;
        this._opt.height = this._opt.height || 0.5;
        this._opt.zoom = this._opt.zoom || null;
        this._opt.fillOpacity = this._opt.fillOpacity || 0.75;
        this._opt.colors = this._opt.colors || [
            "#1F77B4",
            "#FF7F0E",
            "#2CA02C",
            "#D62728",
            "#9467BD",
            "#8C564B",
            "#E377C2",
            "#7F7F7F",
            "#BCBD22",
            "#17BECF",
        ];
        // loop colors if there are not enough
        while (this._opt.colors.length < numValues) {
            this._opt.colors = this._opt.colors.concat(this._opt.colors);
        }
        this._opt.legend = this._opt.legend || Array(numValues).fill("");
        this._opt.legendPos = this._opt.legendPos || "topright";
        this._opt.title = this._opt.title || "";
        this._opt.subTitle = this._opt.subTitle || "";

        if (this._opt.showLegend == undefined) this._opt.showLegend = true;
        if (this._opt.showLegendInPopup == undefined) this._opt.showLegendInPopup = false;

        this._opt.unit = this._opt.unit || "";
        this._opt.unitPos = this._opt.unitPos || "after";
        this._opt.unitDecimal = this._opt.unitDecimal || null;
        this._opt.unitZerofill = this._opt.unitZerofill || null;
        L.LayerGroup.prototype.initialize.call(this);
    },

    onAdd: function (map) {
        this._map = map;
        this._drawHistograms();
        this._addLegend();
        L.LayerGroup.prototype.onAdd.call(this, map);
    },

    _formatNumber: function (number, options = {}) {
        const { unitDecimal = null, unitZerofill = null } = options;
        const sep = (1.1).toLocaleString().substring(1, 2);
        let [integerPart, fractionalPart] = number.toString().split(".");
        if (unitZerofill !== null) {
            integerPart = integerPart.padStart(unitZerofill, "0");
        }
        if (unitDecimal !== null) {
            if (fractionalPart) {
                fractionalPart = fractionalPart.slice(0, unitDecimal).padEnd(unitDecimal, "0");
            } else {
                fractionalPart = "0".repeat(unitDecimal);
            }
        }
        let formattedNumber = integerPart;
        if (fractionalPart !== undefined) {
            formattedNumber += sep + fractionalPart;
        }
        return formattedNumber;
    },

    _drawHistograms: function () {
        let data = this._data;
        let options = this._opt;
        for (let i = 0; i < data.length; i++) {
            let totalBarHeight = 0;
            let point = data[i];
            let values = point.values;
            let currentLat = point.lat;
            let popupContent = "";
            if (point.label) popupContent += `<strong>${point.label}</strong><br>`;

            for (let j = 0; j < values.length; j++) {
                let barHeight;
                if (options.zoom !== null) {
                    barHeight = values[j] * options.zoom;
                } else {
                    barHeight = (values[j] / 100) * options.height;
                }
                L.rectangle(
                    [
                        [currentLat, point.lng],
                        [currentLat + barHeight, point.lng + options.width],
                    ],
                    {
                        color: options.colors[j],
                        weight: 0.5,
                        color: options.colors[j],
                        fillColor: options.colors[j],
                        fillOpacity: options.fillOpacity,
                    }
                ).addTo(this);
                totalBarHeight += barHeight;
                currentLat += barHeight;

                let value = values[values.length - j - 1];

                value = this._formatNumber(value, options);

                let style = `background-color: ${options.colors[values.length - j - 1]}`;
                let content = ``;
                if (options.unitPos == "before") {
                    content = ` ${options.unit} ${value}`;
                } else {
                    content = ` ${value} ${options.unit}`;
                }

                if (options.showLegendInPopup === true) {
                    content += `&nbsp;<small>${options.legend[values.length - j - 1]}</small>`;
                }

                popupContent += `<div class="lBarLigne">
                    <span class="lBarSquare" style="${style}"></span>
                    ${content}
                </div>`;
            }
            let transparentRectangle = L.rectangle(
                [
                    [point.lat, point.lng],
                    [point.lat + totalBarHeight, point.lng + options.width],
                ],
                {
                    weight: 1,
                    color: "#000",
                    fillColor: "transparent",
                }
            ).addTo(this);

            transparentRectangle.on("click", function (e) {
                L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(this._map);
            });
        }
    },

    _addLegend: function () {
        let options = this._opt;
        if (options.showLegend !== true && options.title === "" && options.subTitle === "") {
            return null;
        }

        let legend = options.legend;
        let colors = options.colors;
        let legendPos = options.legendPos;
        let legendControl = L.control({ position: legendPos });
        legendControl.onAdd = function (map) {
            let div = L.DomUtil.create("div", "info lBarLegend");
            div.innerHTML = ``;
            if (options.title !== "") {
                div.innerHTML += `<div class="lBarTitle">${options.title}</div>`;
            }
            if (options.subTitle !== "") {
                div.innerHTML += `<div class="lBarSubTitle">${options.subTitle}</div>`;
            }
            if (options.showLegend === true) {
                for (let i = legend.length - 1; i >= 0; i--) {
                    div.innerHTML += `<div class="lBarLigne">
                <span class="lBarSquare" style="background-color: ${colors[i]}; "></span>
                ${legend[i]}
                </div>`;
                }
            }
            return div;
        };

        legendControl.addTo(this._map);
    },
});

L.barChart = function (data, options = {}) {
    return new L.BarChart(data, options);
};
