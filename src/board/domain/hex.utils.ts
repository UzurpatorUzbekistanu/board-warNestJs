import { HexCoords } from "./hex.types";


export function countMovement(positionHexCoords: HexCoords, targetHexCoords: HexCoords) {
  const distanceQ = positionHexCoords.q - targetHexCoords.q;
  const distanceR = positionHexCoords.r - targetHexCoords.r;
  const distanceS = -(positionHexCoords.q + positionHexCoords.r) + (targetHexCoords.q + targetHexCoords.r);
  return (Math.abs(distanceQ) + Math.abs(distanceR) + Math.abs(distanceS)) / 2;
}