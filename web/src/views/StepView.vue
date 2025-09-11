<template>
  <div class="card">
    <Stepper v-model:value="activeStep" linear>
      <StepItem value="1">
        <Step>Cancer Type</Step>
        <StepPanel>
          <div class="panel-content">
            <p>Select a cancer type:</p>
            <div v-for="(item, idx) in cancerType" :key="item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
              <RadioButton v-model="selectedCancerType" :value="item" :inputId="`ct-${idx}`" name="cancer-type" />
              <label :for="`ct-${idx}`">{{ item }}</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <Button label="Next" :disabled="!selectedCancerType" @click="onclickNextCancerType()" />
          </div>
        </StepPanel>
      </StepItem>
      <StepItem value="2">
        <Step>Treatment</Step>
        <StepPanel>
          <div class="panel-content">
            <p>Select a trial (treatment regimens and line of therapy will be pre-set):</p>
            <div v-for="(item, idx) in treatment" :key="item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
              <RadioButton v-model="selectedTreatment" :value="item" :inputId="`t-${idx}`" name="treatment" />
              <label :for="`t-${idx}`">{{ item }}</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <Button label="Undo" severity="secondary" @click="onclickUndoButton('2')" />
            <Button label="Next" @click="onclickNextTreatment()" />
          </div>
        </StepPanel>
      </StepItem>
      <StepItem value="3">
        <Step>Endpoint</Step>
        <StepPanel>
          <div class="panel-content"><p>Select an endpoint:</p><div v-for="(item, idx) in endpoint" :key="item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
              <RadioButton v-model="selectedEndpoint" :value="item" :inputId="`e-${idx}`" name="endpoint" />
              <label :for="`e-${idx}`">{{ item }}</label>
            </div></div>
          <div style="display:flex;gap:8px;">
            <Button label="Undo" severity="secondary" @click="onclickUndoButton('3')" />
            <Button label="Next" @click="onclickNextEndpoint()" />
          </div>
        </StepPanel>
      </StepItem>
      <StepItem value="4">
        <Step>Criteria</Step>
        <StepPanel>
          <div class="panel-content">
            <h3 style="margin: 0 0 12px 0;">Select the eligibility criteria:</h3>
            <DataTable :value="filteredCriteria" tableStyle="min-width: 40rem">
              <Column header="#">
                <template #body="{ index }">{{ index + 1 }}</template>
              </Column>
              <Column field="type" header="type" />
              <Column field="criteria_description" header="criteria" />
              <Column header="Must apply" style="width: 8rem; text-align:center;">
                <template #body="{ data, index }">
                  <div style="display:flex;justify-content:center;">
                    <Checkbox v-model="selectedCriteria" :value="data.criteria_name" :inputId="`crit-${index}`" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <Button label="Undo" severity="secondary" @click="onclickUndoButton('4')" />
            <Button label="Result" @click="goResult" />
          </div>
        </StepPanel>
      </StepItem>
    </Stepper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Stepper from 'primevue/stepper'
import StepItem from 'primevue/stepitem'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import * as XLSX from 'xlsx'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
const activeStep = ref('1')
const emit = defineEmits(['result'])

const metadata = ref([])
const cancerType = ref([])
const treatment = ref([])
const endpoint = ref([
  'Overall survival (OS)',
  'Progression-free survival (PFS)'
])
// keep original trial-criteria rows and a derived list for the UI
const trialCriteriaRows = ref([])
const trialCriteria = ref([])
const criteria = ref([])
const filteredCriteria = ref([])
const selectedCancerType = ref('')
const selectedTreatment = ref('')
const selectedEndpoint = ref('')
const selectedCriteria = ref([])
onMounted(async () => {
  try {
    // Resolve the asset URL via Vite
    const url = new URL('../data/sample_data.xlsx', import.meta.url)
    const res = await fetch(url)
    const ab = await res.arrayBuffer()
    const wb = XLSX.read(ab, { type: 'array' })

    const metadataSheet = wb.SheetNames[0]
    const wsMetadata = wb.Sheets[metadataSheet]
    metadata.value = XLSX.utils.sheet_to_json(wsMetadata, { defval: null })
    
    const trialCriteriaSheet = wb.SheetNames[1]
    const wsTrialCriteria = wb.Sheets[trialCriteriaSheet]
    trialCriteriaRows.value = XLSX.utils.sheet_to_json(wsTrialCriteria, { defval: null })

    const criteriaSheet = wb.SheetNames[2]
    const wsCriteria = wb.Sheets[criteriaSheet]
    criteria.value = XLSX.utils.sheet_to_json(wsCriteria, { defval: null })

    cancerType.value =[ ...new Set(metadata.value.map(item => item.cancer_type))]
  } catch (err) {
    console.error('Failed to read Excel:', err)
  }
})
function onclickUndoButton(currentStep) {
  console.log('Undo button clicked for step:', currentStep)
  if (currentStep === '2') {
    selectedCancerType.value = ''
    selectedTreatment.value = ''
    treatment.value = []
  } else if (currentStep === '3') {
    selectedTreatment.value = ''
    selectedEndpoint.value = ''
    // clear derived list only; keep original rows intact
    trialCriteria.value = []
    filteredCriteria.value = []
  } else if (currentStep === '4') {
    selectedEndpoint.value = ''
    selectedCriteria.value = []
  }
  activeStep.value = `${currentStep - 1}`
}

function onclickNextCancerType() {
  console.log('Selected Cancer Type:', selectedCancerType.value)
  treatment.value =[ ...new Set(metadata.value.filter(item => item.cancer_type === selectedCancerType.value).map(item => item.trial_name))]
  console.log('Parsed Excel treatment:', treatment.value)
  activeStep.value = '2'
}

function onclickNextTreatment() {
  console.log('Selected Treatment:', selectedTreatment.value)
  // derive from original rows, do not overwrite original data
  trialCriteria.value = [
    ...new Set(
      trialCriteriaRows.value
        .filter(item => item.trial_name === selectedTreatment.value)
        .map(item => item.criteria_name)
    )
  ]
  console.log('Parsed Excel trialCriteria:', trialCriteria.value)
  // derive rows from criteria by name
  filteredCriteria.value = criteria.value.filter(row =>
    trialCriteria.value.includes(row.criteria_name)
  )
  console.log('Derived filteredCriteria rows:', filteredCriteria.value)
  activeStep.value = '3'
}

function onclickNextEndpoint() {
  console.log('Selected Endpoint:', selectedEndpoint.value)
  activeStep.value = '4'
}

function goResult() {
  emit('result', {
    selectedCancerType: selectedCancerType.value,
    selectedTreatment: selectedTreatment.value,
    selectedEndpoint: selectedEndpoint.value,
    selectedCriteria: selectedCriteria.value
  })
}
</script>

<style scoped>
.card {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
}
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem; border: 1px solid 
  #ccc; margin-bottom: 0.5rem;
  border-radius: 8px;
}
</style>
