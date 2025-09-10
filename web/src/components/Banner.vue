<template>
    <div class="banner" @click="$emit('home')">
        <h1 class="banner-title">
            <font-awesome-icon :icon="['fas', 'route']" />
            TrialMap   
        </h1>
    </div>
    
</template>

<script setup>
defineEmits(['home'])
</script>

<style scoped>
.banner {
  height: 128px;
  background-color: #e7fff2;
  display: flex;
  align-items: center;
  padding: 0 48px;
  justify-content: space-between;
  color: rgb(0, 0, 0);
  border-bottom: 2px solid #0b8538;
}
.banner-title {
  font-size: 32px;
  font-weight: 600;
  cursor: pointer;
}
</style>