import * as geolib from 'geolib'

Number.prototype.toRadians = function () {
  return Math.radians(this.valueOf());
};

Number.prototype.toDegrees = function () {
  return Math.degrees(this.valueOf());
};

// Converts from degrees to radians.
Math.radians = function (degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
  return radians * 180 / Math.PI;
};

export function getIntersectionOfLines(/* Line 1 */ p1A, p1B, /* Line 2 */ p2A, p2B) {
  var isInside = false;

  // Line 1 A -> B
  var lat1A = p1A.latitude;
  var lon1A = p1A.longitude;
  var lat1B = p1B.latitude;
  var lon1B = p1B.longitude;

  // Line 2 A -> B
  var lat2A = p2A.latitude;
  var lon2A = p2A.longitude;
  var lat2B = p2B.latitude;
  var lon2B = p2B.longitude;

  // 3d matrices
  var v1 = [];
  var v2 = [];
  var v3 = [];
  var v3A = [];
  var v3B = [];
  var n1 = [];
  var n2 = [];

  var m;

  // Geolib - https://github.com/manuelbieh/Geolib#geolibgetdistanceobject-start-object-end-int-accuracy-int-precision
  var d1 = geolib.getDistance(p1A, p1B, 1, 1);
  var d2 = geolib.getDistance(p2A, p2B, 1, 1);

  // Path 1. Setting up 2 vectors.
  // v1 is vector from center of the Earth to point A
  // v2 is vector from center of the Earth to point B.
  v1[0] = Math.cos(lat1A.toRadians()) * Math.cos(lon1A.toRadians());
  v1[1] = Math.sin(lat1A.toRadians());
  v1[2] = Math.cos(lat1A.toRadians()) * Math.sin(lon1A.toRadians());

  v2[0] = Math.cos(lat1B.toRadians()) * Math.cos(lon1B.toRadians());
  v2[1] = Math.sin(lat1B.toRadians());
  v2[2] = Math.cos(lat1B.toRadians()) * Math.sin(lon1B.toRadians());

  // n1 is the normal to the plane formed by the three points: center of the Earth, point 1A, and point 1B
  n1[0] = (v1[1] * v2[2]) - (v1[2] * v2[1]);
  n1[1] = (v1[2] * v2[0]) - (v1[0] * v2[2]);
  n1[2] = (v1[0] * v2[1]) - (v1[1] * v2[0]);

  // Path 2 - Setting up 2 vectors
  // v1 is vector from center of the Earth to point A
  // v2 is vector from center of the Earth to point B.
  v1[0] = Math.cos(lat2A.toRadians()) * Math.cos(lon2A.toRadians());
  v1[1] = Math.sin(lat2A.toRadians());
  v1[2] = Math.cos(lat2A.toRadians()) * Math.sin(lon2A.toRadians());

  v2[0] = Math.cos(lat2B.toRadians()) * Math.cos(lon2B.toRadians());
  v2[1] = Math.sin(lat2B.toRadians());
  v2[2] = Math.cos(lat2B.toRadians()) * Math.sin(lon2B.toRadians());

  // n1 is the normal to the plane formed by the three points: center of the Earth, point 1A, and point 1B
  n2[0] = (v1[1] * v2[2]) - (v1[2] * v2[1]);
  n2[1] = (v1[2] * v2[0]) - (v1[0] * v2[2]);
  n2[2] = (v1[0] * v2[1]) - (v1[1] * v2[0]);

  // v3 is perpendicular to both normal 1 and normal 2, so it lies in both planes, so it must be the line of intersection of the planes.
  // The question is: does it go towards the correct intersection point or away from it.
  v3A[0] = (n1[1] * n2[2]) - (n1[2] * n2[1]);
  v3A[1] = (n1[2] * n2[0]) - (n1[0] * n2[2]);
  v3A[2] = (n1[0] * n2[1]) - (n1[1] * n2[0]);

  // Want to make v3A a unit vector, so first have to get magnitude, then each component by magnitude
  m = Math.sqrt(v3A[0] * v3A[0] + v3A[1] * v3A[1] + v3A[2] * v3A[2]);
  v3A[0] /= m;
  v3A[1] /= m;
  v3A[2] /= m;

  // Calculating intersection points 3A & 3B.
  // A & B are arbitrary designations right now, later we make A the one close to, or within, the paths.
  var lat3A = Math.asin(v3A[1]);
  var lon3A = 0.0;

  if ((lat3A > EPS) || (-lat3A > EPS)) {
    lon3A = Math.asin(v3A[2] / Math.cos(lat3A));
  }
  else {
    lon3A = 0.0;
  }

  v3B[0] = (n2[1] * n1[2]) - (n2[2] * n1[1]);
  v3B[1] = (n2[2] * n1[0]) - (n2[0] * n1[2]);
  v3B[2] = (n2[0] * n1[1]) - (n2[1] * n1[0]);

  m = Math.sqrt(v3B[0] * v3B[0] + v3B[1] * v3B[1] + v3B[2] * v3B[2]);
  v3B[0] /= m;
  v3B[1] /= m;
  v3B[2] /= m;

  var lat3B = Math.asin(v3B[1]);
  var lon3B = 0.0;
  if ((lat3B > EPS) || (-lat3B > EPS)) {
    lon3B = Math.asin(v3B[2] / Math.cos(lat3B));
  }
  else {
    lon3B = 0.0;
  }

  var p3A = { latitude: lat3A, longitude: lon3A };
  var p3B = { latitude: lat3B, longitude: lon3B };

  // Get the distances from the path endpoints to the two intersection points.
  // These values will be used to determine which intersection point lies on the paths, or which one is closer.
  var d1a3a = geolib.getDistance(p1A, p3A, 1, 1);
  var d1b3a = geolib.getDistance(p1B, p3A, 1, 1);
  var d2a3a = geolib.getDistance(p2A, p3A, 1, 1);
  var d2b3a = geolib.getDistance(p2B, p3A, 1, 1);

  var d1a3b = geolib.getDistance(p1A, p3B, 1, 1);
  var d1b3b = geolib.getDistance(p1B, p3B, 1, 1);
  var d2a3b = geolib.getDistance(p2A, p3B, 1, 1);
  var d2b3b = geolib.getDistance(p2B, p3B, 1, 1);

  if ((d1a3a < d1) && (d1b3a < d1) && (d2a3a < d2) && (d2b3a < d2)) {
    isInside = true;
  }
  else if ((d1a3b < d1) && (d1b3b < d1) && (d2a3b < d2) && (d2b3b < d2)) {
    // 3b is inside the two paths, so swap 3a & 3b
    isInside = true;

    m = lat3A;
    lat3A = lat3B;
    lat3B = m;
    m = lon3A;
    lon3A = lon3B;
    lon3B = m;
  }
  else {
    // Figure out which one is closer to the path
    d1 = d1a3a + d1b3a + d2a3a + d2b3a;
    d2 = d1a3b + d1b3b + d2a3b + d2b3b;

    if (d1 > d2) {
      // Okay, we are here because 3b {lat3B,lon3B} is closer to the paths, so we need to swap 3a & 3b.
      // The other case is already the way 3a & 3b are organized, so no need to swap
      m = lat3A;
      lat3A = lat3B;
      lat3B = m;
      m = lon3A;
      lon3A = lon3B;
      lon3B = m;
    }
  }

  // Convert the intersection points to degrees
  p3A = { latitude: lat3A.toDegrees(), longitude: lon3A.toDegrees() };
  p3B = { latitude: lat3B.toDegrees(), longitude: lon3B.toDegrees() };

  return [p3A, p3B];
}

// Earth flattening (WGS '84)
var EPS = 0.000000000005;