export default async function payInvoice(
  callbackUrl,
  amount,
  message,
  wallet,
  name
) {
  try {
    // LNURL callbacks require amount in millisatoshis
    const amountMsat = amount * 1000;

    // Construct the callback URL with amount parameter
    let url = new URL(callbackUrl);
    url.searchParams.append("amount", amountMsat.toString());

    // Add comment/message if provided
    if (message) {
      url.searchParams.append("comment", message);
    }

    console.log(`Getting invoice from ${url.toString()}`);

    // Fetch the invoice from the LNURL-pay endpoint
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to get invoice: HTTP ${response.status}`);
    }

    const invoiceData = await response.json();

    // Check for error response
    if (invoiceData.status === "ERROR") {
      throw new Error(`LNURL error: ${invoiceData.reason}`);
    }

    // Validate that we have a payment request
    if (!invoiceData.pr) {
      throw new Error("No payment request in LNURL-pay response");
    }

    const invoice = invoiceData.pr;
    console.log(`Paying invoice for ${name}: ${invoice.substring(0, 30)}...`);
    // Pay the invoice
    await wallet.sendPayment(invoice);

    return true;
  } catch (error) {
    console.error(`LNURL-pay error for ${name}:`, error);
    throw error;
  }
}
