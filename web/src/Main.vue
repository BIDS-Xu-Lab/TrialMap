<template>
    <div class="page">
        <Banner @home="activeView = 'home'" />
        <div class="content">
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
.page {
  --page-bg: rgb(241, 245, 259);      /* page background color */
  --content-gap: 32px;     /* ≈ 1rem: outer spacing around card */
  --card-radius: 12px;     /* card border radius */
  --card-padding: 16px;    /* inner padding inside card */

  min-height: 100vh;
  background-color: var(--page-bg);
  display: flex;
  flex-direction: column;
}

.content {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--content-gap);
  width: 100%;
  flex: 1;
  display: block;
}

@media (min-width: 1440px) {
  .content {
    padding-left: calc(var(--content-gap) * 0.75);
    padding-right: calc(var(--content-gap) * 0.75);
  }
}
</style>