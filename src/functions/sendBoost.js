import clone from "just-clone";

export default async function sendBoost({
  satAmount,
  message,
  wallet,
  player,
  channel,
  activeItem,
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

  let { feesDestinations, splitsDestinations } = normalizeSplits(destinations);

  for (const dest of feesDestinations) {
    let feeRecord = filterEmptyKeys(
      getBaseRecord({ channel, activeItem, satAmount, message })
    );

    let amount = Math.round((dest["@_split"] / 100) * satAmount);
    if (amount > 0) {
      runningTotal -= amount;
      feeRecord.name = dest["@_name"];
      feeRecord.value_msat = amount * 1000;

      let customRecords = { 7629169: JSON.stringify(feeRecord) };

      if (dest["@_customKey"]) {
        customRecords[dest["@_customKey"]] = dest["@_customValue"];
      }

      try {
        let record = {
          destination: dest["@_address"],
          amount: amount,
          customRecords: customRecords,
        };
        console.log(record);
        //   await wallet.keysend(record);
      } catch (err) {
        alert(`error with  ${dest["@_name"]}:  ${err.message}`);
      }
    }
  }

  for (const dest of splitsDestinations) {
    let record = filterEmptyKeys(
      getBaseRecord({ channel, activeItem, satAmount, message })
    );
    let amount = Math.round((dest["@_split"] / 100) * runningTotal);
    record.name = dest["@_name"];
    record.value_msat = amount * 1000;
    if (amount >= 1) {
      let customRecords = { 7629169: JSON.stringify(record) };
      if (dest["@_customKey"]) {
        customRecords[dest["@_customKey"]] = dest["@_customValue"];
      }

      try {
        let record = {
          destination: dest["@_address"],
          amount: amount,
          customRecords: customRecords,
        };
        console.log(record);
        let res = await wallet.keysend(record);
        console.log(res);
      } catch (err) {
        alert(`error with  ${dest["@_name"]}:  ${err.message}`);
      }
    }
  }

  console.log(payments);
}

function normalizeSplits(destinations) {
  let feesDestinations = [];
  let splitsDestinations = [];
  let splitTotal = 0;
  destinations.forEach((v) => {
    if ((!v["@_fee"] || v["@_fee"] === false) && Number(v["@_split"])) {
      splitTotal += Number(v["@_split"]);
    }
  });
  destinations.forEach((v) => {
    if (!v["@_fee"] || v["@_fee"] === false) {
      if (Number(v["@_split"])) {
        v["@_split"] = (Number(v["@_split"]) / splitTotal) * 100;
      }
      splitsDestinations.push(clone(v));
    } else {
      feesDestinations.push(clone(v));
    }
  });

  return { feesDestinations, splitsDestinations };
}

const getBaseRecord = ({
  channel,
  activeItem,
  satAmount,
  message,
  ts,
  sender_name,
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
    app_name: "LN Beats",
    value_msat: 0,
    value_msat_total: satAmount * 1000,
    name: undefined,
    message,
    sender_name,
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
