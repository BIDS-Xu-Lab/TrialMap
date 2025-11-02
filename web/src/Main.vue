<template>
    <div class="page">
        <Banner @home="onGoHome" />
        <div class="content">
            <HomeView v-if="activeView === 'home'" @start="onStartFromHome" />
            <StepView v-else-if="activeView === 'step'" :key="stepViewKey" :initialStep="returnToStep" :initialData="resultPayload" @result="onStepResult" />
            <ResultView v-else-if="activeView === 'result'" :result="resultPayload" @returnToSelection="onReturnToSelection" />
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
const returnToStep = ref('1')
const stepViewKey = ref(0)

function onStartFromHome() {
  // Reset state when starting fresh from home
  returnToStep.value = '1'
  resultPayload.value = {}
  stepViewKey.value++ // Force re-mount StepView
  activeView.value = 'step'
}

function onGoHome() {
  // Reset state when going home
  returnToStep.value = '1'
  resultPayload.value = {}
  activeView.value = 'home'
}

function onStepResult(payload) {
  resultPayload.value = payload
  activeView.value = 'result'
}

function onReturnToSelection(data) {
  console.log('onReturnToSelection called with data:', data)
  returnToStep.value = data?.step || '1'
  console.log('returnToStep set to:', returnToStep.value)
  console.log('resultPayload:', resultPayload.value)
  stepViewKey.value++ // Force re-mount StepView with new props
  console.log('stepViewKey incremented to:', stepViewKey.value)
  activeView.value = 'step'
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