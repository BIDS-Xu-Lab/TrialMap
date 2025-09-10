<template>
    <div>
        <Banner @home="activeView = 'home'" />
        <div class="container">
            <HomeView v-if="activeView === 'home'" @start="activeView = 'step'" />
            <StepView v-else />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Banner from './components/Banner.vue'
import HomeView from './views/HomeView.vue'
import StepView from './views/StepView.vue'

const activeView = ref('home')
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>