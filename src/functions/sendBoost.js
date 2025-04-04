import clone from "just-clone";
import processDestinations from "./processDestinations";

export default async function sendBoost({
  satAmount,
  message,
  wallet,
  player,
  channel,
  activeItem,
  sender,
}) {
  let destinations = clone(
    activeItem?.["podcast:value"]?.["podcast:valueRecipient"] ||
      channel?.["podcast:value"]?.["podcast:valueRecipient"]
  );

  // the xml parser returns an object if the feed has one split and an array if the feed has multiple splits
  // check if destinations is an object and convert it to an array
  if (
    typeof destinations === "object" &&
    !Array.isArray(destinations) &&
    destinations !== null
  ) {
    destinations = [destinations];
  }

  console.log(destinations);

  let hasStevieB = destinations.find(
    (v) =>
      v["@_address"] ===
      "035ad2c954e264004986da2d9499e1732e5175e1dcef2453c921c6cdcc3536e9d8"
  );

  if (!hasStevieB) {
    destinations.push({
      "@_address":
        "035ad2c954e264004986da2d9499e1732e5175e1dcef2453c921c6cdcc3536e9d8",
      "@_name": "BYOPP",
      "@_split": "3",
      "@_type": "node",
      "@_fee": "true",
    });
  }

  destinations.push({
    "@_address": "johnscreekstudios@getalby.com",
    "@_name": "Randy",
    "@_split": "3",
    "@_type": "lnaddress",
    "@_fee": "true",
  });

  destinations.push({
    "@_address": "sjb@strike.me",
    "@_name": "StevenB Strike",
    "@_split": "3",
    "@_type": "lnaddress",
    "@_fee": "true",
  });

  console.log(destinations);

  await processDestinations({
    destinations,
    channel,
    activeItem,
    satAmount,
    message,
    sender,
    wallet,
  });
}
