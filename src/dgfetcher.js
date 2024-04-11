//@ts-check

import { devig } from "./devigger.js";
import { outrightOdds } from "./datagolf.js";
// TODO: These imports aren't being used, should they be here?
// import { generateDeviggerUrl, arrayToObjectBuilder } from "./querybuilder";
import { config } from "dotenv";

config();

//Array that stores all the outrights above EV threshold for all markets
let EVArray = [];

//devig, push plays above ev threshold to winev array
//output array to discord
//add check statement to only devig if anything changed
/**
 * @param {string} tour
 * @param {string} market
 */
async function findEV(tour, market) {
  if (tour.toLowerCase() === "pga") {
    if (market.toLowerCase() === "win") {
      let list = ["tour", tour, "market", market];
      let dgResponse = await outrightOdds(list);
      await devig(dgResponse, EVArray);
      if (EVArray.length > 0) return EVArray;
      else return "NO EV";
    }
    if (market.toLowerCase() === "top5") {
      // TODO: This array isn't being used
      // let list = ["tour", tour, "market", market];
    }
    if (market.toLowerCase() === "top10") {
    }
    if (market.toLowerCase() === "top20") {
    }
  }
  if (tour.toLowerCase() === "euro") {
    if (market.toLowerCase() === "win") {
    }
    if (market.toLowerCase() === "top5") {
    }
    if (market.toLowerCase() === "top10") {
    }
    if (market.toLowerCase() === "top20") {
    }
  }
  if (tour.toLowerCase() === "kft") {
    if (market.toLowerCase() === "win") {
    }
    if (market.toLowerCase() === "top5") {
    }
    if (market.toLowerCase() === "top10") {
    }
    if (market.toLowerCase() === "top20") {
    }
  }
  //pass arrays to devig function
}

export { findEV };

//refactor json response local array?  json clone?
