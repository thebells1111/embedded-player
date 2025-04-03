import processPayment from "./processPayment";

export default async function processDestinations({
  destinations,
  channel,
  activeItem,
  satAmount,
  message,
  sender,
  wallet,
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
        wallet,
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
          wallet,
        });
      }
    }
  }

  return runningTotal;
}
