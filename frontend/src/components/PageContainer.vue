<script setup lang="ts">
import { NElement, NScrollbar } from 'naive-ui'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <n-element tag="div" class="page-container">
    <!-- 1. Page Header (Fixed within the view) -->
    <div class="page-header">
      <div class="header-main">
        <h1 v-if="title" class="title">{{ title }}</h1>
        <div v-if="$slots.extra" class="extra">
          <slot name="extra"></slot>
        </div>
      </div>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      <div v-if="$slots.headerContent" class="header-content">
        <slot name="headerContent"></slot>
      </div>
    </div>

    <!-- 2. Page Content (Scrollable) -->
    <div class="page-content-wrapper">
      <n-scrollbar content-style="padding: 0 4px 24px 0;">
        <div class="page-content">
          <slot></slot>
        </div>
      </n-scrollbar>
    </div>
    
    <!-- 3. Page Footer (Optional, fixed at bottom of view) -->
    <div v-if="$slots.footer" class="page-footer">
      <slot name="footer"></slot>
    </div>
  </n-element>
</template>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Use theme vars for background if needed, but usually transparent on Body */
}

/* Header */
.page-header {
  flex-shrink: 0;
  padding-bottom: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: 'Varela Round', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--n-text-color);
  line-height: 1.2;
}

.subtitle {
  margin: 8px 0 0;
  color: var(--n-text-color-3);
  font-size: 1rem;
}

.header-content {
  margin-top: 16px;
}

/* Content */
.page-content-wrapper {
  flex: 1;
  min-height: 0; /* Critical for flex scrolling */
  position: relative;
}

.page-content {
  /* No padding here, handled by scrollbar content-style to avoid scrollbar overlap */
}

/* Footer */
.page-footer {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color);
}
</style>
