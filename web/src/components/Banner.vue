<template>
    <div class="banner" @click="$emit('home')">
        <h1 class="banner-title">
            <font-awesome-icon :icon="['fas', 'route']" style="color: #1ca40a;" />
            TrialMap   
        </h1>
    </div>
    
</template>

<script setup>
defineEmits(['home'])
</script>

<style scoped>
.banner {
  height: 64px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 48px;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}
.banner-title {
  font-size: 24px;
  font-weight: 600;
  color: #1ca40a;
  cursor: pointer;
}
</style>