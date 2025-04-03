import checkWellKnown from "./checkWellKnown";
import payKeysend from "./payKeysend";
import payInvoice from "./payInvoice";

export default async function processPayment({
  dest,
  amount,
  runningTotal,
  channel,
  activeItem,
  satAmount,
  message,
  sender,
  wallet,
}) {
  // Create base record
  try {
    if (dest["@_type"] === "node") {
      // Direct keysend to Lightning node
      await payKeysend({
        dest,
        amount,
        channel,
        activeItem,
        satAmount,
        message,
        sender,
        wallet,
      });
    } else if (dest["@_type"] === "lnaddress") {
      // Check what protocol the Lightning address supports
      const wellKnownData = await checkWellKnown(dest["@_address"]);

      if (wellKnownData.keysend) {
        // We can use keysend for this Lightning address
        const keysendDest = {
          ...dest,
          "@_address": wellKnownData.keysend.pubkey,
        };

        // Check if the keysend response has custom key/value
        if (
          wellKnownData.keysend.customKey &&
          wellKnownData.keysend.customValue
        ) {
          keysendDest["@_customKey"] = wellKnownData.keysend.customKey;
          keysendDest["@_customValue"] = wellKnownData.keysend.customValue;
        }

        await payKeysend({
          dest: keysendDest,
          amount,
          channel,
          activeItem,
          satAmount,
          message,
          sender,
          wallet,
        });
      } else if (wellKnownData.lnurlp) {
        // Handle LNURL-pay protocol
        const callbackUrl = wellKnownData.lnurlp.callback;
        await payInvoice(callbackUrl, amount, message, wallet, dest["@_name"]);
      }
    }

    if (dest["@_fee"] === true) {
      // Update runningTotal only for fees
      runningTotal -= amount;
    }

    return runningTotal;
  } catch (err) {
    alert(`error with ${dest["@_name"]}: ${err.message}`);
    return runningTotal;
  }
}
