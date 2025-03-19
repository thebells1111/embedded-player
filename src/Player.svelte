<script>
  import { onMount } from "svelte";
  import xmlToJson from "./functions/xmlToJson";

  // Props with defaults
  export let feedUrl = "";
  export let iconSize = "24px";
  export let iconColor = "#2980b9";
  export let accentColor = "#ff5500";
  export let skipTime = 30; // Skip time in seconds
  export let showPubDate = false;

  // State variables
  let feed;
  let player;
  let activeSong;
  let activeIndex;
  let isPaused = true;
  let currentTime = 0;
  let duration = 0;
  let progress = 0;
  let isLoading = true;

  // Reactive statements
  $: imgSrc =
    activeSong?.image?.["@_href"] ||
    activeSong?.["itunes:image"]?.["@_src"] ||
    feed?.channel?.image?.["@_href"] ||
    feed?.channel?.["itunes:image"]?.["@_src"];

  $: progress = duration ? (currentTime / duration) * 100 : 0;

  // Format time from seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  onMount(async () => {
    if (feedUrl) {
      isLoading = true;
      try {
        let res = await fetch(feedUrl);
        let xml = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "application/xml");
        feed = xmlToJson(xmlDoc);
        console.log("Feed loaded:", feed?.channel?.title);

        // Set up audio event listeners
        if (player) {
          player.addEventListener("timeupdate", () => {
            currentTime = player.currentTime;
          });

          player.addEventListener("durationchange", () => {
            duration = player.duration;
          });

          player.addEventListener("volumechange", () => {
            volume = player.volume;
          });

          player.addEventListener("play", () => {
            isPaused = false;
          });

          player.addEventListener("pause", () => {
            isPaused = true;
          });

          player.addEventListener("ended", () => {
            isPaused = true;
            // Optionally auto-play next track
            if (
              feed?.channel?.item &&
              activeIndex < feed.channel.item.length - 1
            ) {
              playAudio(feed.channel.item[activeIndex + 1], activeIndex + 1);
            }
          });
        }
      } catch (error) {
        console.error("Error loading feed:", error);
      } finally {
        isLoading = false;
      }
    }
  });

  // Play/pause toggle
  function togglePlayPause() {
    if (!player || !activeSong) {
      // If no song is active, play the first one
      if (feed?.channel?.item && feed.channel.item.length > 0) {
        playAudio(feed.channel.item[0], 0);
      }
      return;
    }

    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }

  // Play specific track
  function playAudio(item, index) {
    if (activeIndex === index) {
      togglePlayPause();
    } else {
      if (player) player.pause();

      activeSong = item;
      activeIndex = index;
      const audioSrc = item?.enclosure?.["@_url"];

      if (!audioSrc) {
        console.error("No audio source found for this item");
        return;
      }

      // Set up canplay event for just this load
      player.addEventListener("canplay", function onCanPlay() {
        player.play();
        isPaused = false;
        player.removeEventListener("canplay", onCanPlay);
      });

      // Set the source and load the audio
      player.src = audioSrc;
      player.load();
    }
  }

  // Skip forward/backward
  function skipAudio(seconds) {
    if (player && !isNaN(player.duration)) {
      player.currentTime = Math.min(
        Math.max(0, player.currentTime + seconds),
        player.duration
      );
    }
  }

  // Play next track
  function playNext() {
    if (feed?.channel?.item && activeIndex < feed.channel.item.length - 1) {
      playAudio(feed.channel.item[activeIndex + 1], activeIndex + 1);
    }
  }

  // Play previous track
  function playPrevious() {
    // If current time > 3 seconds, go to start of current track
    if (player && player.currentTime > 3) {
      player.currentTime = 0;
    }
    // Otherwise go to previous track
    else if (feed?.channel?.item && activeIndex > 0) {
      playAudio(feed.channel.item[activeIndex - 1], activeIndex - 1);
    }
  }

  // Handle progress bar clicks
  function handleProgressClick(e) {
    if (!player || isNaN(duration) || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.currentTime = pos * duration;
  }
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
  <title>{feed?.channel?.title || "Podcast Player"}</title>
</svelte:head>

{#if isLoading}
  <div part="loading" class="loading">
    <span
      class="material-icons"
      part="loading-icon"
      style="--icon-size: {iconSize}; --icon-color: {iconColor};"
      >hourglass_top</span
    >
    <p part="loading-text">Loading podcast...</p>
  </div>
{:else if feed}
  <div part="container" class="container">
    <img
      part="artwork"
      class="artwork"
      src={imgSrc}
      alt={feed?.channel?.title || "Podcast"}
    />

    <h1 part="channel-title" class="channel-title">
      {feed?.channel?.title}
    </h1>
    <p part="channel-author" class="channel-author">
      {feed?.channel?.author || feed?.channel?.["itunes:author"]}
    </p>

    {#if activeSong}
      <h3 part="now-playing-title" class="now-playing-title">
        {activeSong.title}
      </h3>
    {:else}
      <h3 part="now-playing-title" class="now-playing-title"></h3>
    {/if}

    <!-- Hidden audio element -->
    <audio bind:this={player}></audio>

    <!-- Progress bar -->
    <div
      part="progress-container"
      class="progress-container"
      on:click={handleProgressClick}
    >
      <div part="progress-bar" class="progress-bar">
        <div
          part="progress-fill"
          class="progress-fill"
          style="width: {progress}%; background-color: {accentColor};"
        ></div>
      </div>
      <div part="time-display" class="time-display">
        <span part="current-time">{formatTime(currentTime)}</span>
        <span part="duration">{formatTime(duration)}</span>
      </div>
    </div>

    <!-- Main playback controls -->
    <div part="player-controls" class="player-controls">
      <button
        part="prev-button"
        class="control-button"
        on:click={playPrevious}
        style="--icon-size: {iconSize}; --icon-color: {iconColor};"
      >
        <span class="material-icons" part="prev-icon">skip_previous</span>
      </button>

      <button
        part="rewind-button"
        class="control-button"
        on:click={() => skipAudio(-skipTime)}
        style="--icon-size: {iconSize}; --icon-color: {iconColor};"
      >
        <span class="material-icons" part="rewind-icon">replay_{skipTime}</span>
      </button>

      <button
        part="play-button"
        class="control-button play-button"
        on:click={togglePlayPause}
        style="--icon-size: calc({iconSize} * 1.5); --icon-color: {iconColor};"
      >
        <span class="material-icons" part="play-icon">
          {isPaused ? "play_arrow" : "pause"}
        </span>
      </button>

      <button
        part="forward-button"
        class="control-button"
        on:click={() => skipAudio(skipTime)}
        style="--icon-size: {iconSize}; --icon-color: {iconColor};"
      >
        <span class="material-icons" part="forward-icon"
          >forward_{skipTime}</span
        >
      </button>

      <button
        part="next-button"
        class="control-button"
        on:click={playNext}
        style="--icon-size: {iconSize}; --icon-color: {iconColor};"
      >
        <span class="material-icons" part="next-icon">skip_next</span>
      </button>
    </div>

    <ul part="item-list" class="item-list">
      {#each feed?.channel?.item as item, index}
        <li
          part="item-card"
          class="item-card"
          class:active={index === activeIndex}
        >
          <div part="item-info" class="item-info">
            <h4 part="item-title" class="item-title">{item.title}</h4>
            <p part="item-date" class="item-date">
              {new Date(item.pubDate).toLocaleDateString()}
            </p>
          </div>
          <button
            part="item-play-button"
            class="item-play-button control-button"
            on:click={() => playAudio(item, index)}
            style="--icon-size: {iconSize}; --icon-color: {iconColor};"
          >
            <span class="material-icons" part="item-play-icon">
              {!isPaused && index === activeIndex ? "pause" : "play_arrow"}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <div part="error" class="error">
    <span
      class="material-icons"
      part="error-icon"
      style="--icon-size: {iconSize}; --icon-color: red;">error</span
    >
    <p part="error-text">Could not load podcast feed.</p>
  </div>
{/if}

<style>
  /* Base styles */
  .container {
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    margin: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

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
    font-size: 1.5rem;
  }

  .channel-author {
    margin: 0;
    color: #666;
  }

  .now-playing-title {
    margin: 0;
    font-size: 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .progress-container {
    cursor: pointer;
    padding: 8px;
  }

  .progress-bar {
    height: 6px;
    background-color: #ddd;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--accent-color, #ff5500);
    width: 0%;
    transition: width 0.1s linear;
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
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

  .control-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .play-button {
    background-color: #f0f0f0;
    padding: 0.75rem;
  }

  .item-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 400px;
    overflow-y: auto;
  }

  .item-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
  }

  .item-card.active {
    background-color: #f0f7ff;
  }

  .item-info {
    flex: 1;
    overflow: hidden;
  }

  .item-title {
    font-size: 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .item-date {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
  }

  .item-play-button {
    flex-shrink: 0;
  }

  /* Loading and error states */
  .loading,
  .error {
    text-align: center;
    padding: 2rem;
  }

  .container {
    display: grid;
    grid-template-columns: 150px 1fr 1fr;
    grid-template-rows: 50px 50px 50px 50px 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "artwork channel-title item-list"
      "artwork channel-author item-list"
      "artwork item-title item-list"
      "progress-container progress-container item-list"
      "player-controls player-controls item-list";
  }

  .channel-title {
    grid-area: channel-title;
  }

  .channel-author {
    grid-area: channel-author;
  }

  .item-title {
    grid-area: item-title;
  }

  .artwork {
    grid-area: artwork;
  }

  .item-list {
    grid-area: item-list;
  }

  .progress-container {
    grid-area: progress-container;
  }

  .player-controls {
    grid-area: player-controls;
  }
</style>
