<template>
    <div class="home-card">
        <div class="container">
            <h1>Welcome to TrialMap!</h1>
            <p>TrialMap is an end-to-end machine learning framework for optimizing trial eligibility criteria using real-world data.</p>
            <img src="../imgs/homepage_demo.png" alt="TrialMap" class="homepage-demo"/>
            <Button label="Start Your Journey Now !" @click="$emit('start')"/>
        </div>
    </div>
    
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.home-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-height: calc(100vh - 64px - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem; /* inner spacing; outer spacing handled by parent card */
  text-align: center;
}
.homepage-demo {
  width:70%;
  height: 70%;
  object-fit: cover;
  margin-bottom: 1rem;
  margin-top: 1rem;
}
</style>