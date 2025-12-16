import { DateTime } from "luxon";

const dt = DateTime.now().setZone('America/Argentina/Buenos_Aires');

console.log("Hora resultante:", dt.toFormat("HH:mm"));
console.log("¿La zona es válida?:", dt.isValid)