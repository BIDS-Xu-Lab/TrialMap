<template>
    <div class="home-page">
        <section class="hero" aria-labelledby="trialmap-home-title">
            <h1 id="trialmap-home-title">Welcome to TrialMap!</h1>
            <p class="hero-subtitle">
                An end-to-end AI-powered framework for optimizing trial eligibility criteria using real-world data
            </p>
            <p class="hero-tagline">
                Make trials <strong><em>Broader, Faster, Smarter</em></strong>
            </p>
            <img src="../imgs/front_cover.png" alt="TrialMap optimization dashboard preview" class="homepage-demo"/>
            <div class="hero-actions">
                <button class="demo-entry" type="button" aria-label="Watch TrialMap demo video" @click="openDemoVideo">
                    <span class="demo-thumbnail" aria-hidden="true">
                        <span class="thumbnail-play">
                            <font-awesome-icon :icon="['fas', 'play']" />
                        </span>
                    </span>
                    <span class="demo-copy">
                        <span class="demo-title">A quick demo of TrialMap</span>
                        <span class="watch-row">
                            <span class="watch-play" aria-hidden="true">
                                <font-awesome-icon :icon="['fas', 'play']" />
                            </span>
                            <span>Watch now</span>
                            <span class="demo-duration">
                                <font-awesome-icon :icon="['fas', 'clock']" />
                                <span>2 min</span>
                            </span>
                        </span>
                    </span>
                </button>
                <Button class="start-button" label="Start Your Journey Now !" @click="emit('start')"/>
            </div>
        </section>
        <div v-if="showDemoVideo" class="demo-video-overlay" @click.self="closeDemoVideo">
            <div class="demo-video-modal" role="dialog" aria-modal="true" aria-label="TrialMap demo video">
                <button class="demo-video-close" type="button" aria-label="Close video" @click="closeDemoVideo">
                    <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
                <video
                    ref="demoVideoRef"
                    class="demo-video"
                    :src="demoVideo"
                    autoplay
                    controls
                    muted
                    playsinline
                    preload="metadata"
                ></video>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { ref } from 'vue'
import demoVideo from '../video_TrialMap_submitted.mp4'

const emit = defineEmits(['start'])
const showDemoVideo = ref(false)
const demoVideoRef = ref(null)

function openDemoVideo() {
  showDemoVideo.value = true
}

function closeDemoVideo() {
  const video = demoVideoRef.value
  if (video) {
    video.pause()
  }

  showDemoVideo.value = false
}
</script>

<style scoped>
.home-page {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: calc(100vh - 64px - 64px);
  min-height: 540px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero {
  margin: 0 auto;
  width: 100%;
  max-width: 1360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 10px;
  color: #030712;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
}

.hero-subtitle {
  max-width: 1280px;
  margin: 0;
  color: #111827;
  font-size: 17px;
  line-height: 1.35;
}

.hero-tagline {
  margin: 16px 0 14px;
  color: #245c1c;
  font-size: 24px;
  line-height: 1.2;
}

.hero-tagline strong {
  font-weight: 800;
}

.homepage-demo {
  width: min(1260px, 100%);
  max-height: 355px;
  object-fit: contain;
  margin: 0 auto 18px;
  display: block;
}

.hero-actions {
  width: min(980px, 92%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 30px;
}

.demo-entry {
  border: 0;
  background: transparent;
  padding: 0;
  display: grid;
  grid-template-columns: 152px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  color: #111827;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.demo-entry:focus-visible {
  outline: 2px solid #58d000;
  outline-offset: 6px;
}

.demo-thumbnail {
  height: 86px;
  border-radius: 14px;
  background: #d6dfd1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-play,
.watch-play {
  border-radius: 50%;
  background: #58d000;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-play {
  width: 42px;
  height: 42px;
  font-size: 18px;
}

.watch-play {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.demo-copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-title {
  font-size: 17px;
  line-height: 1.25;
}

.watch-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 18px;
  line-height: 1.2;
}

.demo-duration {
  color: #b5b5b5;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: 4px;
}

.start-button {
  min-width: 220px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.demo-video-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.demo-video-modal {
  position: relative;
  width: min(1240px, 100%);
  max-height: calc(100vh - 48px);
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 24px 80px rgba(17, 24, 39, 0.22);
}

.demo-video-close {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #111827;
  cursor: pointer;
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.demo-video-close:focus-visible {
  outline: 2px solid #111827;
  outline-offset: 3px;
}

.demo-video {
  display: block;
  width: 100%;
  max-height: calc(100vh - 80px);
  background: #d6dfd1;
  border-radius: 28px;
}

@media (max-width: 1100px) {
  .hero h1 {
    font-size: 30px;
    margin-bottom: 10px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-tagline {
    font-size: 22px;
    margin: 14px 0 12px;
  }

  .homepage-demo {
    width: min(980px, 100%);
    max-height: 335px;
    margin-bottom: 16px;
  }

  .hero-actions {
    width: min(760px, 82%);
    gap: 24px;
  }

  .demo-entry {
    grid-template-columns: 142px minmax(0, 1fr);
    gap: 14px;
  }

  .demo-thumbnail {
    height: 80px;
  }

  .start-button {
    min-width: 210px;
    height: 42px;
    font-size: 15px;
  }
}

@media (max-width: 850px) {
  .hero-actions {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 28px;
  }

  .demo-entry {
    width: 100%;
    max-width: 560px;
  }
}

@media (max-width: 700px) {
  .hero {
    padding: 8px 0 24px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .hero-subtitle,
  .demo-title,
  .watch-row {
    font-size: 15px;
  }

  .hero-tagline {
    font-size: 19px;
  }

  .homepage-demo {
    width: 100%;
  }

  .demo-entry {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 14px;
  }

  .demo-copy,
  .watch-row {
    align-items: center;
    justify-content: center;
  }

  .demo-thumbnail {
    height: 150px;
  }

  .start-button {
    width: 100%;
    min-width: 0;
    max-width: 360px;
  }
}
</style>
