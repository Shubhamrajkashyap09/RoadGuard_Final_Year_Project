var map, vectorSource, vectorLayer, redZoneFeature, carIconFeature, alertSymbolFeature;

// Create a vector source and layer for overlays
vectorSource = new ol.source.Vector();
vectorLayer = new ol.layer.Vector({
  source: vectorSource,
});

// Create the map
map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    vectorLayer, // Add the vector layer for overlays
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([77.704211, 13.242482]), // Coordinates for the location
    zoom: 15,
  }),
});

// Function to add a circular red zone around a specific location
function addRedZone(centerCoordinates, radius) {
  redZoneFeature = new ol.Feature({
    geometry: new ol.geom.Circle(centerCoordinates, radius),
  });

  redZoneFeature.setStyle(
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 0, 0, 0.5)', // Red with 50% opacity
      }),
      stroke: new ol.style.Stroke({
        color: 'red',
        width: 2,
      }),
    })
  );

  vectorSource.addFeature(redZoneFeature);

  // Listen for click events on the red zone
  redZoneFeature.on('click', function (event) {
    // Add the alert symbol when the red zone is clicked
    addAlertSymbol(event.coordinate);
  });
}

// Function to add a draggable car icon
function addCarIcon(coordinates) {
  carIconFeature = new ol.Feature({
    geometry: new ol.geom.Point(coordinates),
  });

  carIconFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.75,
        src: 'car-icon.png', // Path to your car icon image
        scale: 0.2, // Adjust the scale as needed (increased size)
      }),
    })
  );

  vectorSource.addFeature(carIconFeature);

  // Make the car icon draggable
  var dragInteraction = new ol.interaction.Pointer({
    handleDownEvent: function (event) {
      return true;
    },
    handleMoveEvent: function (event) {
      var coords = map.getEventCoordinate(event.originalEvent);
      carIconFeature.getGeometry().setCoordinates(coords);

      // Check if the car is in the red zone
      if (ol.extent.containsCoordinate(redZoneFeature.getGeometry().getExtent(), coords)) {
        // If the car is in the red zone, show the alert symbol
        addAlertSymbol(coords);
      } else {
        // If the car is not in the red zone, remove the alert symbol
        removeAlertSymbol();
      }
    },
    handleUpEvent: function (event) {
      return true;
    },
  });

  map.addInteraction(dragInteraction);
}

// Function to add a custom alert symbol
function addAlertSymbol(coordinates) {
  removeAlertSymbol(); // Remove existing alert symbol

  alertSymbolFeature = new ol.Feature({
    geometry: new ol.geom.Point(coordinates),
  });

  alertSymbolFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.75,
        src: 'custom-alert-symbol.jpg', // Path to your custom alert symbol image
        scale: 0.1, // Adjust the scale as needed
      }),
    })
  );

  vectorSource.addFeature(alertSymbolFeature);
}

// Function to remove the alert symbol
function removeAlertSymbol() {
  if (alertSymbolFeature) {
    vectorSource.removeFeature(alertSymbolFeature);
    alertSymbolFeature = null;
  }
}

// Example coordinates around the specified location
var centerCoordinates = ol.proj.fromLonLat([77.704211, 13.242482]);
var radius = 200; // Adjust the radius as needed

// Call the function to add the circular red zone
addRedZone(centerCoordinates, radius);
addCarIcon(ol.proj.fromLonLat([77.704211, 13.242482]));
