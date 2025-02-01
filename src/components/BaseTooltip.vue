<!-- components/BaseTooltip.vue -->
<script setup lang="ts">
defineProps<{
  text: string
}>();
</script>

<template>
  <div class="relative group">
    <slot></slot>
    <div class="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 
             transition-opacity duration-300 top-full left-1 transform -translate-x-1/2 
             mb-1 mt-1 px-2 py-1 text-sm text-white bg-indigo-800 rounded whitespace-nowrap z-50">
      {{ text }}
      <!-- Triangle pointer -->
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 
               border-4 border-transparent border-t-indigo-800">
      </div>
    </div>
  </div>
</template>