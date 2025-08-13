<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #222222;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2678b6;
  --tg-theme-button-color: #2678b6;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f5f5f5;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

html.dark {
  --tg-theme-bg-color: #212121;
  --tg-theme-text-color: #ffffff;
  --tg-theme-hint-color: #aaaaaa;
  --tg-theme-link-color: #8cc2ff;
  --tg-theme-button-color: #2678b6;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #292929;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
