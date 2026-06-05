<template>
    <div class="banner">
        <h1 class="banner-title">
            <button class="banner-logo" type="button" aria-label="TrialMap home" @click="onLogoClick">
                <font-awesome-icon :icon="['fas', 'route']" style="color: #1ca40a;" />
                <span>TrialMap</span>
            </button>
        </h1>
    </div>
    
</template>

<script setup>
const emit = defineEmits(['home'])

function onLogoClick() {
  emit('home')
}
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
  margin: 0;
}
.banner-logo {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  font-size: 24px;
  font-weight: 600;
  font-family: inherit;
  color: #1ca40a;
  cursor: pointer;
}
.banner-logo:focus-visible {
  outline: 2px solid #1ca40a;
  outline-offset: 4px;
}
</style>
