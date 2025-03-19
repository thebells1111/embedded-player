// This file registers all of your custom elements
import Player from "./Player.svelte";

// Register the custom element
customElements.define("embedded-player", Player.element);

// Enable HMR for this module (helps with development)
if (import.meta.hot) {
  import.meta.hot.accept();
}
