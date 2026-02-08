<template>
  <div class="vp-features">
    <div class="container">
      <div class="vp-features-grid">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeFeatures component for displaying feature cards on homepage
</script>

<style scoped>
.vp-features {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.vp-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}
</style>