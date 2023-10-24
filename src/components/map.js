import React, { useRef, useEffect, useState } from 'react';
import maplibregl, {Marker} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as geolib from 'geolib'


import compassIcon from './../static/img/compass.png'
import redTriangleIcon from './../static/img/red-triangle.png'

import './map.css';

export default function Map() {
  let mapContainer:any = useRef(null);
  let map:any = useRef(null);
  const [lng] = useState(-122.34252);
  const [lat] = useState(41.36669);
  const [zoom] = useState(15);
  const [API_KEY] = useState('zPvuG2Re1nlxs357VnsW');

  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );
  
  //122.19514, 41.40820) Shasta

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      //dragPan: false,
      //scrollZoom: false
    });

    const origin = ['-122.34852', '41.36669'];
    const distance = 1000 // 1609 meters in a mile
    const bearing = 70
    

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${compassIcon})`;
    el.style.backgroundSize = "contain";
    el.style.width = '32px';
    el.style.height = '32px';
    const marker = new Marker({ 'element': el})
      .setLngLat(origin)
      .addTo(map.current);

    map.current.on('load', function() {
      //drawBearing('left-error', origin, distance, bearing - 2);
      //drawBearing('right-error', origin, distance, bearing + 2);
      //drawBearing('bearing', origin, distance, bearing, {'lineWidth': 1});

      map.current.addSource('error-line-source', {
        'type': 'geojson',
        'data': null
      });

      map.current.addLayer({
        'id': 'error-line-layer',
        'type': 'line',
        'source': 'error-line-source',
        'layout': {
          'line-cap': 'round'
        },
        'paint': {
          'line-color': 'red',
          'line-width': 2,
          'line-opacity': 1
        }
      });

      map.current.addSource('error-shade-source', {
        'type': 'geojson',
        'data': null
      });

      map.current.addLayer({
        'id': 'error-shade-layer',
        'type': 'fill',
        'layout': {},
        'source': 'error-shade-source',
        'paint': {
          'fill-color': 'red',
          'fill-opacity': 0.2
        }
      });

      map.current.addSource('label-source', {
        'type': 'geojson',
        'data': null
      });

      map.current.addLayer({
        'id': 'label-layer',
        'type': 'symbol',
        'source': 'label-source',
        'layout': {
          'text-field': ['get', 'name'],
          'text-rotate': ['get', 'rotation']
        },
        'paint': {
          'text-translate': [20, 10]
        }
      });


      drawBearingWithError(origin, distance, bearing, 0);
      setTimeout( () => {
        drawBearingWithError(origin, distance, bearing, 2, true);
        setTimeout( () => {
          drawBearingWithError(origin, distance, bearing, 5, true);
          setTimeout( () => {
            map.current.easeTo({'zoom': 12})
            drawBearingWithError(origin, 5000, bearing, 2, true);
          }, 2500);
        }, 1000);
      }, 1000);
    })

    
  }, [API_KEY, lng, lat, zoom]);

  let drawBearingWithError = function(origin, distance, bearing, error, label) {
    let leftPoint = geolib.computeDestinationPoint(origin, distance, bearing - error);
    let rightPoint = geolib.computeDestinationPoint(origin, distance, bearing + error);

    let line_data = {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            [leftPoint.longitude, leftPoint.latitude],
            origin,
            [rightPoint.longitude, rightPoint.latitude]]
      }
    };

    map.current.getSource('error-line-source').setData(line_data);

    let shade_data = {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[
          origin,
          [leftPoint.longitude, leftPoint.latitude],
          [rightPoint.longitude, rightPoint.latitude],
          origin]]
      }
    };

    map.current.getSource('error-shade-source').setData(shade_data);

    let rightLineCenter = geolib.getCenter([origin, rightPoint]);

    let rotation = geolib.getRhumbLineBearing(origin, [rightPoint.longitude, rightPoint.latitude]);

    let errorDistance = geolib.getDistance(rightPoint, leftPoint)/2
    let errorCenter = geolib.getCenter([leftPoint, rightPoint])

    if (label) {
      let label_data = {
        'type': 'FeatureCollection',
        'features': [
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(distance / 1000, 1) + 'km',
              'rotation': rotation - 90
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [rightLineCenter.longitude, rightLineCenter.latitude]
        }},
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(errorDistance, 1) + 'm'
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [errorCenter.longitude, errorCenter.latitude]
        }},


        ]
      };

      map.current.getSource('label-source').setData(label_data);
    }
  }

  let drawBearing = function(id, org, dist, bearingg, style = {}) {

    map.current.loadImage(`${redTriangleIcon}`,  (error, image) => {
      map.current.addImage(id + '-chevron', image);
    });



    let decoration_data = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': org
        }
      }]
    };

    map.current.addSource(id + '-decoration-source', {
      'type': 'geojson',
      'data': decoration_data
    });

    map.current.addLayer({
        'id': id + '-line-decoration',
        'type': 'symbol',
        'source': id + '-decoration-source',
        'layout': {
          'icon-image': id + '-chevron',
          'icon-size': 0.02,
          'icon-rotate': bearingg
        }
      });
  }

  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className='map' />
    </div>
  );
}