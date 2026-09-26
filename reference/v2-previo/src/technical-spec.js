// Fuente principal: documentación Tacker 10 incluida en la carpeta del proyecto.
// Las cotas se expresan en metros salvo indicación contraria.
export const TACKER_10 = Object.freeze({
  mast: Object.freeze({
    model: 'Service King SK104-330',
    heightM: 31.6992,
    capacityLb: 330000,
    lowerSectionM: 16.4,
    upperSectionM: 15.2992,
  }),
  carrier: Object.freeze({
    model: 'Service King SK-575',
    axles: 5,
    operatingLengthM: 18,
    widthM: 4,
  }),
  workFloor: Object.freeze({
    sizeM: Object.freeze([2.6, 3.3]),
    minHeightM: 1,
    maxHeightM: 4,
    modelHeightM: 3,
  }),
  hoisting: Object.freeze({
    lines: 6,
    travelingBlockCapacityT: 110,
    linksCapacityT: 150,
    elevatorCapacityT: 100,
    blockTravelM: Object.freeze([7, 25]),
    mainCableIn: 1,
  }),
  bop: Object.freeze({
    nominalIn: 7.0625,
    workingPsi: 5000,
    accumulatorBottles: 5,
  }),
  layout: Object.freeze({
    anchorOffsetM: 25,
    anchorToleranceM: 3,
    catwalkM: Object.freeze([12, 2.4]),
    triplexPumpM: Object.freeze([6, 2.4]),
    circulationPitM: Object.freeze([12, 2.4]),
    accumulatorM: Object.freeze([8, 2.4]),
  }),
});
