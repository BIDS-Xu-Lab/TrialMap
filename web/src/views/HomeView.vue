<template>
    <div class="container">
        <h1>Welcome to TrialMap!</h1>
        <p>TrialMap is an end-to-end machine learning framework for optimizing trial eligibility criteria using real-world data.</p>
        <img src="../imgs/homepage_demo.png" alt="TrialMap" class="homepage-demo"/>
        <Button label="Start Your Journey Now !" @click="$emit('start')"/>
    </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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