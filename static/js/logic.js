// Retrieve all earthquake geojson data in the last 7 days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(response){

    //console.log(response);
    var markerGroup = createFeatures(response.features);
    createMaps(markerGroup);

});

function createFeatures(data){
    // Creates features and returns layer Group objects (of markers)
 
    var markers = [];
    var Layer, avg = d3.mean(data, feature=>feature.properties.mag)


   data.forEach(function(feature) {
        
        Layer = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {

            color: "black",
            weight: 0.5,
            fillColor: chooseColor(feature.properties.mag),
            fillOpacity: 0.75,

        }).bindPopup(`<h3>@${feature.properties.place}</h3><hr>
        <p>On ${new Date(feature.properties.time)}</p>
        <p>Coordinates: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}</p>
        <p> Magnitude: ${feature.properties.mag} ${feature.properties.magType}</p>
        ${feature.properties.felt?"<p> Felt: "+feature.properties.felt+" "+feature.properties.magType:""+"  </p>"}
        <p> <a href='${feature.properties.url}'>More information</a></p>
        `);
        // markers.addLayer(Layer);
        Layer.setRadius(Math.round(30000/avg)*Math.round(feature.properties.mag));
        markers.push(Layer);
    })


    function chooseColor(mag){

        if (mag > 5.0) {
            return "darkred";
        }
        else if (mag > 4.0) {
            return "red";
        }
        else if (mag > 3.0) {
            return "darkorange";
        }
        else if (mag > 2.0) {
            return "orange";
        }
        else if (mag > 1.0) {
            return "yellow";
        }
        else {
            return "lightgreen";
        }

    }
    return L.layerGroup(markers);

}

function createMaps(earthQuakes){
//Create map after receiving overlay layer (layer Group Object)


    //Create a light tileObject using mapbox tile
    var light_tile = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
    });


    //Create a dark tileObject using mapbox tile
    var dark_tile = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Light Map": light_tile,
      "Dark Map": dark_tile,
    };

    //Create overlay layer with earthquake layer
    var overlay = {
      "earthquakes": earthQuakes
    };


    // Create a new map
    var map = L.map("map", {
        //center : [39.8283, -98.5795],
        center: [29.48, -37.62],
        zoom : 3,
        layers: [light_tile, earthQuakes]
    });

    // Create a layer control containing our baseMaps
    L.control.layers(baseMaps, overlay, {
      collapsed: true
    }).addTo(map);


    //Add legend
    // Add legend (don't forget to add the CSS from index.html)
    var legend = L.control({ position: 'bottomright'})
    // console.log(legend);
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend')
        
        var colors = ["lightgreen", "yellow", "orange", "darkorange", "red", "darkred"];
        var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
        var labels = [];
        // Add ranges

        limits.forEach(function (limit, index) {
        labels.push(`<li><div class="bar" style="background-color: ${colors[index]}"></div><div class="legend-label">${limit}</div></li>`)})

        div.innerHTML += '<ul>' + labels.join('') + '</ul>'
        return div
    }
    legend.addTo(map);

}