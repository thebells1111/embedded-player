<script>
  export let feed;
  export let activeIndex;
  export let controls;
  export let isPaused;
  export let showPubDate;
  export let activeItem;

  export let flipCardY = () => {};
</script>

<ul part="item-list-container">
  {#each feed?.channel?.item as item, index}
    <li part="item-list-card" class:active={index === activeIndex}>
      <button
        part="item-list-play-button"
        on:click={() => {
          controls.playAudio(item, index);
          flipCardY();
        }}
      >
        <span part="item-list-play-button-icon" class="material-icons">
          {!isPaused && index === activeIndex ? "pause" : "play_arrow"}
        </span>

        <div part="item-list-info">
          <h4 part="item-list-title">{item.title}</h4>
          {#if showPubDate}
            <p part="item-list-date">
              {new Date(item.pubDate).toLocaleDateString()}
            </p>
          {/if}
        </div>
      </button>
    </li>
  {/each}
</ul>
<button part="item-list-goto-player-button" on:click={flipCardY}>
  <span part="item-list-goto-player-button-icon" class="material-icons">
    smart_display
  </span>
</button>
