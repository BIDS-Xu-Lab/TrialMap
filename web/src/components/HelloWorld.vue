<script setup>
defineProps({
  msg: {
    type: String,
    default: 'Hello World',
  },
})
</script>

<template>
  <div class="card">
    <h2>{{ msg }}</h2>
  </div>
  
</template>

<style scoped>

</style>

