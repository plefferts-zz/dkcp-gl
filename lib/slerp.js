module.exports.distance = function (qa, qb) {
  var cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  return Math.acos(2 * (cosHalfTheta * cosHalfTheta) - 1)
}

// https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
module.exports.slerp = function ( qa, qb, t, absolute) {

  if (!absolute) {
    if (t === 0 ) return [qa[0], qa[1], qa[2], qa[3]];
    if (t === 1 ) return [qb[0], qb[1], qb[2], qb[3]];
  }

  // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

  var cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];

  var _qa = qa
  qa = [qa[0], qa[1], qa[2], qa[3]]
  
  if ( cosHalfTheta < 0 ) {

    qa[0] = -qb[0];
    qa[1] = -qb[1];
    qa[2] = -qb[2];
    qa[3] = -qb[3];

    cosHalfTheta = -cosHalfTheta;

  } else {
    
    qa[0] = qb[0];
    qa[1] = qb[1];
    qa[2] = qb[2];
    qa[3] = qb[3];

  }

  if ( cosHalfTheta >= 1.0 ) {

    qa[0] = _qa[0];
    qa[1] = _qa[1];
    qa[2] = _qa[2];
    qa[3] = _qa[3];

    return qa;

  }

  var halfTheta = Math.acos( cosHalfTheta );
  var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

  if ( Math.abs( sinHalfTheta ) < 0.001 ) {

    qa[0] = 0.5 * ( _qa[0] + qa[0] );
    qa[1] = 0.5 * ( _qa[1] + qa[1] );
    qa[2] = 0.5 * ( _qa[2] + qa[2] );
    qa[3] = 0.5 * ( _qa[3] + qa[3] );

    return qa;

  }
  
  if (absolute) {
    var theta = Math.acos(2 * (cosHalfTheta * cosHalfTheta) - 1)
    t = t / theta
    if (t === 0 ) return [qa[0], qa[1], qa[2], qa[3]];
    if (t === 1 ) return [qb[0], qb[1], qb[2], qb[3]];
  }

  var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
  ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

  qa[0] = ( _qa[0] * ratioA + qa[0] * ratioB );
  qa[1] = ( _qa[1] * ratioA + qa[1] * ratioB );
  qa[2] = ( _qa[2] * ratioA + qa[2] * ratioB );
  qa[3] = ( _qa[3] * ratioA + qa[3] * ratioB );

  return qa;
}
