<script>
  export let player;
  export let feed;
  export let activeItem;
  export let flipCardX = () => {};
</script>

<div part="boost-container">
  <button part="boost-container-goto-player-button" on:click={flipCardX}>
    <span part="boost-container-goto-player-button-icon"> smart_display </span>
  </button>
</div>

<style>
</style>
