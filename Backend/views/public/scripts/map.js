mapboxgl.accessToken = mapToken; // Use the token passed from the server

const map = new mapboxgl.Map({
    container: 'map', // Ensure this ID matches the ID of your map div
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: listing.geometry.coordinates, // Map center [lng, lat]
    zoom: 9, // Map zoom level
});


new mapboxgl.Marker()
    .setLngLat(listing.geometry.coordinates) // Ensure coordinates is defined as [longitude, latitude]
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // Capitalize Popup correctly
        .setHTML(`<h4>${listing.title}</h4> <p>Exact Location is provided after booking</p>`))
    .addTo(map);

    map.on('load', () => {
        // Load a local image from the public directory
        map.loadImage(
            '/images/logo.png', // Path to the local image
            (error, image) => {
                if (error) throw error;
    
                // Add the image to the map style.
                map.addImage('logo', image);
    
                // Add a data source containing one point feature.
                map.addSource('point', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': listing.geometry.coordinates
                                }
                            }
                        ]
                    }
                });
    
                // Add a layer to use the image to represent the data.
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'point', // reference the data source
                    'layout': {
                        'icon-image': 'logo', // reference the image
                        'icon-size': 1.25
                    }
                });
            }
        );
    });
    