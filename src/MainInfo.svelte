<script>
  import AudioProgressBar from "./AudioProgressBar.svelte";
  export let player;
  export let feed;
  export let activeItem;
  export let currentTime;
  export let duration;
  export let controls;
  export let isPaused;
  export let flipCardX = () => {};
  export let flipCardY = () => {};

  // Reactive statements
  $: progress = duration ? (currentTime / duration) * 100 : 0;
  $: imgSrc =
    activeItem?.image?.["@_href"] ||
    activeItem?.["itunes:image"]?.["@_src"] ||
    feed?.channel?.image?.["@_href"] ||
    feed?.channel?.["itunes:image"]?.["@_src"];

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
</script>

{#if feed}
  <div part="container" class="container">
    <img
      part="artwork"
      class="artwork"
      src={imgSrc}
      alt={feed?.channel?.title || "Podcast"}
    />

    <h3 part="channel-title" class="channel-title">
      {feed?.channel?.title}
    </h3>
    <p part="channel-author" class="channel-author">
      {feed?.channel?.author || feed?.channel?.["itunes:author"]}
    </p>

    {#if activeItem}
      <h3 part="now-playing-title" class="now-playing-title">
        {activeItem.title}
      </h3>
    {:else}
      <h3 part="now-playing-title" class="now-playing-title"></h3>
    {/if}

    <div part="progress-container" class="progress-container">
      <div part="time-display" class="time-display">
        <span part="current-time">{formatTime(currentTime)}</span>
        <span part="duration">{formatTime(duration)}</span>
      </div>
      <AudioProgressBar bind:player />
    </div>

    <button part="boost-button" class="boost-button" on:click={flipCardX}>
      Boost
    </button>
    <!-- Main playback controls -->
    <div part="player-controls" class="player-controls">
      <button
        part="prev-button"
        class="control-button"
        on:click={controls.playPrevious}
      >
        <span class="material-icons" part="prev-icon">skip_previous</span>
      </button>

      <button
        part="play-button"
        class="control-button play-button"
        on:click={controls.togglePlayPause}
      >
        <span class="material-icons" part="play-icon">
          {isPaused ? "play_arrow" : "pause"}
        </span>
      </button>

      <button
        part="next-button"
        class="control-button"
        on:click={controls.playNext}
      >
        <span class="material-icons" part="next-icon">skip_next</span>
      </button>
    </div>
    <button part="song-button" class="song-button" on:click={flipCardY}>
      Songs
    </button>
  </div>
{/if}

<style>
  /* Material icons styling */
  .material-icons {
    font-family: "Material Icons";
    font-size: var(--icon-size, 24px);
    color: var(--icon-color, #2980b9);
    font-weight: normal;
    font-style: normal;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
  }

  .artwork {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .channel-title {
    margin: 0;
  }

  .channel-author {
    margin: 0;
    color: #666;
  }

  .now-playing-title {
    margin: 4px 0 0 0;
    font-size: 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .progress-container {
    padding: 0 8px;
    position: relative;
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    position: absolute;
    width: calc(100% - 16px);
    bottom: 6px;
    z-index: 3;
    user-select: none;
  }

  .player-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .control-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .control-button:hover,
  .play-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .song-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  .song-button:hover {
    color: blue;
  }

  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 50px 1fr 50px;
    grid-template-rows: 1fr 1fr 150px 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "channel-author channel-author channel-author"
      "channel-title channel-title channel-title"
      "artwork artwork artwork"
      "now-playing-title now-playing-title now-playing-title"
      "progress-container progress-container progress-container"
      "boost-button player-controls song-button";
  }

  .channel-title {
    grid-area: channel-title;
  }

  .channel-author {
    grid-area: channel-author;
  }
  .now-playing-title {
    grid-area: now-playing-title;
  }

  .artwork {
    grid-area: artwork;
    margin: 0 auto;
  }

  .progress-container {
    grid-area: progress-container;
  }

  .player-controls {
    grid-area: player-controls;
  }

  .song-button {
    grid-area: song-button;
  }

  .boost-button {
    grid-area: boost-button;
  }
</style>
