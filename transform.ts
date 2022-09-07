const { abs: Abs, sqrt: Sqrt, sin: Sin, cos: Cos, atan2: Atan2, pow: Pow, PI: Pi, floor: Floor, ceil: Ceil } = Math;

const EnableBorderDetection: boolean = false;
const Axis: number = 6378245;
const Offset: number = 0.006693421622965943;
const Pi_180: number = Pi / 180;

function inChina (N: number,E: number): boolean {
  return (
    N >= 17.95752 &&
    N <= 53.56082 &&
    E >= 73.55 &&
    E <= 134.75
  );
};

// WGS84 -> GCJ02:
function WGS84toGCJ02 (N: number,E: number): [number, number] {
  if (EnableBorderDetection && !inChina(N, E)) {
    return [N, E];
  };


  const _N = N - 35;
  const _E = E - 105;

  const x0 = _N * Pi;
  const x1 = _E * Pi;
  const x2 = _N * _E;
  const x3 = Sqrt( Abs( _E ) );
  const x4 = 20 * (Sin( x1 * 6 ) + Sin( x1 * 2 ) );

  const x5 = N * Pi_180;
  const x6 = 1 - Offset * Pow( Sin( x5 ), 2 );
  const x7 = Axis / Sqrt( x6 );

  return [
    (
      N + ( (x4 +
      20 * Sin( x0 ) +
      40 * Sin( x0 / 3 ) +
      160 * Sin( x0 / 12 ) +
      320 * Sin( x0 / 30 ) ) / 1.5 +
      _N * 3 + _E * 2 + x2 / 10 + (Pow( _N, 2 ) + x3) / 5 - 100) /
      x7 / (1 - Offset) * x6 / Pi_180
    ),
    (
      E + ( (x4 +
      20 * Sin( x1 ) +
      40 * Sin( x1 / 3 ) +
      150 * Sin( x1 / 12 ) +
      300 * Sin( x1 / 30 ) ) / 1.5 +
      _N * 2 + _E + (Pow( _E, 2 ) + x2 + x3) / 10 + 300) /
      x7 / Cos( x5 ) / Pi_180
    )
  ];
};


// WGS84 -> BD09 ("bd09ll"):
function WGS84toBD09 (N: number, E: number): [number, number] {
  return GCJ02toBD09(...WGS84toGCJ02( N, E ));
};


// WGS84 -> BD09MC:
function WGS84toBD09MC (N: number, E: number): [number, number] {
  return BD09toBD09MC(...WGS84toBD09( N, E ));
};


// GCJ02 -> WGS84:
function GCJ02toWGS84 (N: number, E: number): [number, number] {
  if (EnableBorderDetection && !inChina( N, E ) ) {
    return [N, E];
  };

  const _N = N - 35;
  const _E = E - 105;

  const x0 = _N * Pi;
  const x1 = _E * Pi;
  const x2 = _N * _E;
  const x3 = Sqrt( Abs( _E ) );
  const x4 = 20 * (Sin( x1 * 6 ) + Sin( x1 * 2 ) );

  const x5 = N * Pi_180;
  const x6 = 1 - Offset * Pow( Sin( x5 ), 2 );
  const x7 = Axis / Sqrt( x6 );

  return [
    (
      N - ( (x4 +
      20 * Sin( x0 ) +
      40 * Sin( x0 / 3 ) +
      160 * Sin( x0 / 12 ) +
      320 * Sin( x0 / 30 ) ) / 1.5 +
      _N * 3 + _E * 2 + x2 / 10 + (Pow( _N, 2 ) + x3) / 5 - 100) /
      x7 / (1 - Offset) * x6 / Pi_180
    ),
    (
      E - ( (x4 +
      20 * Sin( x1 ) +
      40 * Sin( x1 / 3 ) +
      150 * Sin( x1 / 12 ) +
      300 * Sin( x1 / 30 ) ) / 1.5 +
      _N * 2 + _E + (Pow( _E, 2 ) + x2 + x3) / 10 + 300) /
      x7 / Cos( x5 ) / Pi_180
    )
  ];
};


// BD09 ("bd09ll") -> WGS84:
function BD09toWGS84 (N: number, E: number): [number, number] {
  return GCJ02toWGS84(...BD09toGCJ02( N, E ));
};


// BD09MC -> WGS84:
function BD09MCtoWGS84 (X: number, Y: number): [number, number] {
  return BD09toWGS84(...BD09MCtoBD09( X, Y ));
};

const x_Pi: number = Pi_180 * 3000;


// GCJ02 -> BD09 ("bd09ll"):
function GCJ02toBD09 (N: number, E: number): [number, number] {
  const x0 = Sqrt( Pow( N, 2 ) + Pow( E, 2 ) ) + 0.00002 * Sin( N * x_Pi );
  const x1 = Atan2( N, E ) + 0.000003 * Cos( E * x_Pi );

  return [(x0 * Sin( x1 ) + 0.006 ), (x0 * Cos( x1 ) + 0.0065 )];
};


// BD09 ("bd09ll") -> GCJ02:
function BD09toGCJ02 (N: number, E: number): [number, number] {
  N -= 0.006;
  E -= 0.0065;

  const x0 = Sqrt( Pow( N, 2 ) + Pow( E, 2 ) ) - 0.00002 * Sin( N * x_Pi );
  const x1 = Atan2( N, E ) - 0.000003 * Cos( E * x_Pi );

  return [(x0 * Sin( x1 )), (x0 * Cos( x1 ))];
};

// BD09 ("bd09ll") -> BD09MC:
function BD09toBD09MC (N: number, E: number): [number, number] {
  if ( E > 180 ) {
    E -= 360 * Floor( (E + 180) / 360 );
  } else if ( E < -180 ) {
    E -= 360 * Ceil( (E - 180) / 360 );
  };


  const n: number[] = [];
  let x0 = Abs(N);

  if ( x0 >= 60 ) {
    n[0] = 0.0008277824516172526;
    n[1] = 111320.7020463578;
    n[2] = 647795574.6671607;
    n[3] = -4082003173.641316;
    n[4] = 10774905663.51142;
    n[5] = -15171875531.51559;
    n[6] = 12053065338.62167;
    n[7] = -5124939663.577472;
    n[8] = 913311935.9512032;
    n[9] = 67.5;
  } else if ( x0 >= 45 ) {
    n[0] = 0.00337398766765;
    n[1] = 111320.7020202162;
    n[2] = 4481351.045890365;
    n[3] = -23393751.19931662;
    n[4] = 79682215.47186455;
    n[5] = -115964993.2797253;
    n[6] = 97236711.15602145;
    n[7] = -43661946.33752821;
    n[8] = 8477230.501135234;
    n[9] = 52.5;
  } else if ( x0 >= 30 ) {
    n[0] = 0.00220636496208;
    n[1] = 111320.7020209128;
    n[2] = 51751.86112841131;
    n[3] = 3796837.749470245;
    n[4] = 992013.7397791013;
    n[5] = -1221952.21711287;
    n[6] = 1340652.697009075;
    n[7] = -620943.6990984312;
    n[8] = 144416.9293806241;
    n[9] = 37.5;
  } else if ( x0 >= 15 ) {
    n[0] = -0.0003441963504368392;
    n[1] = 111320.7020576856;
    n[2] = 278.2353980772752;
    n[3] = 2485758.690035394;
    n[4] = 6070.750963243378;
    n[5] = 54821.18345352118;
    n[6] = 9540.606633304236;
    n[7] = -2710.55326746645;
    n[8] = 1405.483844121726;
    n[9] = 22.5;
  } else {
    n[0] = -0.0003218135878613132;
    n[1] = 111320.7020701615;
    n[2] = 0.00369383431289;
    n[3] = 823725.6402795718;
    n[4] = 0.46104986909093;
    n[5] = 2351.343141331292;
    n[6] = 1.58060784298199;
    n[7] = 8.77738589078284;
    n[8] = 0.37238884252424;
    n[9] = 7.45;
  };

  // X:
  let X = n[0] + n[1] * Abs( E );
  if ( E < 0 ) { X *= -1; };

  // Y:
  x0 /= n[9];
  let x1 = Pow( x0, 2 );

  let Y = n[2] + n[3] * x0 + n[4] * x1;

  x1 *= x0;
  Y += n[5] * x1;
  x1 *= x0;
  Y += n[6] * x1;
  x1 *= x0;
  Y += (n[7] + n[8] * x0) * x1;

  if ( N < 0 ) { Y *= -1; };


  if ( Y > 19429903 ) {
  Y = 19429903;

  } else if ( Y < -16022031 ) {
  Y = -16022031;
  };

  return [X, Y];
};


// GCJ02 -> BD09MC:
function GCJ02toBD09MC (N: number, E: number): [number, number] {
  return BD09toBD09MC(...GCJ02toBD09(N, E));
};


// BD09MC -> BD09 ("bd09ll"):
function BD09MCtoBD09 (X: number,Y: number): [number, number] {
  if ( X > 20037726.372307256 ) {
    X -= 40075452.744614512 * Floor( (X + 20037726.372307256) / 40075452.744614512 );
  } else if ( X < -20037726.372307256 ) {
    X -= 40075452.744614512 * Ceil( (X - 20037726.372307256) / 40075452.744614512 );
  };


  if ( Y > 19429903 ) {
    Y = 19429903;
  } else if ( Y < -16022031 ) {
    Y = -16022031;
  };


  const n: number[] = [];
  let x0 = Abs( Y );

  if (x0 >= 8362377.87) {
    n[0] = -0.000000007435856389565537;
    n[1] = 0.000008983055097726239;
    n[2] = -0.78625201886289;
    n[3] = 96.32687599759846;
    n[4] = -1.85204757529826;
    n[5] = -59.36935905485877;
    n[6] = 47.40033549296737;
    n[7] = -16.50741931063887;
    n[8] = 2.28786674699375;
    n[9] = 10260144.86;
  } else if (x0 >= 5591021) {
    n[0] = -0.00000003030883460898826;
    n[1] = 0.00000898305509983578;
    n[2] = 0.30071316287616;
    n[3] = 59.74293618442277;
    n[4] = 7.357984074871;
    n[5] = -25.38371002664745;
    n[6] = 13.45380521110908;
    n[7] = -3.29883767235584;
    n[8] = 0.32710905363475;
    n[9] = 6856817.37;
  } else if (x0 >= 3481989.83) {
    n[0] = -0.00000001981981304930552;
    n[1] = 0.000008983055099779535;
    n[2] = 0.03278182852591;
    n[3] = 40.31678527705744;
    n[4] = 0.65659298677277;
    n[5] = -4.44255534477492;
    n[6] = 0.85341911805263;
    n[7] = 0.12923347998204;
    n[8] = -0.04625736007561;
    n[9] = 4482777.06;
  } else if ( x0 >= 1678043.12 ) {
    n[0] = 0.00000000309191371068437;
    n[1] = 0.000008983055096812155;
    n[2] = 0.00006995724062;
    n[3] = 23.10934304144901;
    n[4] = -0.00023663490511;
    n[5] = -0.6321817810242;
    n[6] = -0.00663494467273;
    n[7] = 0.03430082397953;
    n[8] = -0.00466043876332;
    n[9] = 2555164.4;
  } else {
    n[0] = 0.000000002890871144776878;
    n[1] = 0.000008983055095805407;
    n[2] = -0.00000003068298;
    n[3] = 7.47137025468032;
    n[4] = -0.00000353937994;
    n[5] = -0.02145144861037;
    n[6] = -0.00001234426596;
    n[7] = 0.00010322952773;
    n[8] = -0.00000323890364;
    n[9] = 826088.5;
  };

  // N:
  x0 /= n[9];
  let x1 = Pow( x0, 2 );

  let N = n[2] + n[3] * x0 + n[4] * x1;

  x1 *= x0;
  N += n[5] * x1;
  x1 *= x0;
  N += n[6] * x1;
  x1 *= x0;
  N += (n[7] + n[8] * x0) * x1;

  if ( Y < 0 ) { N *= -1; };

  // E:
  let E = n[0] + n[1] * Abs( X );
  if ( X < 0 ) { E *= -1; };

  return [N, E];
};


// BD09MC -> GCJ02:
function BD09MCtoGCJ02 (X: number, Y: number): [number, number] {
  return BD09toGCJ02(...BD09MCtoBD09(X, Y));
};

function main () {
  const BD09 = [31.242273, 121.507782];

  console.log(`
    WGS84: ${BD09toWGS84(BD09[0], BD09[1])}
  `)
};

main();
