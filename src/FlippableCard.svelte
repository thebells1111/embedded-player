<script>
  export let rotationDegree = 0;
  export let hideFlipButton = false;

  export let flipCard = () => {
    // Always increment by 180 degrees for consistent direction
    rotationDegree += 180;
  };
</script>

<div class="flip-card-container">
  <div class="flip-card">
    <div
      class="flip-card-inner"
      style="transform: rotateY({rotationDegree}deg)"
    >
      <div class="flip-card-front">
        <slot name="front"></slot>
        {#if !hideFlipButton}
          <button class="flip-button" on:click={flipCard}>Flip</button>
        {/if}
      </div>
      <div class="flip-card-back">
        <slot name="back"></slot>
        {#if !hideFlipButton}
          <button class="flip-button" on:click={flipCard}>Flip</button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .flip-card-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .flip-card {
    width: 100%;
    height: 100%;
    perspective: 1000px; /* 3D effect */
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden; /* Safari */
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    border-radius: 10px;
  }

  .flip-card-front {
    background-color: #f9f9f9;
    color: #333;
  }

  .flip-card-back {
    background-color: #e9e9e9;
    color: #333;
    transform: rotateY(180deg);
  }

  .content {
    flex: 1;
    overflow: auto;
  }

  .flip-button {
    align-self: center;
    padding: 8px 16px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 15px;
  }

  .flip-button:hover {
    background-color: #357abd;
  }
</style>
