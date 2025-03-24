<script>
  import detectWebLNProvider from "./functions/detectWebLNProvider";
  import sendBoost from "./functions/sendBoost";
  export let player;
  export let feed;
  export let activeItem;
  export let wallet;
  export let flipCardX = () => {};

  let wallet;

  let satAmount = 100;
  let boostagram = "this is a test";

  async function handleBoost() {
    if (!wallet) {
      wallet = await detectWebLNProvider();
      console.log(wallet._isEnabled);
    }

    if (wallet && !wallet._isEnabled) {
      await window.webln.enable();

      sendBoost({
        wallet,
        channel: feed?.channel,
        activeItem,
        player,
        satAmount,
      });

      // await window.webln.enable();
      // let stuff = await window.webln.sendPayment(
      //   "lnbc100n1pnamvqzdq5g9kxy7fqd9h8vmmfvdjsnp4qddd9j25ufjqqjvxmgkefx0pwvh9za0pmnhjg57fy8rvmnp4xm5aspp5hvm43enmujykphkuv64nqrvxzxrqyktq2ew3t8qsf68dxuj2hn6ssp5g84nvczzc0kgudytff048nt9ghr3dgg7mf2nfdk7074tjqskgs0q9qyysgqcqpcxqyz5vqrrmgkt67nkue0ddc7wgxjchmueuy5tgltul4twjqnrdk6rfv90t8fkv8lqa3kqeztwdz5yh64g2r6vgqq5uvwaaemnuffdemh4dl9lqpkr825f"
      // );
      // console.log(stuff);
      // console.log(wallet);
    }
  }
</script>

<div part="boost-container">
  <button on:click={handleBoost}>Boost</button>
  <button part="boost-container-goto-player-button" on:click={flipCardX}>
    <span part="boost-container-goto-player-button-icon"> smart_display </span>
  </button>
</div>

<style>
</style>
