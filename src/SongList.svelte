<script>
  export let feed;
  export let activeIndex;
  export let controls;
  export let isPaused;
  export let showPubDate;

  export let flipCard = () => {};
</script>

<ul part="item-list" class="item-list">
  {#each feed?.channel?.item as item, index}
    <li part="item-card" class="item-card" class:active={index === activeIndex}>
      <div part="item-info" class="item-info">
        <h4 part="item-title" class="item-title">{item.title}</h4>
        {#if showPubDate}
          <p part="item-date" class="item-date">
            {new Date(item.pubDate).toLocaleDateString()}
          </p>
        {/if}
      </div>
      <button
        part="item-play-button"
        class="item-play-button control-button"
        on:click={() => {
          controls.playAudio(item, index);
          flipCard();
        }}
      >
        <span class="material-icons" part="item-play-icon">
          {!isPaused && index === activeIndex ? "pause" : "play_arrow"}
        </span>
      </button>
    </li>
  {/each}
</ul>

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
</style>
