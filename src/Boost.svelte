<script>
  import detectWebLNProvider from "./functions/detectWebLNProvider";
  import sendBoost from "./functions/sendBoost";
  export let player;
  export let feed;
  export let activeItem;
  export let flipCardX = () => {};

  let satAmount = 110;
  let sender = "StevenB";
  let message = "The Dude Abides";

  let wallet = null;

  let isEnablePoisoned = false;

  async function handleBoost() {
    if (isEnablePoisoned) {
      alert("Alby rejected permission. Reload the page to try again.");
      return;
    }

    try {
      if (!wallet) wallet = await detectWebLNProvider();
      if (!wallet._isEnabled) await wallet.enable();

      sendBoost({
        wallet,
        channel: feed?.channel,
        activeItem,
        player,
        satAmount,
        message,
        sender,
      });
    } catch (err) {
      console.error("Boost failed:", err);
      if (err.message.includes("enable")) {
        isEnablePoisoned = true;
      }
    }
  }
</script>

<div part="boost-container">
  <div part="boost-container-input-container">
    <label
      for="boost-container-input-sender"
      part="boost-container-label-sender"
    >
      Sender
      <input
        id="boost-container-input-sender"
        part="boost-container-input-sender"
        bind:value={sender}
      />
    </label>
    <label
      for="boost-container-input-amount"
      part="boost-container-label-amount"
    >
      Amount
      <input
        id="boost-container-input-amount"
        part="boost-container-input-amount"
        bind:value={satAmount}
      />
    </label>
    <label
      for="boost-container-input-message"
      part="boost-container-label-message"
    >
      Message
      <textarea
        id="boost-container-input-message"
        part="boost-container-input-message"
        bind:value={message}
      />
    </label>
  </div>

  <button part="boost-container-goto-player-button" on:click={flipCardX}>
    <span part="boost-container-goto-player-button-icon"> smart_display </span>
  </button>

  <button part="boost-container-boost-button" on:click={handleBoost}>
    <span
      class="material-icons outline"
      part="boost-container-boost-button-icon"
    >
      rocket_launch
    </span>
  </button>
</div>

<style>
</style>
