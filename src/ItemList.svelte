<script>
  export let feed;
  export let activeIndex;
  export let controls;
  export let isPaused;
  export let showPubDate;
  export let activeItem;

  export let flipCardY = () => {};
</script>

<ul part="item-list">
  {#each feed?.channel?.item as item, index}
    <li part="item-card" class="item-card" class:active={index === activeIndex}>
      <button
        part="item-play-button"
        class="item-play-button control-button"
        on:click={() => {
          controls.playAudio(item, index);
          flipCardY();
        }}
      >
        <span class="material-icons" part="item-play-icon">
          {!isPaused && index === activeIndex ? "pause" : "play_arrow"}
        </span>

        <div part="item-info" class="item-info">
          <h4 part="item-title" class="item-title">{item.title}</h4>
          {#if showPubDate}
            <p part="item-date" class="item-date">
              {new Date(item.pubDate).toLocaleDateString()}
            </p>
          {/if}
        </div>
      </button>
    </li>
  {/each}
</ul>
<button part="item-list-goto-player-button" on:click={flipCardY}>
  <span part="item-list-goto-player-button-icon"> smart_display </span>
</button>

<style>
  .control-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
    width: 100%;
    height: 100%;
  }

  .control-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .item-card {
    border-bottom: 1px solid #ababab;
  }

  .item-card.active {
    background-color: #f0f7ff;
  }

  .item-info {
    flex: 1;
    overflow: hidden;
  }

  .item-title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .item-date {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
  }
</style>
