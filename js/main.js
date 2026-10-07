/* =========================================
   GeoPortal PB — Main JavaScript
   ========================================= */

// ==========================
// 1. Base Layers (Tile Layers)
// ==========================
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  attribution: '&copy; Google'
});

var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  attribution: '&copy; Google'
});

// ==========================
// 2. Column Rename Maps (Friendly Names)
// ==========================
var columnMaps = {
  acudes: {
    'OBJECTID':   'ID',
    'Nome':       'Nome do Açude',
    'Executor':   'Executor',
    'Propriet':   'Proprietário',
    'Municipio':  'Município',
    'Microrreg':  'Microrregião',
    'Mesorreg':   'Mesorregião',
    'Finalidade': 'Finalidade',
    'Capacidade': 'Capacidade (m³)',
    'A_Espelho':  'Área do Espelho (m²)',
    'Alt_Barrag': 'Altura Barragem (m)',
    'Curso_Bar':  "Curso d'Água",
    'Ord_Curso':  'Ordem do Curso'
  },
  pocos: {
    'fid':             'ID',
    'proprietario':    'Proprietário',
    'orgao':           'Órgão',
    'data_perfuracao': 'Data de Perfuração',
    'profundidade':    'Profundidade (m)',
    'q_m3h':           'Vazão (m³/h)',
    'equipamento':     'Equipamento',
    'municipio':       'Município',
    'microregiao':     'Microrregião',
    'mesoregiao':      'Mesorregião'
  },
  rios: {
    'fid':    'ID',
    'nome':   'Nome do Rio',
    'ordem':  'Ordem Fluvial'
  },
  municipios: {
    'fid':              'ID',
    'nome':             'Nome do Município',
    'cod_ibge_m':       'Código IBGE',
    'microregiao':      'Microrregião',
    'mesoregiao':       'Mesorregião',
    'populacao_rural':  'Pop. Rural',
    'populacao_urbana': 'Pop. Urbana',
    'populacao_total':  'Pop. Total'
  }
};

// ==========================
// 3. Vector Styles
// ==========================
var canvasRenderer = L.canvas({ padding: 0.5 });

var acudesStyle = {
  color: '#0085e4',
  weight: 2,
  opacity: 0.7,
  fillColor: '#60b8ff',
  fillOpacity: 0.35
};

var municipiosStyle = {
  color: '#6b21a8',
  weight: 1.5,
  opacity: 0.7,
  fillColor: '#c084fc',
  fillOpacity: 0.08,
  dashArray: '5,5'
};

function riosStyle(feature) {
  var ordem = (feature && feature.properties && feature.properties.ordem) || '';
  var weight = 1;
  var opacity = 0.6;
  if (ordem.indexOf('1') >= 0) { weight = 0.8; opacity = 0.45; }
  else if (ordem.indexOf('2') >= 0) { weight = 1.3; opacity = 0.55; }
  else if (ordem.indexOf('3') >= 0) { weight = 1.8; opacity = 0.65; }
  else if (ordem.indexOf('4') >= 0) { weight = 2.5; opacity = 0.75; }
  else if (ordem.indexOf('5') >= 0) { weight = 3.2; opacity = 0.85; }
  else { weight = 1; opacity = 0.5; }
  return {
    color: '#0284c7',
    weight: weight,
    opacity: opacity
  };
}

// ==========================
// 4. Popups & Utilities
// ==========================
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '—';
  var num = parseFloat(String(val).replace(',', '.'));
  if (isNaN(num)) return val;
  return num.toLocaleString('pt-BR');
}

function popupAcude(feature, layer) {
  if (feature.properties) {
    var p = feature.properties;
    var html = '<div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.6">' +
      '<h4 style="margin:0 0 6px;color:#1e3a8a;border-bottom:2px solid #e2e8f0;padding-bottom:4px">' +
        '<i class="fas fa-water" style="margin-right:4px"></i>' + (p.Nome || 'Sem nome') +
      '</h4>' +
      '<b>Município:</b> ' + (p.Municipio || '—') + '<br>' +
      '<b>Finalidade:</b> ' + (p.Finalidade || '—') + '<br>' +
      '<b>Executor:</b> ' + (p.Executor || '—') + '<br>' +
      '<b>Proprietário:</b> ' + (p.Propriet || '—') + '<br>' +
      '<b>Capacidade:</b> ' + formatNumber(p.Capacidade) + ' m³<br>' +
      "<b>Curso d'Água:</b> " + (p.Curso_Bar || '—') +
      '</div>';
    layer.bindPopup(html);
  }
}

function popupPoco(feature, layer) {
  if (feature.properties) {
    var p = feature.properties;
    var html = '<div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.6">' +
      '<h4 style="margin:0 0 6px;color:#1e3a8a;border-bottom:2px solid #e2e8f0;padding-bottom:4px">' +
        '<i class="fas fa-circle-dot" style="margin-right:4px"></i>Poço #' + p.fid +
      '</h4>' +
      '<b>Município:</b> ' + (p.municipio || '—') + '<br>' +
      '<b>Proprietário:</b> ' + (p.proprietario || '—') + '<br>' +
      '<b>Órgão:</b> ' + (p.orgao || '—') + '<br>' +
      '<b>Data de Perfuração:</b> ' + (p.data_perfuracao || '—') + '<br>' +
      '<b>Profundidade:</b> ' + (p.profundidade || '—') + ' m<br>' +
      '<b>Vazão:</b> ' + (p.q_m3h || '—') + ' m³/h<br>' +
      '<b>Equipamento:</b> ' + (p.equipamento || '—') + '<br>' +
      '<b>Região:</b> ' + (p.microregiao || '—') + ' (' + (p.mesoregiao || '—') + ')' +
      '</div>';
    layer.bindPopup(html);
  }
}

function popupRio(feature, layer) {
  if (feature.properties) {
    var p = feature.properties;
    var nome = p.nome || 'Curso sem denominação';
    var html = '<div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.6">' +
      '<h4 style="margin:0 0 6px;color:#0284c7;border-bottom:2px solid #e2e8f0;padding-bottom:4px">' +
        '<i class="fas fa-water" style="margin-right:4px"></i>' + nome +
      '</h4>' +
      '<b>Ordem Fluvial:</b> ' + (p.ordem || '—') + '<br>' +
      '<b>ID:</b> ' + (p.fid || '—') +
      '</div>';
    layer.bindPopup(html);
  }
}

function popupMunicipio(feature, layer) {
  if (feature.properties) {
    var p = feature.properties;
    var html = '<div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.6">' +
      '<h4 style="margin:0 0 6px;color:#6b21a8;border-bottom:2px solid #e2e8f0;padding-bottom:4px">' +
        '<i class="fas fa-city" style="margin-right:4px"></i>' + (p.nome || 'Sem nome') +
      '</h4>' +
      '<b>Código IBGE:</b> ' + (p.cod_ibge_m || '—') + '<br>' +
      '<b>Microrregião:</b> ' + (p.microregiao || '—') + '<br>' +
      '<b>Mesorregião:</b> ' + (p.mesoregiao || '—') + '<br>' +
      '<b>Pop. Rural:</b> ' + formatNumber(p.populacao_rural) + '<br>' +
      '<b>Pop. Urbana:</b> ' + formatNumber(p.populacao_urbana) + '<br>' +
      '<b>Pop. Total:</b> ' + formatNumber(p.populacao_total) +
      '</div>';
    layer.bindPopup(html);
  }
}

// ==========================
// 5. Features Storage for Table
// ==========================
var layerFeatures = {
  acudes: [],
  pocos: [],
  rios: [],
  municipios: []
};

function storeFeatureLayer(key, feature, layer) {
  if (!layerFeatures[key]) layerFeatures[key] = [];
  layerFeatures[key].push({ feature: feature, layer: layer });
}

// ==========================
// 6. Map Initialization
// ==========================
var map = L.map('map', {
  center: [-7.171750, -36.798706],
  zoom: 8,
  layers: [osm],
  zoomControl: true
});

map.zoomControl.setPosition('topright');
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

// Create GeoJSON layer holders with GPU Canvas renderer
var acudesLayer = L.geoJSON(null, {
  style: acudesStyle,
  renderer: canvasRenderer,
  onEachFeature: function(feature, layer) {
    popupAcude(feature, layer);
    storeFeatureLayer('acudes', feature, layer);
  }
});

var municipiosLayer = L.geoJSON(null, {
  style: municipiosStyle,
  renderer: canvasRenderer,
  onEachFeature: function(feature, layer) {
    popupMunicipio(feature, layer);
    storeFeatureLayer('municipios', feature, layer);
  }
});

var pocosLayer = L.geoJSON(null, {
  onEachFeature: function(feature, layer) {
    popupPoco(feature, layer);
    storeFeatureLayer('pocos', feature, layer);
  }
});
var pocosCluster = L.markerClusterGroup();

var riosLayer = L.geoJSON(null, {
  style: riosStyle,
  renderer: canvasRenderer,
  onEachFeature: function(feature, layer) {
    popupRio(feature, layer);
    storeFeatureLayer('rios', feature, layer);
  }
});

// Add default layers to map
map.addLayer(municipiosLayer);
map.addLayer(acudesLayer);

var baseMaps = {
  'OpenStreetMap': osm,
  'Google Satélite': googleSat,
  'Google Híbrido': googleHybrid
};

var overlayMaps = {
  '<i class="fas fa-city" style="color:#6b21a8"></i> Municípios': municipiosLayer,
  '<i class="fas fa-water" style="color:#0085e4"></i> Açudes': acudesLayer,
  '<i class="fas fa-circle-dot" style="color:#ef4444"></i> Poços': pocosCluster,
  '<i class="fas fa-water" style="color:#0284c7"></i> Rios / Drenagem': riosLayer
};

var layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: true }).addTo(map);

// ==========================
// 7. Robust Layer Data Loader
// ==========================
/**
 * Loads GeoJSON data from global variable or fetch fallbacks.
 * Never throws ReferenceError and gracefully falls back to multiple URLs.
 */
function loadLayerData(layerObj, globalVarName, fetchUrls, onLoaded) {
  // 1. Check if global variable is already defined
  if (typeof window[globalVarName] !== 'undefined' && window[globalVarName]) {
    try {
      layerObj.addData(window[globalVarName]);
      if (onLoaded) onLoaded(window[globalVarName]);
      return Promise.resolve(window[globalVarName]);
    } catch (err) {
      console.warn('Erro ao carregar dados da variável global ' + globalVarName + ':', err);
    }
  }

  // 2. Fallback to fetch from URLs
  if (!Array.isArray(fetchUrls)) fetchUrls = [fetchUrls];

  function tryFetch(idx) {
    if (idx >= fetchUrls.length) {
      console.warn('Não foi possível carregar a camada [' + globalVarName + '] através dos caminhos especificados.');
      return Promise.resolve(null);
    }
    var targetUrl = fetchUrls[idx];
    return fetch(targetUrl)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        window[globalVarName] = data;
        layerObj.addData(data);
        if (onLoaded) onLoaded(data);
        return data;
      })
      .catch(function(err) {
        // Try next fallback URL
        return tryFetch(idx + 1);
      });
  }

  return tryFetch(0);
}

// Load Açudes
loadLayerData(acudesLayer, 'acudes', ['dados/acudes.js', 'dados/acude_aesa.geojson'], function() {
  if (layerSelect.value === 'acudes') populateTable('acudes');
  checkInitialLoading();
});

// Load Poços
loadLayerData(pocosLayer, 'pocos', ['dados/pocos_pb.js', 'dados/pocos_pb.geojson'], function() {
  pocosCluster.addLayer(pocosLayer);
  if (layerSelect.value === 'pocos') populateTable('pocos');
  checkInitialLoading();
});

// Load Municípios
loadLayerData(municipiosLayer, 'municipios', ['dados/municipios.js', 'dados/municipios_aesa.geojson'], function() {
  if (layerSelect.value === 'municipios') populateTable('municipios');
  checkInitialLoading();
});

// Load Rios / Drenagem (assíncrono, suporta tanto o JSON puro quanto possíveis arquivos .js)
loadLayerData(riosLayer, 'rios', [
  'dados/rios_aesa.geojson.json',
  'dados/rios.js',
  'dados/rios_aesa.geojson'
], function() {
  console.log('Camada de drenagem (rios) carregada com sucesso (' + (layerFeatures.rios ? layerFeatures.rios.length : 0) + ' feições).');
  if (layerSelect.value === 'rios') populateTable('rios');
});

// ==========================
// 8. Hide Loading Overlay
// ==========================
var loadingOverlay = document.getElementById('loading-overlay');
var loadedCount = 0;

function checkInitialLoading() {
  loadedCount++;
  if (loadedCount >= 2) {
    hideLoading();
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    setTimeout(function() { loadingOverlay.style.display = 'none'; }, 500);
  }
}

// Timeout de segurança para ocultar overlay mesmo se a conexão for lenta
setTimeout(hideLoading, 3000);

// ==========================
// 9. Navbar Toggle (Mobile)
// ==========================
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    var icon = navToggle.querySelector('i');
    if (navLinks.classList.contains('open')) {
      icon.className = 'fas fa-times';
    } else {
      icon.className = 'fas fa-bars';
    }
  });

  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
      navToggle.querySelector('i').className = 'fas fa-bars';
    });
  });
}

// ==========================
// 10. Attribute Table
// ==========================
var tablePanel = document.getElementById('tablePanel');
var tableToggle = document.getElementById('tableToggle');
var tableClose = document.getElementById('tableClose');
var layerSelect = document.getElementById('layerSelect');
var attrTable = document.getElementById('attrTable');
var tableEmpty = document.getElementById('tableEmpty');
var selectedHighlight = null;

// Toggle table panel
tableToggle.addEventListener('click', function() {
  tablePanel.classList.toggle('collapsed');
  if (!tablePanel.classList.contains('collapsed')) {
    populateTable(layerSelect.value);
    setTimeout(function() { map.invalidateSize(); }, 400);
  }
});

tableClose.addEventListener('click', function() {
  tablePanel.classList.add('collapsed');
  clearHighlight();
  setTimeout(function() { map.invalidateSize(); }, 400);
});

// Layer select change
layerSelect.addEventListener('change', function() {
  populateTable(this.value);
  clearHighlight();
});

function populateTable(layerKey) {
  var thead = attrTable.querySelector('thead tr');
  var tbody = attrTable.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  var features = layerFeatures[layerKey];
  var colMap = columnMaps[layerKey];

  if (!features || features.length === 0 || !colMap) {
    attrTable.style.display = 'none';
    tableEmpty.classList.add('visible');
    tableEmpty.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Carregando dados da camada...</span>';
    return;
  }

  attrTable.style.display = '';
  tableEmpty.classList.remove('visible');

  var keys = Object.keys(colMap);

  // Header
  var headerRow = '';
  keys.forEach(function(key) {
    headerRow += '<th>' + colMap[key] + '</th>';
  });
  thead.innerHTML = headerRow;

  // Limite de 500 linhas para garantir alta performance e fluidez
  var maxRows = Math.min(features.length, 500);
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < maxRows; i++) {
    var tr = document.createElement('tr');
    tr.dataset.index = i;
    tr.dataset.layer = layerKey;

    var props = features[i].feature.properties || {};
    keys.forEach(function(key) {
      var td = document.createElement('td');
      var val = props[key];
      if (val === null || val === undefined || val === '') {
        td.textContent = '—';
        td.style.color = '#94a3b8';
      } else {
        td.textContent = val;
      }
      tr.appendChild(td);
    });

    tr.addEventListener('click', function() {
      var idx = parseInt(this.dataset.index);
      var lk = this.dataset.layer;
      onRowClick(lk, idx, this);
    });

    fragment.appendChild(tr);
  }
  tbody.appendChild(fragment);
}

function onRowClick(layerKey, index, rowElement) {
  var data = layerFeatures[layerKey];
  if (!data || !data[index]) return;

  var prev = attrTable.querySelector('tbody tr.selected');
  if (prev) prev.classList.remove('selected');
  rowElement.classList.add('selected');

  var layer = data[index].layer;
  clearHighlight();

  // Zoom na feição
  if (layer.getBounds) {
    map.fitBounds(layer.getBounds(), { maxZoom: 14, padding: [30, 30] });
  } else if (layer.getLatLng) {
    map.setView(layer.getLatLng(), 14);
  }

  // Garante que a camada está visível no mapa
  ensureLayerVisible(layerKey);

  // Abre o popup
  if (layer.openPopup) {
    setTimeout(function() { layer.openPopup(); }, 300);
  }

  highlightFeature(layer);
}

function ensureLayerVisible(layerKey) {
  var overlayMap = {
    'acudes': acudesLayer,
    'pocos': pocosCluster,
    'rios': riosLayer,
    'municipios': municipiosLayer
  };
  var targetLayer = overlayMap[layerKey];
  if (targetLayer && !map.hasLayer(targetLayer)) {
    map.addLayer(targetLayer);
  }
}

function highlightFeature(layer) {
  clearHighlight();
  if (layer.setStyle) {
    selectedHighlight = layer;
    layer.setStyle({
      weight: 4,
      color: '#eab308',
      fillColor: '#fef3c7',
      fillOpacity: 0.5
    });
    if (layer.bringToFront) layer.bringToFront();
  } else if (layer._icon) {
    selectedHighlight = layer;
    L.DomUtil.addClass(layer._icon, 'leaflet-marker-highlight');
  }
}

function clearHighlight() {
  if (selectedHighlight) {
    if (selectedHighlight.setStyle) {
      if (acudesLayer.hasLayer(selectedHighlight)) {
        selectedHighlight.setStyle(acudesStyle);
      } else if (municipiosLayer.hasLayer(selectedHighlight)) {
        selectedHighlight.setStyle(municipiosStyle);
      } else if (riosLayer.hasLayer(selectedHighlight)) {
        selectedHighlight.setStyle(riosStyle(selectedHighlight.feature));
      }
    } else if (selectedHighlight._icon) {
      L.DomUtil.removeClass(selectedHighlight._icon, 'leaflet-marker-highlight');
    }
    selectedHighlight = null;
  }
}

// ==========================
// 11. Initial Table Call
// ==========================
populateTable('acudes');

// Fechar menu mobile ao clicar no mapa
map.on('click', function() {
  if (navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.querySelector('i').className = 'fas fa-bars';
  }
});
