import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 150,
  duration: "20s",
  rps: 1000
};

let bottom100 = Math.floor(Math.random() * 1000) + 9999000;
let allOthers = Math.floor(Math.random() * 10000000) + 1;

let idPicker = ((randomNum) => {
  return randomNum >= 0.5 ? bottom100 : allOthers;
})(Math.random())

export default function() {
  let res = http.get(`http://localhost:3001/id/${idPicker}`);
  check(res, {
    "status was 200": (r) => r.status == 200,
    "transaction time OK": (r) => r.timings.duration < 200
  });
};