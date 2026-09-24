
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

});

var googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: '&copy; Google'
});







  
var acudesStyle = {
  "color": "#0085e4",
  "weight": 2,
  "opacity": 0.65
};

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.Nome) {

      var popUp = `
        <strong>Nome: </strong>${feature.properties.Nome || 'Sem dados'} <br>
        <strong>Finalidade: </strong>${feature.properties.Finalidade || 'Sem dados'}<br>
        <strong>Municipio: </strong>${feature.properties.Municipio || 'Sem dados'}<br>
        <strong>Executor: </strong>${feature.properties.Executor || 'Sem dados'}<br>
      `
        layer.bindPopup(popUp);
    }
}


  var acudes = L.geoJSON(acudes,{
    style:acudesStyle,
    onEachFeature: onEachFeature
  });





  var map = L.map('map',
  { center: [-6.920973, -37.823181],
  zoom: 8,
  layers: [acudes, osm]
});


  var baseMaps = {
    "OpenStreetMap": osm,
    "Google satélite  " : googleSat
    
};



var overlayMaps = {
    "Açudes": acudes
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
