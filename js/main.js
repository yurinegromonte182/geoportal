
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


  var pocos = L.geoJSON(pocos, {
    onEachFeature: function (feature, layer) {
    if (feature.properties) {
      const p = feature.properties;

      // Monta o conteúdo HTML do Popup com os dados da feição
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
          <h4 style="margin: 0 0 6px 0; color: #1e3a8a;">Poço #${p.fid}</h4>
          <b>Município:</b> ${p.municipio}<br>
          <b>Proprietário:</b> ${p.proprietario}<br>
          <b>Órgão:</b> ${p.orgao}<br>
          <b>Data de Perfuração:</b> ${p.data_perfuracao}<br>
          <b>Profundidade:</b> ${p.profundidade} m<br>
          <b>Vazão:</b> ${p.q_m3h} m³/h<br>
          <b>Equipamento:</b> ${p.equipamento}<br>
          <b>Região:</b> ${p.microregiao} (${p.mesoregiao})
        </div>
      `;

      layer.bindPopup(popupContent);
  }
}
});

//adicionar o cluster
var pocosCluster = L.markerClusterGroup();
pocosCluster.addLayer(pocos);

var map = L.map('map', {
    center: [-7.171750, -36.798706],
    zoom: 8,
    layers: [acudes, osm]
});

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Satélite": googleSat,
};

//adicionar a camada de cluster em overlaylayers
var overlayMaps = {
    "Açudes": acudes,
    "Poços": pocosCluster,
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);



