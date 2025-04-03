import filterEmptyKeys from "./filterEmptyKeys";

export default async function payKeysend({
  dest,
  amount,
  channel,
  activeItem,
  satAmount,
  message,
  sender,
  wallet,
}) {
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

  let paymentRecord = {
    destination: dest["@_address"],
    amount: amount,
    customRecords: customRecords,
  };

  console.log("keysend payment: ", paymentRecord);
  await wallet.keysend(paymentRecord);
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
