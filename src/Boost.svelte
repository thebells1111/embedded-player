<script>
  export let player;
  export let feed;
  export let activeItem;
  export let wallet;
  export let flipCardX = () => {};

  async function handleBoost() {
    console.log(feed?.channel?.value?.valueRecipient[0]);
    console.log(activeItem);
    let amount = 100;
    let person = feed?.channel?.value?.valueRecipient[0];
    if (person?.["@_type"] === "node") {
      let payment = buildKeysend(person, amount);
      console.log(payment);

      const result = await webln.keysend(
        payment
        //   {

        //       destination:
        //         "03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6",
        //       amount: "1",
        //       customRecords: {
        //         "34349334": "HELLO AMBOSS",
        //       },
        //   }
      );

      console.log(result);
    }
    // let stuff = wallet.sendPayment(
    //   "lnbc100n1pnamvqzdq5g9kxy7fqd9h8vmmfvdjsnp4qddd9j25ufjqqjvxmgkefx0pwvh9za0pmnhjg57fy8rvmnp4xm5aspp5hvm43enmujykphkuv64nqrvxzxrqyktq2ew3t8qsf68dxuj2hn6ssp5g84nvczzc0kgudytff048nt9ghr3dgg7mf2nfdk7074tjqskgs0q9qyysgqcqpcxqyz5vqrrmgkt67nkue0ddc7wgxjchmueuy5tgltul4twjqnrdk6rfv90t8fkv8lqa3kqeztwdz5yh64g2r6vgqq5uvwaaemnuffdemh4dl9lqpkr825f"
    // );
  }

  function buildKeysend(person, amount) {
    let destination = person["@_address"];
    let splitAmount = (person["@_split"] * amount) / 100;
    return { destination, amount: splitAmount };
  }

  function normalizeSplits() {}
</script>

<div part="boost-container">
  <button on:click={handleBoost}>Boost</button>
  <button part="boost-container-goto-player-button" on:click={flipCardX}>
    <span part="boost-container-goto-player-button-icon"> smart_display </span>
  </button>
</div>

<style>
</style>
