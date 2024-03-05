//Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid3h5dWUwMjA0IiwiYSI6ImNsc2kzd2psZzJkZnMybXF1amZmbjJreWsifQ.Tavjo7Jout4NA8fo4YYY4A'; 

//Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-123.125, 49.25],
    zoom: 10,
    maxBounds: [
        [-180, 30], // Southwest
        [-25, 84]  // Northeast
    ],
});

//Add search control
const geocoder = new MapboxGeocoder({
     accessToken: mapboxgl.accessToken,
     mapboxgl: mapboxgl,
     countries: "ca" 
});

map.addControl(geocoder, 'bottom-left');
//Add zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

// Add fullscreen option
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

map.on('load', () => {

    //add Vancouver neighborhood boundary from mapbox tileset
    map.addSource('boundary', {
        'type': 'vector',
        'url': 'mapbox://wxyue0204.cycdccnp' //mapbox tileset ID
    });

    map.addLayer({
        'id': 'local-area',
        'type': 'fill',
        'source': 'boundary',
        'paint': {
            'fill-color': [
                'step',
                ['get', 'popchange'],//use step expression to create choropleth map of population change
                '#FFE082',
                0, '#FFC107',
                500, '#FF9800',
                2000, '#FF5722',
                3000, '#B71C1C',
            ],
            'fill-opacity': 0.3,
            'fill-outline-color': 'white',
        },
        'source-layer': 'local-area-pop-change-15hdvv' //mapbox tileset name
    },);

    //add another layer with different opacity for hover event
    map.addLayer({
        'id': 'area-hl',
        'type': 'fill',
        'source': 'boundary',
        'paint': {
            'fill-color': [
                'step',
                ['get', 'popchange'],
                '#FFE082',
                0, '#FFC107',
                500, '#FF9800',
                2000, '#FF5722',
                3000, '#B71C1C',
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': 'white',
        },
        'source-layer': 'local-area-pop-change-15hdvv', //mapbox tileset name
        'filter': ['==', ['get', 'name'], '']
    },);

    //add greenest city projects from mapbox tileset
    map.addSource('greenproject', {
        'type': 'vector',
        'url': 'mapbox://wxyue0204.37ans60y' //mapbox tileset ID
    });

    map.addLayer({
        'id': 'projects',
        'type': 'circle',
        'source': 'greenproject',
        'paint': {
            'circle-radius': 5,
            //display marker color base on project category using match expression
            'circle-color': [
                'match',
                ['get', 'category2'],
                'Climate-Leadership', '#5C6BC0',
                'Green-Buildings', '#45B39D',
                'Green-Transportation', '#A569BD',
                'Zero-Waste', '#34495E',
                'Access-to-Nature', '#8BC34A',
                'Local-Food', '#EC7063',
                'Lighter-Footprint', '#F1C40F',
                'Clean-Air', '#81D4FA',
                'Green-Economy', '#2E7D32',
                '#757575' //others
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white'
        },
        'source-layer': 'greenest-city-projects-4v31rw' //mapbox tileset name
    },);

    map.addLayer({
        'id': 'projects2',
        'type': 'circle',
        'source': 'greenproject',
        'paint': {
            'circle-radius': 8,
            //display marker color base on project category using match expression
            'circle-color': [
                'match',
                ['get', 'category2'],
                'Climate-Leadership', '#5C6BC0',
                'Green-Buildings', '#45B39D',
                'Green-Transportation', '#A569BD',
                'Zero-Waste', '#34495E',
                'Access-to-Nature', '#8BC34A',
                'Local-Food', '#EC7063',
                'Lighter-Footprint', '#F1C40F',
                'Clean-Air', '#81D4FA',
                'Green-Economy', '#2E7D32',
                '#757575' //others
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white'
        },
        'source-layer': 'greenest-city-projects-4v31rw', //mapbox tileset name
        'filter': ['==', ['get', 'mapid'], '']
    },);

});

//pop-up and click event
//Switch cursor to pointer when mouse is over local area layer
map.on('mouseenter', 'local-area', () => {
    map.getCanvas().style.cursor = 'pointer'; 
});

//Switch cursor back when mouse leaves local area layer
map.on('mouseleave', 'local-area', () => {
    map.getCanvas().style.cursor = ''; 
});

//pop-up showing description of local areas getting clicked
map.on('click', 'local-area', (e) => {
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Local area name:</b> " + e.features[0].properties.name + "<br>" +
            "<b>Population change: </b>" + e.features[0].properties.popchange) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
});

//change opacity of the local area fill when hover
map.on('mousemove', 'local-area', (e) => {
    if (e.features.length > 0) { 
        map.setFilter('area-hl', ['==', ['get', 'name'], e.features[0].properties.name]);
    }
});

//pop-up showing description of greenest city projects getting clicked
 map.on('click', 'projects', (e) => {
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Greenest city project:</b> " + e.features[0].properties.name + "<br>" +
            "<b>Category: </b>" + e.features[0].properties.category2 + "<br>" +
            "<b>Address: </b>" + e.features[0].properties.address + "<br>" +
            "<b>Additional information: </b>" + e.features[0].properties.short_description) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
});

//change marker size of greenest city projects when hover
map.on('mousemove', 'projects', (e) => {
    if (e.features.length > 0) { 
        map.setFilter('projects2', ['==', ['get', 'mapid'], e.features[0].properties.mapid]);
    }
});