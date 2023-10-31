import React, { useRef, useEffect, useState } from 'react';
import maplibregl, {Marker} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as geolib from 'geolib'


import compassIcon from './../static/img/compass.png'
import personStandingIcon from './../static/img/person-standing.png'
import mountainIcon from './../static/img/mountain.png'
import routeJson from './../static/geo/route.json'
import { getIntersectionOfLines } from './../lib/intersection.js'


import './map.css';

export default function Map(props) {
  let mapContainer:any = useRef(null);
  let map:any = useRef(null);

  const [multiPointPaperLines, setMultiPointPaperLines] = useState([]);

  const propRef = useRef(props);
  propRef.current = props

  const origin = [-122.28187042895536, 41.33603443897948];
  const shasta = [-122.194888, 41.409196];
  const shastina = [-122.223621, 41.409042];
  const greyButte = [-122.19020, 41.34782];

  const [lng] = useState(-122.28434512636386);
  const [lat] = useState(41.361691009970684);
  const [zoom] = useState(11);
  const [API_KEY] = useState('ThOLipd3MzTdx9r4rqrD');
  
  const shastaBearing = geolib.getRhumbLineBearing(origin, shasta);
  const shastinaBearing = geolib.getRhumbLineBearing(origin, shastina);
  const shasta_line_center = geolib.getCenter([origin, shasta]);
  const shastina_line_center = geolib.getCenter([origin, shastina])
  const greyButteBearing = geolib.getRhumbLineBearing(origin, greyButte);
  const greyButteLineCenter = geolib.getCenter([origin, greyButte]);
  

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      dragPan: false,
      scrollZoom: false,
      keyboard: false
    });

    map.current.on('click', (e) => {
      console.log('Clicked at' + e.lngLat);
      console.log('Current zoom: ' + map.current.getZoom() + '  current center:' + map.current.getCenter());
    })

    const origin = ['-122.34852', '41.36669'];
    const distance = 1000 // 1609 meters in a mile
    const bearing = 70

    map.current.on('load', function() {
      map.current.addSource('line-source', {
        'type': 'geojson',
        'data': null
      });

      map.current.addLayer({
        'id': 'line-layer',
        'type': 'line',
        'source': 'line-source',
        'layout': {
          'line-cap': 'round'
        },
        'paint': {
          'line-color': 'red',
          'line-width': ['coalesce', ['get', 'width'], 2],
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
          'fill-opacity': 0.1
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
          'text-translate': [3, 11]
        }
      });


    map.current.addSource('route', {
      type: 'geojson',
      data: routeJson
    });

    map.current.addLayer({
        'id': 'route-layer',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-cap': 'round',
          visibility: 'none'
        },
        'paint': {
          'line-color': 'red',
          'line-width': 3,
          'line-opacity': 1
        }
      });

      map.current.loadImage(`${personStandingIcon}`,  (error, image) => {
        map.current.addImage('person', image);
      });

      map.current.loadImage(`${compassIcon}`,  (error, image) => {
        map.current.addImage('compass', image);
      });

      map.current.loadImage(`${mountainIcon}`,  (error, image) => {
        map.current.addImage('mountain', image);

        map.current.addSource('point-source', {
          'type': 'geojson',
          'data': null
        });

        map.current.addLayer({
          'id': 'point-layer',
          'type': 'symbol',
          'source': 'point-source',
          'layout': {
            'icon-image': ['get', 'image'],
            'icon-size': 0.3
          }
        });
      });
    })
    
  }, [API_KEY, lng, lat, zoom]);
  
  useEffect(() => {
    if (!map.current) return; //Map isn't loaded yet
    if (props.step[1] == 0) {
      ['point-source', 'line-source', 'label-source', 'error-shade-source'].map((sourceId) => {
        if (map.current.getSource(sourceId)) {
          map.current.getSource(sourceId).setData({
            'type': 'FeatureCollection',
            'features': []
            });    
        }
      });
      if (map.current.getLayer('route-layer')) {
        map.current.setLayoutProperty(
        'route-layer',
        'visibility',
        'none')
      }
    }

    // sometimes we step through before sources are fully loaded.
    const intervals = {}

    const fun = () => {
      if (map.current.getSource('point-source') != null) {
        clearInterval(intervals.id);
        renderStep()
      }
    }

    if (map.current.getSource('point-source')) {
      renderStep()
    } else {
      intervals.id = setInterval(fun, 10);
    }

  }, [props.step]);

  let renderStep = function () {
    switch(props.step[0]) {
      case 0:
        renderIntroPaper(props.step[1]);
        break;
      case 1:
        renderTriangulateOverviewPaper(props.step[1]);
        break;
      case 2:
        renderTriangulateOverviewContinuedPaper(props.step[1]);
        break;
      case 3:
        renderBearingPaper(props.step[1]);
        break;
      case 4:
        renderBearingAndCourseError(props.step[1]);
        break;
      case 5:
        renderTriangulateErrorPaper(props.step[1]);
        break;
      case 6:
        renderTriangulateCollinearPaper(props.step[1]);
        break;
      case 7:
        renderTriangulateOrthogonalPaper(props.step[1]);
        break;
      case 8:
        renderMultipointTriangulation(props.step[1]);
        break;
      case 9:
        renderConclusion(props.step[1]);
        break;
      }
  }

  useEffect(() => {
    if (props.additionalPoints >= 2) {
      map.current.easeTo({
        zoom: 14,
        center: origin
      });
    }

    if (props.additionalPoints >= 4) {
      let pointData = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'person'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      }]}

      map.current.getSource('point-source').setData(pointData);
    }

    if (props.additionalPoints < multiPointPaperLines.length - 3) {
      setMultiPointPaperLines(curLines => curLines.toSpliced(-1));
    } else {
      let distance = 10000
      let bearing = Math.random() * 360
      let point1 = geolib.computeDestinationPoint(origin, distance, bearing)
      let point2 = geolib.computeDestinationPoint(point1, distance + 5000, bearing + (Math.random() * 4 - 2) + 180)

      let line = makeLine(point1, point2)

      setMultiPointPaperLines(curLines => [...curLines, line]);
    }
  }, [props.additionalPoints]);

  let renderIntroPaper = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.28434512636386, 41.361691009970684]
    });
  }

  let renderTriangulateOverviewPaper = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.28434512636386, 41.361691009970684]});

    let pointData = {
      type: 'FeatureCollection',
      features: [
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': greyButte}
        },
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shasta
        }},
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shastina
        }
      }]
    };

    

    map.current.setLayoutProperty(
      'route-layer',
      'visibility',
      'visible')
    let lineData = {
            'type': 'FeatureCollection',
            'features': []
            }

    if (step >= 2) {

      lineData.features.push(makeLineByBearing(greyButte, greyButteBearing + 180, 10000))

      

      let labelData = {
        'type': 'FeatureCollection',
        'features': [
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(greyButteBearing, 1) + '°',
              'rotation': greyButteBearing - 90
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [greyButteLineCenter.longitude, greyButteLineCenter.latitude]
        }}
        ]
      };

      map.current.getSource('label-source').setData(labelData);
    }

    map.current.getSource('line-source').setData(lineData);

    if (step >= 3) {
      pointData.features.push( {
        'type': 'Feature',
        'properties': {
          'image': 'person'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      })
    }

    map.current.getSource('point-source').setData(pointData);
  }

  let renderTriangulateOverviewContinuedPaper = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.28434512636386, 41.361691009970684]});

    let pointData = {
      type: 'FeatureCollection',
      features: [
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': greyButte}
        },
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shasta
        }},
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shastina
        }
      }]
    };

    

    if (step >= 1) {
      let lineData = {
        type: 'FeatureCollection',
        features: [makeLineByBearing(shasta, shastaBearing + 180, 15000)]
      }

      let labelData = {
        'type': 'FeatureCollection',
        'features': [
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(shastaBearing, 1) + '°',
              'rotation': shastaBearing - 90
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [shasta_line_center.longitude, shasta_line_center.latitude]
          }
        }]
      }

      if (step >= 2) {
        lineData.features.push(
          makeLineByBearing(shastina, shastinaBearing + 180, 12000)
        )

        labelData.features.push({
          'type': 'Feature',
          'properties': {
              'name': Math.round(shastinaBearing, 1) + '°',
              'rotation': shastinaBearing - 90
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [shastina_line_center.longitude, shastina_line_center.latitude]
          }
        })

        pointData.features.push({
          'type': 'Feature',
          'properties': {
            'image': 'person'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': origin
          }
        })
      }

      map.current.getSource('line-source').setData(lineData);
      map.current.getSource('label-source').setData(labelData);
    }

    map.current.getSource('point-source').setData(pointData);

  }

  let renderBearingPaper = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.28434512636386, 41.361691009970684]
    });

    let point_data = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'compass'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      }]
    };

    map.current.getSource('point-source').setData(point_data);

    let label_data = {
        'type': 'FeatureCollection',
        'features': [
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(shastaBearing, 1) + '°',
              'rotation': shastaBearing - 90
            },
          'geometry': {
            'type': 'Point',
            'coordinates': [shasta_line_center.longitude, shasta_line_center.latitude]
        }},
        ]
      };

      map.current.getSource('label-source').setData(label_data);

    drawBearingWithError(origin, 10000, shastaBearing, 0);
  }

  let renderBearingAndCourseError = function(step) {
    if (step == 0) {
      if (props.stepForward) {
        map.current.easeTo({
          zoom: 14.6,
          center: [-122.27818388135779, 41.33903092065398]});
        drawBearingWithError(origin, 1000, shastaBearing, 0);
        setTimeout( () => {
          if (propRef.current.step[0] == 3 && propRef.current.step[1] == 0) {
            drawBearingWithError(origin, 1000, shastaBearing, 2, true);
          }
        }, 1500)
      } else {
        drawBearingWithError(origin, 1000, shastaBearing, 2, true)
      }
    }

    if (step == 1) {
      map.current.easeTo({
        zoom: 14.6,
        center: [-122.27818388135779, 41.33903092065398]});
      drawBearingWithError(origin, 1000, shastaBearing, 5, true);
    }

    if (step == 2) {
      map.current.easeTo({
        zoom: 12.45,
        center: [-122.26212218699936, 41.35202915511644]
      });
      drawBearingWithError(origin, 5000, shastaBearing, 2, true);
    }

    if (step == 3) {
      map.current.easeTo({
        zoom: 11.3,
        center: [-122.23797420239151, 41.36877900565929]
      });

      drawBearingWithError(origin, 10500, shastaBearing, 2, true);
    }
  }

  let renderTriangulateErrorPaper = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.23797420239151, 41.36877900565929]
    });

    if (step == 0) {
      let point_data = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'properties': {
            'image': 'person',
          },
          'geometry': {
            'type': 'Point',
            'coordinates': origin
          }
        }]
      };
      map.current.getSource('point-source').setData(point_data);


      let line_data = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [origin, shasta]
          }},{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [origin, shastina]
          }
        }]
      };

      map.current.getSource('line-source').setData(line_data);
    }

    if (step >= 1) {
      map.current.getSource('point-source').setData({
        'type': 'FeatureCollection',
        'features': []
      }); 

      let shastinaRightPoint = geolib.computeDestinationPoint(shastina, 50000, shastinaBearing - 2 + 180);
      let shastinaLeftPoint = geolib.computeDestinationPoint(shastina, 50000, shastinaBearing + 2 + 180);
      let shastinaCoordinates = [
              [shastinaRightPoint.longitude, shastinaRightPoint.latitude],
              shastina,
              [shastinaLeftPoint.longitude, shastinaLeftPoint.latitude]];
      
      let shastaPoint = geolib.computeDestinationPoint(shasta, 20000, shastaBearing + 180);

      let lineData = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[shastaPoint.longitude, shastaPoint.latitude], shasta]
          }},{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': shastinaCoordinates
          }
        }]
      };

      let shadeData = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [shastinaCoordinates]
          }
        }]
      };

      if (step == 2) {
        let rightIntersectionPoint = getIntersectionOfLines(
          shastinaRightPoint,
          { longitude: shastina[0], latitude: shastina[1] },
          { longitude: shasta[0], latitude: shasta[1] },
          shastaPoint)[0];
        rightIntersectionPoint.longitude = -180 - rightIntersectionPoint.longitude;

        let leftIntersectionPoint = getIntersectionOfLines(
          shastinaLeftPoint,
          { longitude: shastina[0], latitude: shastina[1] },
          { longitude: shasta[0], latitude: shasta[1] },
          shastaPoint)[0];
        leftIntersectionPoint.longitude = -180 - leftIntersectionPoint.longitude;

        lineData.features.push({
          'type': 'Feature',
          'properties': {
            'width':    6
          },
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [leftIntersectionPoint.longitude, leftIntersectionPoint.latitude],
              [rightIntersectionPoint.longitude, rightIntersectionPoint.latitude]]
          }});

        map.current.easeTo({
          zoom: 12.33,
          center: [-122.28581062923774, 41.33623365137345]
        });

        let errorDistance = geolib.getDistance(leftIntersectionPoint, rightIntersectionPoint);
        let errorCenter = geolib.getCenter([leftIntersectionPoint, rightIntersectionPoint]);
        let bearing = geolib.getRhumbLineBearing(leftIntersectionPoint, rightIntersectionPoint);

        let labelData = {
          'type': 'Feature',
          'properties': {
            'name': errorDistance + 'm',
            'rotation': bearing - 90
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [errorCenter.longitude, errorCenter.latitude]
          }
        }

        map.current.getSource('label-source').setData(labelData);
      }

      if (step == 3) {
        map.current.easeTo({
          zoom: 10.5,
          center: origin
        });

        setTimeout( () => {
          if (propRef.current.step[0] == 4 && propRef.current.step[1] == 3) {
            map.current.easeTo({
            zoom: 11.6,
            center: [-122.29218156844865, 41.32340487637839]
        });
          }
        }, 2000)

        map.current.getSource('label-source').setData({
          'type': 'FeatureCollection',
          'features': []
        });    

        let shastaRightPoint = geolib.computeDestinationPoint(shasta, 50000, shastaBearing - 2 + 180);
        let shastaLeftPoint = geolib.computeDestinationPoint(shasta, 50000, shastaBearing + 2 + 180);
        let shastaCoordinates = [
          [shastaRightPoint.longitude, shastaRightPoint.latitude],
          shasta,
          [shastaLeftPoint.longitude, shastaLeftPoint.latitude]];

        lineData.features[0].geometry.coordinates = shastaCoordinates;

        shadeData.features.push({
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [shastaCoordinates]
          }
        })
      }

      map.current.getSource('line-source').setData(lineData);
      map.current.getSource('error-shade-source').setData(shadeData);

    }
  }

  let renderTriangulateCollinearPaper = function(step) {
    map.current.easeTo({
      zoom: 10.3,
      center: origin
    });

    let collinearPoint = geolib.computeDestinationPoint(shasta, 20000, shastaBearing + 180);

    let pointData = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'person'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      },{
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shasta
        }
      },{
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [collinearPoint.longitude, collinearPoint.latitude]
        }
      }]
    };

    if (step >= 1) {
      let shastaBearingErrorPoint = geolib.computeDestinationPoint(shasta, 50000, shastaBearing - 1 + 180);

      let lineData = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[shastaBearingErrorPoint.longitude, shastaBearingErrorPoint.latitude], shasta]
          }
        }]
      };

      if (step >= 2) {
        pointData = {
          'type': 'FeatureCollection',
          'features': []
        };  

        let collinearBearingErrorPoint = geolib.computeDestinationPoint(collinearPoint, 50000, shastaBearing - 1);

        lineData.features.push({
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [collinearBearingErrorPoint.longitude, collinearBearingErrorPoint.latitude],
              [collinearPoint.longitude, collinearPoint.latitude]
            ]
          }
        })
      }

      map.current.getSource('line-source').setData(lineData)
    }

    map.current.getSource('point-source').setData(pointData);

  }

  let renderTriangulateOrthogonalPaper = function(step) {
    map.current.easeTo({
      zoom: 10.3,
      center: origin
    });


    let orthogonalBearing = shastaBearing - 90
    let orthogonalPoint = geolib.computeDestinationPoint(origin, 10000, orthogonalBearing);

    let pointData = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'person'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      },{
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shasta
        }
      },{
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [orthogonalPoint.longitude, orthogonalPoint.latitude]
        }
      }]
    };

    if (step >= 1) {
      map.current.easeTo({
        zoom: 10.9,
        center: [-122.28760839398564, 41.35331338476206]
      });

      let orthogonalLeftPoint = geolib.computeDestinationPoint(orthogonalPoint, 15000, orthogonalBearing + 180 - 2);
      let orthogonalRightPoint = geolib.computeDestinationPoint(orthogonalPoint, 15000, orthogonalBearing + 180 + 2);
      let orthogonalCoordinates = [
        [orthogonalLeftPoint.longitude, orthogonalLeftPoint.latitude],
        [orthogonalPoint.longitude, orthogonalPoint.latitude],
        [orthogonalRightPoint.longitude, orthogonalRightPoint.latitude]
        ]

      let shastalLeftPoint = geolib.computeDestinationPoint(shasta, 15000, shastaBearing + 180 - 2);
      let shastalRightPoint = geolib.computeDestinationPoint(shasta, 15000, shastaBearing + 180 + 2);
      let shastaCoordinates = [
        [shastalLeftPoint.longitude, shastalLeftPoint.latitude],
        shasta,
        [shastalRightPoint.longitude, shastalRightPoint.latitude]
        ]
      
      let line_data = {
        'type': 'FeatureCollection',
        'features':[{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': orthogonalCoordinates
          }
        },{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': shastaCoordinates
          }
        }]
      };

      map.current.getSource('line-source').setData(line_data);

      let shade_data = {
        'type': 'FeatureCollection',
        'features':[{
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [orthogonalCoordinates]
          }
        },{
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [shastaCoordinates]
          }
        }]
      };

      map.current.getSource('error-shade-source').setData(shade_data);
      
      pointData = {
        'type': 'FeatureCollection',
        'features': []
      };  
    }

    map.current.getSource('point-source').setData(pointData);
  }

  let renderMultipointTriangulation = function(step) {
    if (props.stepForward) {
      if (step == 0) {
        map.current.easeTo({
          zoom: 10.9,
          center: [-122.28760839398564, 41.35331338476206]
        });

        let line1 = makeLineByBearing(shasta, shastaBearing + (Math.random() * 4 - 2) + 180, 15000);
        let line2 = makeLineByBearing(shastina, shastinaBearing + (Math.random() * 4 - 2) + 180, 15000);

        setMultiPointPaperLines([line1, line2]);
      } else {
        let line = makeLineByBearing(greyButte, greyButteBearing + (Math.random() * 4 - 2) + 180, 15000);
        setMultiPointPaperLines(curLines => [...curLines, line]);
      }
    } else {
      if (step < 1) {
        setMultiPointPaperLines(curLines => curLines.toSpliced(-1));
      } else {
        let collection = {
          type: 'FeatureCollection',
          features: multiPointPaperLines
        }
        map.current.getSource('line-source').setData(collection);
      }
    }
  }

  useEffect(() => { 
    let collection = {
      type: 'FeatureCollection',
      features: multiPointPaperLines
    }

    if (map.current.getSource('line-source')) {
      map.current.getSource('line-source').setData(collection);
    }
  }, [multiPointPaperLines])

  let renderConclusion = function(step) {
    map.current.easeTo({
      zoom: 11,
      center: [-122.28434512636386, 41.361691009970684]});

    let pointData = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'person',
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin}
        },
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shasta
        }},
        {
        'type': 'Feature',
        'properties': {
          'image': 'mountain'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': shastina
        }
      }]
    };

    map.current.getSource('point-source').setData(pointData);



    let lineData = {
      type: 'FeatureCollection',
      features: [
        makeLine(origin, shasta),
        makeLine(origin, shastina)]
    }

    map.current.getSource('line-source').setData(lineData);
  }

  let makeLineByBearing = function(source, bearing, distance, opt={}) {
    let destination = geolib.computeDestinationPoint(source, distance, bearing);
    return makeLine(source, destination, opt);
  }

  let makeLine = function(source, destination, opt={}) {
    if (opt.addDistance != null) {
      let bearing = geolib.getRhumbLineBearing(source, destination);

      let distance = geolib.getDistance(source, destination);

      destination = geolib.computeDestinationPoint(source, distance + opt.addDistance, bearing);
    }

    if (source.longitude) {
      source = [source.longitude, source.latitude]
    }

    if (destination.longitude) {
      destination = [destination.longitude, destination.latitude]
    }

    return {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [source, destination]
      }
    }
  }

  let drawBearingWithError = function(origin, distance, bearing, error, label) {
    let leftPoint = geolib.computeDestinationPoint(origin, distance, bearing - error);
    let rightPoint = geolib.computeDestinationPoint(origin, distance, bearing + error);

    let point_data = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {
          'image': 'compass'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': origin
        }
      }]
    };

    map.current.getSource('point-source').setData(point_data);

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

    map.current.getSource('line-source').setData(line_data);

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

    let errorDistance = geolib.getDistance(rightPoint, leftPoint)
    let errorCenter = geolib.getCenter([leftPoint, rightPoint])

    if (label) {
      let label_data = {
        'type': 'FeatureCollection',
        'features': [
        {
          'type': 'Feature',
          'properties': {
              'name': Math.round(distance / 100)/10 + 'km',
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

  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className='map' />
    </div>
  );
}