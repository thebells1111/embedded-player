<script>
  import FlippableCard from "./FlippableCard.svelte";
  import MainInfo from "./MainInfo.svelte";
  import ItemList from "./ItemList.svelte";
  import Player from "./Player.svelte";
  import Boost from "./Boost.svelte";
  import { onMount } from "svelte";
  import xmlToJson from "./functions/xmlToJson";

  // Reference to the FlipCard component instance
  let flipCardComponent;
  // Props with defaults
  export let feedUrl = "";

  // State variables
  let feed;
  let player;
  let activeItem;
  let activeIndex;
  let isPaused = true;
  let currentTime = 0;
  let duration = 0;
  let isLoading = true;
  let showBoost = false;

  // Create a controls object to hold all player control functions
  const controls = {
    // Toggle play/pause
    togglePlayPause() {
      if (!player || !activeItem) {
        // If no song is active, play the first one
        if (feed?.channel?.item && feed.channel.item.length > 0) {
          controls.playAudio(feed.channel.item[0], 0);
        }
        return;
      }

      if (isPaused) {
        player.play();
      } else {
        player.pause();
      }
      isPaused = !isPaused;
    },

    // Play specific track
    playAudio(item, index) {
      if (activeIndex === index) {
        controls.togglePlayPause();
      } else {
        if (player) player.pause();

        activeItem = item;
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

    // Play next track
    playNext() {
      if (feed?.channel?.item && activeIndex < feed.channel.item.length - 1) {
        controls.playAudio(feed.channel.item[activeIndex + 1], activeIndex + 1);
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
        controls.playAudio(feed.channel.item[activeIndex - 1], activeIndex - 1);
      }
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
        if (typeof window.webln !== "undefined") {
          showBoost = true;
        }
      }
    }
  });

  // Create functions to flip the card from the parent
  function flipCardY() {
    // Check if the card is currently flipping
    if (!flipCardComponent.isCardFlipping()) {
      flipCardComponent.flipCard("y");
    }
  }

  function flipCardX() {
    // Check if the card is currently flipping
    if (!flipCardComponent.isCardFlipping()) {
      flipCardComponent.flipCard("x");
    }
  }
</script>

<svelte:head>
  <!-- Import both regular and outlined variants -->
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
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
  <main part="app">
    <!-- Hidden audio element -->
    <Player
      bind:player
      bind:currentTime
      bind:duration
      bind:isPaused
      {feed}
      {activeItem}
    />

    <div class="card-wrapper">
      <FlippableCard bind:this={flipCardComponent} hideFlipButton={true}>
        <div class="flippable front" slot="front">
          <MainInfo
            bind:isPaused
            bind:player
            {feed}
            {activeItem}
            {duration}
            {currentTime}
            {controls}
            {flipCardY}
            {flipCardX}
            {showBoost}
          />
        </div>

        <div class="flippable back" slot="y-back">
          <ItemList
            {feed}
            {controls}
            {isPaused}
            bind:activeIndex
            bind:activeItem
            {flipCardY}
            showPubDate={false}
          />
        </div>

        <div class="flippable back" slot="x-back">
          <Boost {feed} {activeItem} {player} {flipCardX} {wallet} />
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
    width: 100%;
    height: 100%;
  }

  .card-wrapper {
    width: 100%;
    height: 100%;
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
