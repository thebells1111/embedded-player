// This file registers all of your custom elements
import App from "./App.svelte";

// Register the custom element
customElements.define("embedded-player", App.element);

// Enable HMR for this module (helps with development)
if (import.meta.hot) {
  import.meta.hot.accept();
}
