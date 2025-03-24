<script>
  export let rotationDegreeY = 0;
  export let rotationDegreeX = 0;
  export let hideFlipButton = false;
  export let animationDuration = 600; // Customizable animation duration in ms

  export let flipCard = (axis) => {
    // Don't allow new flips while one is in progress
    if (isFlipping) return;

    isFlipping = true;
    flipAxis = axis;

    // Ensure transitions are enabled for the flip animation
    skipTransition = false;

    // Always increment by 180 degrees for consistent direction
    if (axis === "y") {
      rotationDegreeY += 180;

      // Handle complete rotation (reset to 0 without animation)
      if (rotationDegreeY === 360) {
        setTimeout(() => {
          // Temporarily disable transition
          skipTransition = true;

          // Apply changes that should happen without animation
          rotationDegreeY = 0;

          // Re-enable transition after changes have been applied
          setTimeout(() => {
            skipTransition = false;
          }, 50);
        }, animationDuration);
      }
    } else if (axis === "x") {
      rotationDegreeX += 180;

      // Handle complete rotation (reset to 0 without animation)
      if (rotationDegreeX === 360) {
        setTimeout(() => {
          // Temporarily disable transition
          skipTransition = true;

          // Apply changes that should happen without animation
          rotationDegreeX = 0;

          // Re-enable transition after changes have been applied
          setTimeout(() => {
            skipTransition = false;
          }, 50);
        }, animationDuration);
      }
    }

    // Set a timeout to reset the isFlipping flag after animation completes
    setTimeout(() => {
      isFlipping = false;
    }, animationDuration / 2); // Add small buffer to ensure animation is complete
  };

  // Expose current state for external components
  export let isCardFlipping = () => isFlipping;

  let flipAxis = "y";
  let isFlipping = false; // Track whether a flip animation is in progress
  let skipTransition = false; // Flag to control transition skipping

  // Function to ensure we don't start a new flip while one is in progress

  // Compute the transition style based on the skipTransition flag
  $: transitionStyle = skipTransition
    ? "transform 0s"
    : `transform ${animationDuration / 1000}s`;
</script>

<div class="flip-card-container">
  <div class="flip-card" class:flipping={isFlipping}>
    <div
      class="flip-card-inner"
      style="transform: rotateY({rotationDegreeY}deg) rotateX({rotationDegreeX}deg); transition: {transitionStyle}"
    >
      <div class="flip-card-front">
        <slot name="front"></slot>
        {#if !hideFlipButton}
          <div class="flip-buttons">
            <button
              class="flip-button"
              on:click={() => flipCard("y")}
              disabled={isFlipping}
            >
              Flip Y
            </button>
            <button
              class="flip-button"
              on:click={() => flipCard("x")}
              disabled={isFlipping}
            >
              Flip X
            </button>
          </div>
        {/if}
      </div>
      <div class="flip-card-back">
        <!-- Y-axis back content -->
        <div class="y-back-content" class:active={flipAxis === "y"}>
          <slot name="y-back"></slot>
          {#if !hideFlipButton}
            <div class="flip-buttons">
              <button
                class="flip-button"
                on:click={() => flipCard("y")}
                disabled={isFlipping}
              >
                Flip Y
              </button>
            </div>
          {/if}
        </div>

        <!-- X-axis back content (always upside-down) -->
        <div class="x-back-content" class:active={flipAxis === "x"}>
          <slot name="x-back">back</slot>
          {#if !hideFlipButton}
            <div class="flip-buttons">
              <button
                class="flip-button"
                on:click={() => flipCard("x")}
                disabled={isFlipping}
              >
                Flip X
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .flip-card-container {
    width: 100%;
    height: 100%;
  }

  .flip-card {
    width: 100%;
    height: 100%;
    perspective: 1000px; /* 3D effect */
  }

  .flip-card.flipping {
    pointer-events: none; /* Disable interactions during flip */
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transform-style: preserve-3d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    /* Transition is controlled by inline style for better timing control */
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
  }

  .flip-card-back {
    background-color: #e9e9e9;
    transform: rotateY(180deg);
  }

  /* Content containers for back side */
  .y-back-content,
  .x-back-content {
    display: none; /* Hide by default */
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Show active content based on flip axis */
  .y-back-content.active,
  .x-back-content.active {
    display: flex;
  }

  /* X-axis content is always upside-down */
  .x-back-content {
    transform: rotate(180deg);
  }

  .flip-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: auto;
    padding-top: 15px;
  }

  .flip-button {
    padding: 8px 16px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .flip-button:hover:not(:disabled) {
    background-color: #357abd;
  }

  .flip-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
</style>
