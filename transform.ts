import Decimal from 'decimal.js';

const DecimalIns = Decimal.set({precision: 200});

const Abs = DecimalIns.abs.bind(DecimalIns);
const Sqrt = DecimalIns.sqrt.bind(DecimalIns);
const Sin = DecimalIns.sin.bind(DecimalIns);
const Cos = DecimalIns.cos.bind(DecimalIns);
const Atan2 = DecimalIns.atan2.bind(DecimalIns);
const Pow = DecimalIns.pow.bind(DecimalIns);
const Floor = DecimalIns.floor.bind(DecimalIns);
const Ceil = DecimalIns.ceil.bind(DecimalIns);



const tDecimal = (num: number | string) => new DecimalIns(`${num}`);

const Pi = tDecimal('3.14159265358979323846264338327950288419716939937510582097494459');

const EnableBorderDetection: boolean = false;
const Axis: Decimal = tDecimal(6378245);
const Offset: Decimal = tDecimal(0.006693421622965943);
const Pi_180: Decimal = Pi.dividedBy(tDecimal(180));

function inChina (N: Decimal,E: Decimal): boolean {
  const _N = N.toNumber();
  const _E = N.toNumber();
  return (
    _N >= 17.95752 &&
    _N <= 53.56082 &&
    _E >= 73.55 &&
    _E <= 134.75
  );
};

// WGS84 -> GCJ02:
function WGS84toGCJ02 (N: Decimal,E: Decimal): [Decimal, Decimal] {
  if (EnableBorderDetection && !inChina(N, E)) {
    return [N, E];
  };


  const _N = N.minus(tDecimal(35));
  const _E = E.minus(tDecimal(105));

  const x0 = _N.mul(Pi);
  const x1 = _E.mul(Pi);
  const x2 = _N.mul(_E);
  const x3 = Sqrt(Abs(_E));
  const x4 = (
    Sin(x1.mul(tDecimal(6))).add(Sin(x1.mul(tDecimal(2))))
  ).mul(20);

  const x5 = N.mul(Pi_180);
  const x6 = tDecimal('1').minus(Pow(Sin(x5), tDecimal(2)).mul(Offset));
  const x7 = Axis.dividedBy(Sqrt(x6));

  return [
    (
      N.add(
        (
          (x4.add(
            Sin(x0).mul(tDecimal(20))
          ).add(
            Sin(x0.dividedBy(tDecimal(3))).mul(tDecimal(40))
          ).add(
            Sin(x0.dividedBy(tDecimal(12))).mul(tDecimal(160))
          ).add(
            Sin(x0.dividedBy(tDecimal(30)))).mul(tDecimal(320)).dividedBy(tDecimal(1.5))
          ).add(
            _N.mul(tDecimal(3))
          ).add(
            _E.mul(tDecimal(2))
          ).add(
            x2.dividedBy(tDecimal(10))
          ).add(
            (Pow(_N, tDecimal(2)).add(x3)).dividedBy(tDecimal(5))
          ).minus(tDecimal(100))
        ).dividedBy(x7).dividedBy((tDecimal('1').minus(Offset))).mul(x6).dividedBy(Pi_180)
      )
    ),
    (
      E.add(
        (
          (
            x4.add(
              Sin(x1).mul(tDecimal(20))
            ).add(
              Sin(x1.dividedBy(tDecimal(3))).mul(tDecimal(40))
            ).add(
              Sin(x1.dividedBy(tDecimal(12))).mul(tDecimal(150))
            ).add(
              Sin(x1.dividedBy(tDecimal(30))).mul(tDecimal(300))
            )
          ).dividedBy(tDecimal(1.5)).add(
            _N.mul(tDecimal(2))
          ).add(_E).add((Pow(_E, tDecimal(2)).add(x2).add(x3)).dividedBy(tDecimal(10))).add(tDecimal(300))
        ).dividedBy(x7).dividedBy(Cos(x5)).dividedBy(Pi_180)
      )
    )
  ];
};


// WGS84 -> BD09 ("bd09ll"):
function WGS84toBD09 (N: Decimal, E: Decimal): [Decimal, Decimal] {
  return GCJ02toBD09(...WGS84toGCJ02( N, E ));
};


// WGS84 -> BD09MC:
function WGS84toBD09MC (N: Decimal, E: Decimal): [Decimal, Decimal] {
  return BD09toBD09MC(...WGS84toBD09( N, E ));
};


// GCJ02 -> WGS84:
function GCJ02toWGS84 (N: Decimal, E: Decimal): [Decimal, Decimal] {
  if (EnableBorderDetection && !inChina(N, E) ) {
    return [N, E];
  };

  const _N = N.minus(tDecimal(35));
  const _E = E.minus(tDecimal(105));

  const x0 = _N.mul(Pi);
  const x1 = _E.mul(Pi);
  const x2 = _N.mul(_E);
  const x3 = Sqrt(Abs(_E));
  const x4 = (Sin(x1.mul(tDecimal(6))).add(Sin(x1.mul(tDecimal(2))))).mul(tDecimal(20));

  const x5 = N.mul(Pi_180);
  const x6 = tDecimal(1).minus(Pow(Sin(x5), tDecimal(2)).mul(Offset));
  const x7 = Axis.dividedBy(Sqrt(x6));

  return [
    (
      N.minus(
          (
          (
            x4.add(
              Sin(x0).mul(tDecimal(20))
            ).add(
              Sin(x0.dividedBy(tDecimal(3))).mul(tDecimal(40))
            ).add(
              Sin(x0.dividedBy(tDecimal(12))).mul(tDecimal(160))
            ).add(
              Sin(x0.dividedBy(tDecimal(30))).mul(tDecimal(320))
            )
          ).dividedBy(tDecimal(1.5)).add(
            _N.mul(tDecimal(3))
          ).add(
            _E.mul(tDecimal(2))
          ).add(x2.dividedBy(tDecimal(10))).add((Pow(_N, tDecimal(2)).add(x3)).dividedBy(tDecimal(5))).minus(tDecimal(100))
        ).dividedBy(x7).dividedBy(tDecimal(1).minus(Offset)).mul(x6).dividedBy(Pi_180)
      )
    ),
    (
      E.minus(
        (
          (
            x4.add(
              Sin( x1 ).mul(tDecimal(20))
            ).add(
              Sin(x1.dividedBy(tDecimal(3))).mul(tDecimal(40))
            ).add(
              Sin(x1.dividedBy(tDecimal(12))).mul(tDecimal(150))
            ).add(
              Sin(x1.dividedBy(tDecimal(30))).mul(tDecimal(300))
            )
          ).dividedBy(tDecimal(1.5)).add(
            _N.mul(tDecimal(2))
          ).add(
            _E
          ).add((Pow(_E, tDecimal(2)).add(x2).add(x3)).dividedBy(tDecimal(10))).add(tDecimal(300))
        ).dividedBy(
          x7
        ).dividedBy(Cos(x5)).dividedBy(Pi_180)
      )
    )
  ];
};


// BD09 ("bd09ll") -> WGS84:
function BD09toWGS84 (N: Decimal, E: Decimal): [Decimal, Decimal] {
  return GCJ02toWGS84(...BD09toGCJ02( N, E ));
};


// BD09MC -> WGS84:
function BD09MCtoWGS84 (X: Decimal, Y: Decimal): [Decimal, Decimal] {
  return BD09toWGS84(...BD09MCtoBD09( X, Y ));
};

const x_Pi: Decimal = Pi_180.mul(tDecimal(3000));

// GCJ02 -> BD09 ("bd09ll"):
function GCJ02toBD09 (N: Decimal, E: Decimal): [Decimal, Decimal] {
  const x0 = Sqrt(Pow(N, tDecimal(2)).add(Pow(E, tDecimal(2)))).add(Sin(N.mul(x_Pi)).mul(tDecimal(0.00002)));
  const x1 = Atan2( N, E ).add(Cos(E.mul(x_Pi)).mul(tDecimal(0.000003)));

  return [Sin(x1).mul(x0).add(tDecimal(0.006)), Cos( x1 ).mul(x0).add(tDecimal(0.0065))];
};


// BD09 ("bd09ll") -> GCJ02:
function BD09toGCJ02 (N: Decimal, E: Decimal): [Decimal, Decimal] {
  N = N.minus(tDecimal(0.006));
  E = E.minus(tDecimal(0.0065));

  const x0 = Sqrt(Pow(N, tDecimal(2)).add(Pow(E, tDecimal(2)))).minus(Sin(N.mul(x_Pi)).mul(tDecimal(0.00002)));
  const x1 = Atan2(N, E).minus(Cos(E.mul(x_Pi)).mul(0.000003));

  return [Sin(x1).mul(x0), Cos(x1).mul(x0)];
};

// BD09 ("bd09ll") -> BD09MC:
function BD09toBD09MC (N: Decimal, E: Decimal): [Decimal, Decimal] {
  if ( E.toNumber() > 180 ) {
    E =  E.minus(Floor((E.add(tDecimal(180))).dividedBy(tDecimal(360))).mul(tDecimal(360)));
  } else if ( E.toNumber() < -180 ) {
    E =  E.minus(Ceil(E.minus(tDecimal(180)).dividedBy(tDecimal(360))).mul(tDecimal(360)));
  };


  const n: Decimal[] = [];
  let x0 = Abs(N);

  if ( x0.toNumber() >= 60 ) {
    n[0] = tDecimal('0.0008277824516172526');
    n[1] = tDecimal('111320.7020463578');
    n[2] = tDecimal('647795574.6671607');
    n[3] = tDecimal('-4082003173.641316');
    n[4] = tDecimal('10774905663.51142');
    n[5] = tDecimal('-15171875531.51559');
    n[6] = tDecimal('12053065338.62167');
    n[7] = tDecimal('-5124939663.577472');
    n[8] = tDecimal('913311935.9512032');
    n[9] = tDecimal('67.5');
  } else if ( x0.toNumber() >= 45 ) {
    n[0] = tDecimal('0.00337398766765');
    n[1] = tDecimal('111320.7020202162');
    n[2] = tDecimal('4481351.045890365');
    n[3] = tDecimal('-23393751.19931662');
    n[4] = tDecimal('79682215.47186455');
    n[5] = tDecimal('-115964993.2797253');
    n[6] = tDecimal('97236711.15602145');
    n[7] = tDecimal('-43661946.33752821');
    n[8] = tDecimal('8477230.501135234');
    n[9] = tDecimal('52.5');
  } else if ( x0.toNumber() >= 30 ) {
    n[0] = tDecimal('0.00220636496208');
    n[1] = tDecimal('111320.7020209128');
    n[2] = tDecimal('51751.86112841131');
    n[3] = tDecimal('3796837.749470245');
    n[4] = tDecimal('992013.7397791013');
    n[5] = tDecimal('-1221952.21711287');
    n[6] = tDecimal('1340652.697009075');
    n[7] = tDecimal('-620943.6990984312');
    n[8] = tDecimal('144416.9293806241');
    n[9] = tDecimal('37.5');
  } else if ( x0.toNumber() >= 15 ) {
    n[0] = tDecimal('-0.0003441963504368392');
    n[1] = tDecimal('111320.7020576856');
    n[2] = tDecimal('278.2353980772752');
    n[3] = tDecimal('2485758.690035394');
    n[4] = tDecimal('6070.750963243378');
    n[5] = tDecimal('54821.18345352118');
    n[6] = tDecimal('9540.606633304236');
    n[7] = tDecimal('-2710.55326746645');
    n[8] = tDecimal('1405.483844121726');
    n[9] = tDecimal('22.5');
  } else {
    n[0] = tDecimal('-0.0003218135878613132');
    n[1] = tDecimal('111320.7020701615');
    n[2] = tDecimal('0.00369383431289');
    n[3] = tDecimal('823725.6402795718');
    n[4] = tDecimal('0.46104986909093');
    n[5] = tDecimal('2351.343141331292');
    n[6] = tDecimal('1.58060784298199');
    n[7] = tDecimal('8.77738589078284');
    n[8] = tDecimal('0.37238884252424');
    n[9] = tDecimal('7.45');
  };

  // X:
  let X = Abs(E).mul(n[1]).add(n[0]);
  if (E.toNumber() < 0) {
    X = X.mul(tDecimal(-1));
  };

  // Y:
  x0 = x0.dividedBy(n[9]);
  let x1 = Pow(x0, tDecimal(2));

  let Y = x0.mul(n[3]).add(n[2]).add(x1.mul(n[4]));

  x1 = x1.mul(x0);
  Y = x1.mul(n[5]).add(Y);
  x1 = x1.mul(x0);
  Y = x1.mul(n[6]).add(Y);
  x1 = x1.mul(x0);
  Y = (x0.mul(n[8]).add(n[7])).mul(x1).add(Y);

  if (N.toNumber() < 0) {
    Y = Y.mul(tDecimal(-1));
  };


  if (Y.toNumber() > 19429903) {
    Y = tDecimal('19429903');
  } else if ( Y.toNumber() < -16022031 ) {
    Y = tDecimal('-16022031');
  };

  return [X, Y];
};


// GCJ02 -> BD09MC:
function GCJ02toBD09MC (N: Decimal, E: Decimal): [Decimal, Decimal] {
  return BD09toBD09MC(...GCJ02toBD09(N, E));
};


// BD09MC -> BD09 ("bd09ll"):
function BD09MCtoBD09 (X: Decimal,Y: Decimal): [Decimal, Decimal] {
  if (X.toNumber() > 20037726.372307256) {
    X = X.minus(Floor((X.add(tDecimal('20037726.372307256'))).dividedBy(tDecimal('40075452.744614512'))).mul(tDecimal('40075452.744614512')));
  } else if ( X.toNumber() < -20037726.372307256 ) {
    X = X.minus(Ceil((X.minus(tDecimal('20037726.372307256'))).dividedBy(tDecimal(40075452.744614512))).mul(tDecimal('40075452.744614512')));
  };


  if ( Y.toNumber() > 19429903 ) {
    Y = tDecimal(19429903);
  } else if ( Y.toNumber() < -16022031 ) {
    Y = tDecimal(-16022031);
  };


  const n: Decimal[] = [];
  let x0 = Abs(Y);

  if (x0.toNumber() >= 8362377.87) {
    n[0] = tDecimal('-0.000000007435856389565537');
    n[1] = tDecimal('0.000008983055097726239');
    n[2] = tDecimal('-0.78625201886289');
    n[3] = tDecimal('96.32687599759846');
    n[4] = tDecimal('-1.85204757529826');
    n[5] = tDecimal('-59.36935905485877');
    n[6] = tDecimal('47.40033549296737');
    n[7] = tDecimal('-16.50741931063887');
    n[8] = tDecimal('2.28786674699375');
    n[9] = tDecimal('10260144.86');
  } else if (x0.toNumber() >= 5591021) {
    n[0] = tDecimal('-0.00000003030883460898826');
    n[1] = tDecimal('0.00000898305509983578');
    n[2] = tDecimal('0.30071316287616');
    n[3] = tDecimal('59.74293618442277');
    n[4] = tDecimal('7.357984074871');
    n[5] = tDecimal('-25.38371002664745');
    n[6] = tDecimal('13.45380521110908');
    n[7] = tDecimal('-3.29883767235584');
    n[8] = tDecimal('0.32710905363475');
    n[9] = tDecimal('6856817.37');
  } else if (x0.toNumber() >= 3481989.83) {
    n[0] = tDecimal('-0.00000001981981304930552');
    n[1] = tDecimal('0.000008983055099779535');
    n[2] = tDecimal('0.03278182852591');
    n[3] = tDecimal('40.31678527705744');
    n[4] = tDecimal('0.65659298677277');
    n[5] = tDecimal('-4.44255534477492');
    n[6] = tDecimal('0.85341911805263');
    n[7] = tDecimal('0.12923347998204');
    n[8] = tDecimal('-0.04625736007561');
    n[9] = tDecimal('4482777.06');
  } else if (x0.toNumber() >= 1678043.12) {
    n[0] = tDecimal('0.00000000309191371068437');
    n[1] = tDecimal('0.000008983055096812155');
    n[2] = tDecimal('0.00006995724062');
    n[3] = tDecimal('23.10934304144901');
    n[4] = tDecimal('-0.00023663490511');
    n[5] = tDecimal('-0.6321817810242');
    n[6] = tDecimal('-0.00663494467273');
    n[7] = tDecimal('0.03430082397953');
    n[8] = tDecimal('-0.00466043876332');
    n[9] = tDecimal('2555164.4');
  } else {
    n[0] = tDecimal('0.000000002890871144776878');
    n[1] = tDecimal('0.000008983055095805407');
    n[2] = tDecimal('-0.00000003068298');
    n[3] = tDecimal('7.47137025468032');
    n[4] = tDecimal('-0.00000353937994');
    n[5] = tDecimal('-0.02145144861037');
    n[6] = tDecimal('-0.00001234426596');
    n[7] = tDecimal('0.00010322952773');
    n[8] = tDecimal('-0.00000323890364');
    n[9] = tDecimal('826088.5');
  };

  // N:
  x0 = x0.mul(n[9]);
  let x1 = Pow(x0, tDecimal(2));

  let N = x0.mul(n[3]).add(n[2]).add(x1.mul(n[4]));

  x1 = x0.mul(x1);
  N = x1.mul(n[5]).add(N);
  x1 = x0.mul(x1);
  N = x1.mul(n[6]).add(N);
  x1 = x0.mul(x1);
  N = (x0.mul(n[8]).add(n[7])).mul(x1).add(N);

  if (Y.toNumber() < 0) {
    N = N.mul(tDecimal('-1'));
  };

  // E:
  let E = Abs(X).mul(n[1]).add(n[0]);
  if (X.toNumber() < 0) {
    E = E.mul(tDecimal('-1'));
  };

  return [N, E];
};


// BD09MC -> GCJ02:
function BD09MCtoGCJ02 (X: Decimal, Y: Decimal): [Decimal, Decimal] {
  return BD09toGCJ02(...BD09MCtoBD09(X, Y));
};

function main () {
  const BD09 = [tDecimal('31.242273'), tDecimal('121.507782')];

  console.log(`
    WGS84: ${BD09toWGS84(BD09[0], BD09[1]).map(item => item.toString())}
    ${tDecimal('3.14159265358979323846264338327950288419716939937510582097494459').toNumber()}
  `)
};

main();
