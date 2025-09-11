<template>
    <div>
        <Banner @home="activeView = 'home'" />
        <div class="container">
            <HomeView v-if="activeView === 'home'" @start="activeView = 'step'" />
            <StepView v-else-if="activeView === 'step'" @result="onStepResult" />
            <ResultView v-else-if="activeView === 'result'" :result="resultPayload" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Banner from './components/Banner.vue'
import HomeView from './views/HomeView.vue'
import StepView from './views/StepView.vue'
import ResultView from './views/ResultView.vue'
const activeView = ref('home')
const resultPayload = ref({})

function onStepResult(payload) {
  resultPayload.value = payload
  activeView.value = 'result'
}
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>