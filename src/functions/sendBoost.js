import clone from "just-clone";

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

  let runningTotal = satAmount;

  let payments = [];

  await processDestinations({
    destinations,
    channel,
    activeItem,
    satAmount,
    message,
    sender,
  });
}

async function processDestinations({
  destinations,
  channel,
  activeItem,
  satAmount,
  message,
  sender,
}) {
  let runningTotal = satAmount;

  // First, calculate total split percentage (only for non-fee destinations)
  let splitTotal = 0;
  destinations.forEach((dest) => {
    if (
      (!dest["@_fee"] || dest["@_fee"] === false) &&
      Number(dest["@_split"])
    ) {
      splitTotal += Number(dest["@_split"]);
    }
  });

  // Process fee destinations first
  for (const dest of destinations) {
    if (dest["@_fee"] === true) {
      // Calculate fee amount with floor rounding
      let amount = Math.floor((dest["@_split"] / 100) * satAmount);
      if (amount <= 0) continue;

      // Create and send payment
      runningTotal = await processPayment({
        dest,
        amount,
        runningTotal,
        channel,
        activeItem,
        satAmount,
        message,
        sender,
      });
    }
  }

  // Then process split destinations
  for (const dest of destinations) {
    if (!dest["@_fee"] || dest["@_fee"] === false) {
      if (dest?.["@_type"] === "node" || dest?.["@_type"] === "lnaddress") {
        // Calculate normalized split amount with floor rounding
        let normalizedSplit =
          splitTotal > 0 ? (Number(dest["@_split"]) / splitTotal) * 100 : 0;
        let amount = Math.floor((normalizedSplit / 100) * runningTotal);
        if (amount < 1) continue;

        // Create and send payment
        await processPayment({
          dest,
          amount,
          runningTotal,
          channel,
          activeItem,
          satAmount,
          message,
          sender,
        });
      }
    }
  }

  return runningTotal;
}

async function processPayment({
  dest,
  amount,
  runningTotal,
  channel,
  activeItem,
  satAmount,
  message,
  sender,
}) {
  // Create base record
  let record = filterEmptyKeys(
    getBaseRecord({ channel, activeItem, satAmount, message, sender })
  );

  // Set up record details
  record.name = dest["@_name"];
  record.value_msat = amount * 1000;

  // Create customRecords object
  let customRecords = { 7629169: JSON.stringify(record) };
  if (dest["@_customKey"]) {
    customRecords[dest["@_customKey"]] = dest["@_customValue"];
  }

  try {
    let paymentRecord = {
      destination: dest["@_address"],
      amount: amount,
      customRecords: customRecords,
    };

    console.log(paymentRecord);
    // await wallet.keysend(paymentRecord);

    // Update runningTotal only for fees
    if (dest["@_fee"] === true) {
      runningTotal -= amount;
    }

    return runningTotal;
  } catch (err) {
    alert(`error with ${dest["@_name"]}: ${err.message}`);
    return runningTotal;
  }
}

const getBaseRecord = ({
  channel,
  activeItem,
  satAmount,
  message,
  ts,
  sender,
}) => {
  let record = {
    podcast: channel?.title,
    guid: channel?.podcastGuid,
    episode_guid:
      activeItem?.guid?.["#text"] ||
      activeItem?.guid?.guid ||
      activeItem?.guid?.enclosure?.["@_url"],
    episode: activeItem?.guid?.title,
    ts,
    action: "boost",
    app_name: "BYOPP",
    value_msat: 0,
    value_msat_total: satAmount * 1000,
    name: undefined,
    message,
    sender_name: sender,
  };
  return record;
};

function filterEmptyKeys(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});
}
