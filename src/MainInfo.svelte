<script>
  import AudioProgressBar from "./AudioProgressBar.svelte";
  export let player;
  export let feed;
  export let activeItem;
  export let currentTime;
  export let duration;
  export let controls;
  export let isPaused;
  export let showBoost;
  export let flipCardX = () => {};
  export let flipCardY = () => {};

  $: imgSrc =
    activeItem?.image?.["@_src"] ||
    activeItem?.["itunes:image"]?.["@_href"] ||
    feed?.channel?.image?.["@_src"] ||
    feed?.channel?.["itunes:image"]?.["@_href"];

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
</script>

{#if feed}
  <div part="main-info-container">
    <img
      part="main-info-artwork"
      src={imgSrc}
      alt={feed?.channel?.title || "Podcast"}
    />

    <h2 part="main-info-channel-title">
      {feed?.channel?.title}
    </h2>
    <p part="main-info-channel-author">
      {feed?.channel?.author || feed?.channel?.["itunes:author"]}
    </p>

    {#if activeItem}
      <h3 part="main-info-now-playing-title">
        {activeItem.title}
      </h3>
    {:else}
      <h3 part="main-info-now-playing-title"></h3>
    {/if}

    <div part="main-info-progress-container">
      <div part="main-info-time-display">
        <span part="main-info-current-time">{formatTime(currentTime)}</span>
        <span part="main-info-duration">{formatTime(duration)}</span>
      </div>
      <div part="main-info-audio-progress-bar-container">
        <AudioProgressBar bind:player />
      </div>
    </div>

    {#if showBoost}
      <button part="main-info-boost-button" on:click={flipCardX}>
        <span part="main-info-boost-button-icon" class="material-icons outline">
          rocket_launch
        </span>
      </button>
    {/if}
    <!-- Main playback controls -->
    <div part="main-info-player-controls">
      <button part="main-info-prev-button" on:click={controls.playPrevious}>
        <span part="main-info-prev-button-icon" class="material-icons">
          skip_previous
        </span>
      </button>

      <button part="main-info-play-button" on:click={controls.togglePlayPause}>
        <span part="main-info-play-button-icon" class="material-icons">
          {isPaused ? "play_arrow" : "pause"}
        </span>
      </button>

      <button part="main-info-next-button" on:click={controls.playNext}>
        <span part="main-info-next-button-icon" class="material-icons">
          skip_next
        </span>
      </button>
    </div>
    <button part="main-info-song-button" on:click={flipCardY}>
      <span part="main-info-song-button-icon" class="material-icons">
        queue_music
      </span>
    </button>
  </div>
{/if}
