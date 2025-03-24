<script>
  export let player;

  let progress;
  let handle;
  let trackMouse = false;
  let trackPosition;
  export let trackerColor = "#ddd";
  export let elapsedColor = "#333";
  export let handleColor = "#333";
  let trackerHeight = 2;
  let handleHeight = 8;
  $: percentage = player?.duration
    ? (player?.currentTime / player?.duration) * 100
    : 0;
  let storedTimeUpdate;

  function handleProgress(e) {
    storedTimeUpdate = player.ontimeupdate;
    // handleHeight = handleHeight * 2;
    player.ontimeupdate = () => null;
    trackMouse = true;
    trackPosition = e.x;

    if (e.target !== handle) {
      player.currentTime = (e.offsetX / progress.clientWidth) * player.duration;
    }
  }

  function handleTouchstart(e) {
    let touch = e.touches[0];
    storedTimeUpdate = player.ontimeupdate;
    // handleHeight = handleHeight * 2;
    player.ontimeupdate = () => null;
    trackMouse = true;
    trackPosition = touch.clientX;

    if (e.target !== handle) {
      player.currentTime =
        (touch.clientX / progress.clientWidth) * player.duration;
    }
  }

  function handleMouseUp(e) {
    if (trackMouse) {
      trackMouse = false;
      // handleHeight = handleHeight / 2;
      player.currentTime = player.currentTime;
      player.ontimeupdate = storedTimeUpdate;
    }
  }

  function handleTouchend(e) {
    console.log(e);
    if (trackMouse) {
      trackMouse = false;
      // handleHeight = handleHeight / 2;
      player.currentTime = player.currentTime;
      player.ontimeupdate = storedTimeUpdate;
    }
  }

  function handleMouseMove(e) {
    let left = progress.getBoundingClientRect().left;
    let right = progress.getBoundingClientRect().right;
    if (trackMouse) {
      e.preventDefault(); //prevents highlighting on mouse move
      if (e.x < left) {
        player.currentTime = 0;
        trackPosition = left;
      } else if (e.x > right) {
        player.currentTime = player.duration;
        trackPosition = right;
      } else {
        player.currentTime =
          ((e.x - trackPosition) / progress.clientWidth) * player.duration +
          player.currentTime;
        trackPosition = e.x;
      }
    }
  }
  function handleTouchMove(e) {
    let touch = e.touches[0];
    let left = progress.getBoundingClientRect().left;
    let right = progress.getBoundingClientRect().right;
    if (trackMouse) {
      e.preventDefault(); //prevents highlighting on mouse move
      if (touch.clientX < left) {
        player.currentTime = 0;
        trackPosition = left;
      } else if (touch.clientX > right) {
        player.currentTime = player.duration;
        trackPosition = right;
      } else {
        player.currentTime =
          ((touch.clientX - trackPosition) / progress.clientWidth) *
            player.duration +
          player.currentTime;
        trackPosition = touch.clientX;
      }
    }
  }
</script>

<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<div
  class="progress-bar"
  on:mousedown={handleProgress}
  on:touchstart={handleTouchstart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchend}
>
  <div
    bind:this={progress}
    class="tracker"
    style="--tracker-color: {trackerColor}; --tracker-height: {`${trackerHeight}px`}"
  >
    <div
      class="elapsed"
      style="--elapsed-color: {elapsedColor}; --tracker-height: {`${trackerHeight}px`};
      --position: {`${percentage}%`}"
    />
    <div
      bind:this={handle}
      class="handle"
      style="--handle-color: {handleColor}; --handle-height: {`${handleHeight}px`};
      --handle-position: {`${percentage}%`}; --handle-offset: {`${
        trackerHeight + (handleHeight - trackerHeight) / 2
      }px`}"
    />
  </div>
</div>

<style>
  .progress-bar {
    width: 100%;
    height: 3em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    z-index: 4;
  }

  .tracker {
    width: 100%;
    height: var(--audio-progress-bar-tracker-height);
    border-radius: var(--audio-progress-bar-tracker-height);
    background-color: var(--audio-progress-bar-tracker-color);
  }

  .elapsed {
    height: 100%;
    width: var(--audio-progress-bar-position);
    border-radius: var(--audio-progress-bar-tracker-height);
    background-color: var(--audio-progress-bar-elapsed-color);
  }
  .handle {
    height: var(--audio-progress-bar-handle-height);
    width: var(--audio-progress-bar-handle-height);
    border-radius: var(--audio-progress-bar-handle-height);
    background-color: var(--audio-progress-bar-handle-color);
    position: relative;
    left: calc(
      var(--audio-progress-bar-handle-position) -
        var(--audio-progress-bar-handle-height) / 2
    );
    bottom: var(--audio-progress-bar-handle-offset);
    /* transition: all 0.1s ease;
    transition-property: height width; */
  }
</style>
