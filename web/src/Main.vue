<template>
    <div class="page">
        <Banner @home="onGoHome" @logo-click="onTrialMapLogoClick" />
        <div class="content">
            <HomeView v-if="activeView === 'home'" @start="onStartFromHome" />
            <StepView v-else-if="activeView === 'step'" :key="stepViewKey" :initialStep="returnToStep" :initialData="resultPayload" @result="onStepResult" />
            <ResultView v-else-if="activeView === 'result'" :result="resultPayload" @returnToSelection="onReturnToSelection" />
        </div>
        <div v-show="showDemoVideo" class="demo-video-overlay" @click.self="hideDemoVideo">
            <div class="demo-video-shell">
                <button class="demo-video-close" type="button" aria-label="Close video" @click="hideDemoVideo">
                    <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
                <video
                    ref="demoVideoRef"
                    class="demo-video"
                    :src="trialMapVideo"
                    controls
                    playsinline
                    preload="metadata"
                ></video>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { ref } from 'vue'
import Banner from './components/Banner.vue'
import HomeView from './views/HomeView.vue'
import StepView from './views/StepView.vue'
import ResultView from './views/ResultView.vue'
import trialMapVideo from './video_TrialMap_submitted.mp4'
const activeView = ref('home')
const resultPayload = ref({})
const returnToStep = ref('1')
const stepViewKey = ref(0)
const logoClickCount = ref(0)
const showDemoVideo = ref(false)
const demoVideoRef = ref(null)

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

function onTrialMapLogoClick() {
  logoClickCount.value += 1

  if (logoClickCount.value < 5) {
    return
  }

  logoClickCount.value = 0
  showDemoVideo.value = true

  const video = demoVideoRef.value
  if (!video) {
    return
  }

  video.currentTime = 0
  video.muted = false
  video.play().catch(() => {
    video.muted = true
    video.play().catch(() => {})
  })
}

function hideDemoVideo() {
  const video = demoVideoRef.value
  if (video) {
    video.pause()
  }

  showDemoVideo.value = false
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

.demo-video-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.demo-video-shell {
  position: relative;
  width: min(1080px, 100%);
  max-height: calc(100vh - 48px);
}

.demo-video {
  display: block;
  width: 100%;
  max-height: calc(100vh - 48px);
  background: #000000;
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
}

.demo-video-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.demo-video-close:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}

@media (min-width: 1440px) {
  .content {
    padding-left: calc(var(--content-gap) * 0.75);
    padding-right: calc(var(--content-gap) * 0.75);
  }
}
</style>
