<!-- filepath: universal-license-sdk/docs/.vitepress/theme/components/CodeGroup.vue -->
<template>
  <div class="code-group">
    <div class="code-group-header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['code-group-tab', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ tab }}
      </button>
    </div>
    <div class="code-group-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref(0)

// Extract tab names from slot content
const slots = defineSlots()
const tabs = computed(() => {
  return Object.keys(slots).filter(key => key !== 'default')
})
</script>

<style scoped>
.code-group {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.code-group-header {
  display: flex;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-group-tab {
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all 0.3s;
}

.code-group-tab:hover {
  color: var(--vp-c-brand);
}

.code-group-tab.active {
  color: var(--vp-c-brand);
  border-bottom: 2px solid var(--vp-c-brand);
}

.code-group-content {
  padding: 16px;
}
</style>