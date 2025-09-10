<template>
    <div class="card">
      <Stepper v-model:value="activeStep">
        <StepItem value="1">
          <Step>Step 1</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel-content">Content 1</div>
            <Button label="Next" @click="activateCallback('2')" />
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step>Step 2</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel-content">Content 2</div>
            <Button label="Next" severity="secondary" @click="activateCallback('1')" />
            <Button label="Next" @click="activateCallback('3')" />
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step>Step 3</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel-content">Content 3</div>
            <Button label="Back" severity="secondary" @click="activateCallback('2')" />
          </StepPanel>
        </StepItem>
      </Stepper>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Stepper from 'primevue/stepper'
  import StepItem from 'primevue/stepitem'
  import Step from 'primevue/step'
  import StepPanel from 'primevue/steppanel'
  import Button from 'primevue/button'
  
  const activeStep = ref('1')
  </script>
  
  <style scoped>
  .card { padding: 16px; }
  .panel-content { padding: 1rem; border: 1px dashed #ccc; margin-bottom: 0.5rem; }
  </style>