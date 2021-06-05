export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXJqdW5wcyIsImEiOiJja3A0NWdvYXIyYXk4MnBtcHB6b2U2NmljIn0.2obpha1JDO6t6CrQy19wog';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/arjunps/ckp46jc2s0l3717l1avw1k5eg',
    //   center: [-118.113491, 34.111745],
    //   zoomLevel: 5,
    scrollzoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    bounds.extend(loc.coordinates);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>day:${loc.day},${loc.description}</p>`)
      .addTo(map);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 150,
      right: 150,
    },
  });
};
