export default async function checkWellKnown(address) {
  console.log(address);
  const [name, server] = address.split("@");

  // Try keysend endpoint first
  try {
    const keysendUrl = `https://${server}/.well-known/keysend/${name}`;
    const keysendRes = await fetch(keysendUrl);
    if (keysendRes.ok) {
      const keysendData = await keysendRes.json();
      console.log(keysendData);
      return { keysend: keysendData };
    }
  } catch (error) {
    console.log("Keysend fetch failed, trying LNURL Pay");
  }

  // Try LNURL Pay endpoint as fallback
  try {
    const lnurlpUrl = `https://${server}/.well-known/lnurlp/${name}`;
    const lnurlpRes = await fetch(lnurlpUrl);
    if (lnurlpRes.ok) {
      const lnurlpData = await lnurlpRes.json();
      console.log(lnurlpData);
      return { lnurlp: lnurlpData };
    }
  } catch (error) {
    console.error("Both keysend and LNURL Pay fetches failed");
    throw new Error(`Could not resolve Lightning address: ${address}`);
  }

  throw new Error(`Could not resolve Lightning address: ${address}`);
}
