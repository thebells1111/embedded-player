<script>
  import FlippableCard from "./FlippableCard.svelte";
  import Player from "./Player.svelte";
  import SongList from "./SongList.svelte";
  import { onMount } from "svelte";
  import xmlToJson from "./functions/xmlToJson";

  // Props with defaults
  export let feedUrl = "";
  export let skipTime = 30; // Skip time in seconds

  // State variables
  let feed;
  let player;
  let activeSong;
  let activeIndex;
  let isPaused = true;
  let currentTime = 0;
  let duration = 0;
  let isLoading = true;

  // Create a controls object to hold all player control functions
  const controls = {
    // Toggle play/pause
    togglePlayPause() {
      if (!player || !activeSong) {
        // If no song is active, play the first one
        if (feed?.channel?.item && feed.channel.item.length > 0) {
          this.playAudio(feed.channel.item[0], 0);
        }
        return;
      }

      if (isPaused) {
        player.play();
      } else {
        player.pause();
      }
    },

    // Play specific track
    playAudio(item, index) {
      if (activeIndex === index) {
        this.togglePlayPause();
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
    },

    // Skip forward/backward
    skipAudio(seconds) {
      if (player && !isNaN(player.duration)) {
        player.currentTime = Math.min(
          Math.max(0, player.currentTime + seconds),
          player.duration
        );
      }
    },

    // Play next track
    playNext() {
      if (feed?.channel?.item && activeIndex < feed.channel.item.length - 1) {
        this.playAudio(feed.channel.item[activeIndex + 1], activeIndex + 1);
      }
    },

    // Play previous track
    playPrevious() {
      // If current time > 3 seconds, go to start of current track
      if (player && player.currentTime > 3) {
        player.currentTime = 0;
      }
      // Otherwise go to previous track
      else if (feed?.channel?.item && activeIndex > 0) {
        this.playAudio(feed.channel.item[activeIndex - 1], activeIndex - 1);
      }
    },

    // Handle progress bar clicks
    handleProgressClick(e) {
      if (!player || isNaN(duration) || duration === 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      player.currentTime = pos * duration;
    },
  };

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

  let rotationDegree = 0;
  let flipCard = () => {
    // Always increment by 180 degrees for consistent direction
    rotationDegree += 180;
  };
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
    <span class="material-icons" part="loading-icon">hourglass_top</span>
    <p part="loading-text">Loading podcast...</p>
  </div>
{:else if feed}
  hi
  <main>
    <!-- Hidden audio element -->
    <audio bind:this={player}></audio>

    <div class="card-wrapper">
      <FlippableCard>
        <div class="flippable front" slot="front">
          <Player
            {feed}
            {activeSong}
            {duration}
            {currentTime}
            {controls}
            {skipTime}
            {flipCard}
          />
        </div>

        <div class="flippable back" slot="y-back">
          <SongList
            {feed}
            {controls}
            {isPaused}
            bind:activeIndex
            bind:activeSong
            {flipCard}
            showPubDate={false}
          />
        </div>
      </FlippableCard>
    </div>
  </main>
{:else}
  <div part="error" class="error">
    <span class="material-icons" part="error-icon">error</span>
    <p part="error-text">Could not load podcast feed.</p>
  </div>
{/if}

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .card-wrapper {
    width: 400px;
    height: 300px;
    margin: 40px auto;
  }
  .flippable {
    height: 100%;
    overflow: hidden;
  }

  /* Loading and error states */
  .loading,
  .error {
    text-align: center;
    padding: 2rem;
  }
</style>
