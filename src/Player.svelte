<script>
  export let player;
  export let currentTime = 0;
  export let duration = 0;
  export let feed = {};
  export let activeItem = {};
  export let mediaSession;
  export let isPaused = true;

  import { onMount } from "svelte";

  function setupPlayer() {
    player.ontimeupdate = () => {
      currentTime = player.currentTime;
    };

    player.onloadedmetadata = () => {
      duration = player.duration;
      if (mediaSession) {
        mediaSession.metadata = new MediaMetadata({
          title: activeItem?.title || "",
          artist: feed?.channel?.author || "",
          artwork: [
            {
              src:
                activeItem?.image?.["@_href"] ||
                activeItem?.["itunes:image"]?.["@_src"] ||
                feed?.channel?.image?.["@_href"] ||
                feed?.channel?.["itunes:image"]?.["@_src"] ||
                "./lnbeats_logo_black_circle_512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      }
    };
    player.onended = async () => {
      //   playNextSong();
    };
    mediaSession = navigator.mediaSession;
    setHandlers();
  }

  onMount(setupPlayer);

  function setHandlers() {
    const actionHandlers = [
      [
        "play",
        () => {
          player.play();
          isPaused = false;
          mediaSession.playbackState = "playing";
          console.log("play");
        },
      ],
      [
        "pause",
        () => {
          player.pause();
          isPaused = true;
          mediaSession.playbackState = "paused";
          console.log("pause");
        },
      ],
      ["previoustrack", mediaGotoPreviousSong],
      ["nexttrack", mediaGotoNextSong],
      [
        "stop",
        () => {
          /* ... */
        },
      ],
      [
        "seekbackward",
        (details) => {
          player.currentTime = Math.max(player.currentTime - 10, 0);
        },
      ],
      [
        "seekforward",
        (details) => {
          print(details);
          player.currentTime = Math.min(
            player.currentTime + 30,
            player.duration
          );
        },
      ],
      [
        "seekto",
        (details) => {
          print(details);
        },
      ],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch (error) {
        print(`The media session action "${action}" is not supported yet.`);
      }
    }
  }

  async function mediaGotoNextSong() {
    //   playNextSong();
  }

  async function mediaGotoPreviousSong() {
    //   playPreviousSong();
  }
</script>

<svelte:head>
  {#if activeItem.title}
    <title
      >Playing:
      {activeItem?.title} -
      {feed?.channel?.author}</title
    >
  {/if}
</svelte:head>

<audio
  disableRemotePlayback
  playsinline
  preload="metadata"
  bind:this={player}
/>

<style>
</style>
