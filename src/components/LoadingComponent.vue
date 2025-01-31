<script setup lang="ts">
defineProps<{
    fullPage?: boolean;
}>();
</script>

<template>
    <div :class="[
        'flex items-center justify-center',
        fullPage ? 'fixed inset-0 bg-white bg-opacity-90 z-50' : 'w-full h-full min-h-screen'
    ]">
        <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p class="text-indigo-600 text-sm font-medium">Loading...</p>
        </div>
    </div>
</template>
