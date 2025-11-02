<template>
  <div class="card">
    <div class="step-layout">
      <div class="step-left">
        <Stepper v-model:value="activeStep" linear>
      <StepItem value="1">
        <Step>
          <div class="step-title">
            <span class="step-title-text">
              Cancer Type
            </span>
            <span class="step-title-value">
              {{ getShortName(selectedCancerType) }}
            </span>
          </div>
        </Step>
        <StepPanel></StepPanel>
      </StepItem>
      <StepItem value="2">
        <Step>
          <div class="step-title">
            <span class="step-title-text">
            Tiral
            </span>
            <span class="step-title-value">
              {{ selectedTreatment }}
            </span>
          </div>
        </Step>
        <StepPanel></StepPanel>
      </StepItem>
      <StepItem value="3">
        <Step>
          <div class="step-title">
            <span class="step-title-text">
            Endpoint
            </span>
            <span class="step-title-value">
              {{ getShortName(selectedEndpoint) }}
            </span>
          </div>
        </Step>
        <StepPanel></StepPanel>
      </StepItem>
      <StepItem value="4">
        <Step>
          <div class="step-title">
            <span class="step-title-text">
            Criteria
          </span>
            <span class="step-title-value">
              {{ selectedCriteria && selectedCriteria.length ? (selectedCriteria.length + ' selected') : '' }}
            </span>
          </div>
        </Step>
        <StepPanel></StepPanel>
      </StepItem>
        </Stepper>
      </div>
      <div class="step-right">
        <div class="panel-content" v-if="activeStep === '1'">
          <p>Select a cancer type:</p>
          <div v-for="(item, idx) in cancerType" :key="item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
            <RadioButton v-model="selectedCancerType" :value="item" :inputId="`ct-${idx}`" name="cancer-type" />
            <label :for="`ct-${idx}`">{{ item }}</label>
          </div>
          <div style="display:flex;gap:8px; margin-top: 8px;">
            <Button label="Next" :disabled="!selectedCancerType" @click="onclickNextCancerType()" />
          </div>
        </div>

        <div class="panel-content" v-else-if="activeStep === '2'">
          <p>Select a trial (treatment regimens and line of therapy are pre-set):</p>
          <div v-for="(item, idx) in treatment" :key="item" style="margin: 6px 0;">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <RadioButton v-model="selectedTreatment" :value="item" :inputId="`t-${idx}`" name="treatment" style="margin-top: 2px;" />
              <div style="flex: 1;">
                <label :for="`t-${idx}`" style="font-weight: 500; cursor: pointer;">{{ item }}</label>
                <div class="trial-meta" v-if="getTrialMetadata(item)">
                  <div class="trial-meta-item">
                    <span class="trial-meta-label">Line of therapy:</span>
                    <span class="trial-meta-value">{{ getTrialMetadata(item).line_of_therapy || '-' }}</span>
                  </div>
                  <div class="trial-meta-item">
                    <span class="trial-meta-label">Treatment:</span>
                    <span class="trial-meta-value">{{ getTrialMetadata(item).treatment || '-' }}</span>
                  </div>
                  <div class="trial-meta-item">
                    <span class="trial-meta-label">Control:</span>
                    <span class="trial-meta-value">{{ getTrialMetadata(item).control || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px; margin-top: 8px;">
            <Button label="Back" severity="secondary" @click="onclickBackButton('2')" />
            <Button label="Next" @click="onclickNextTreatment()" :disabled="!selectedTreatment" />
          </div>
        </div>

        <div class="panel-content" v-else-if="activeStep === '3'">
          <p>Select an endpoint:</p>
          <div v-if="isAHNC" class="note">For advanced head and neck cancer, the Flatiron Health database does not capture disease progression information.</div>
          <div v-for="(item, idx) in endpoint" :key="item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
            <RadioButton v-model="selectedEndpoint" :value="item" :inputId="`e-${idx}`" name="endpoint" :disabled="isAHNC && item === 'Progression-free survival (PFS)'" />
            <label :for="`e-${idx}`">{{ item }}</label>
          </div>
          <div style="display:flex;gap:8px; margin-top: 8px;">
            <Button label="Back" severity="secondary" @click="onclickBackButton('3')" />
            <Button label="Next" @click="onclickNextEndpoint()" :disabled="!selectedEndpoint" />
          </div>
        </div>

        <div class="panel-content" v-else-if="activeStep === '4'">
          <h3 style="margin: 0 0 12px 0;">Select the eligibility criteria:</h3>
          <div class="table-card">
            <div v-if="!filteredCriteria || filteredCriteria.length === 0" class="empty-box">No criteria found for current selection</div>
            <div v-else>
              <div class="note" style="margin-bottom: 12px;">
                Below are the original eligibility criteria from the reference trial. <strong>TrialMap</strong> relaxes these criteria and evaluates all feasible combinations using real-world data. <strong>"Must apply"</strong> indicates fixed criteria that cannot be relaxed.
              </div>
            <DataTable :value="filteredCriteria" tableStyle="min-width: 40rem">
              <Column header="#">
                <template #body="{ index }">{{ index + 1 }}</template>
              </Column>
              <Column field="type" header="type" />
              <Column field="criteria_description" header="criteria" />
              <Column header="Must apply" style="width: 8rem; text-align:center;">
                <template #body="{ data, index }">
                  <div style="display:flex;justify-content:center;">
                    <Checkbox v-model="selectedCriteria" :value="data.criteria_name" :inputId="`crit-${index}`" :disabled="data.must_apply" />
                  </div>
                </template>
              </Column>
            </DataTable>
            </div>
          </div>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <Button label="Back" severity="secondary" @click="onclickBackButton('4')" />
            <Button label="Result" @click="goResult" :disabled="!filteredCriteria || filteredCriteria.length === 0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const props = defineProps({
  initialStep: { type: String, default: '1' },
  initialData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['result'])
const activeStep = ref('1')

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
const isAHNC = ref(false)
// keep a set of criteria names that must be applied for current trial
const mustApplyCriteria = ref(new Set())
// set of normalized criteria tokens that actually appear in the trial CSV
const availableCriteriaTokens = ref(new Set())
onMounted(async () => {
  try {
    console.log('StepView mounted with initialStep:', props.initialStep)
    console.log('StepView mounted with initialData:', props.initialData)
    
    // Only flush if starting fresh (not returning from result page)
    if (props.initialStep === '1' || !props.initialData || Object.keys(props.initialData).length === 0) {
      console.log('Flushing all data')
      flushAll()
    }
    
    const base = import.meta.env.BASE_URL || '/'
    const url = `${base}data/meta_data.xlsx`
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

    // Restore state if returning from result page
    if (props.initialStep !== '1' && props.initialData && Object.keys(props.initialData).length > 0) {
      console.log('Restoring state and setting activeStep to:', props.initialStep)
      await restoreState(props.initialData)
      activeStep.value = props.initialStep
      console.log('activeStep set to:', activeStep.value)
    }
  } catch (err) {
    console.error('Failed to read Excel:', err)
  }
})

// Restore previous selections when returning from result page
async function restoreState(data) {
  if (data.selectedCancerType) {
    selectedCancerType.value = data.selectedCancerType
    treatment.value = [...new Set(metadata.value.filter(item => item.cancer_type === data.selectedCancerType).map(item => item.trial_name))]
    isAHNC.value = String(data.selectedCancerType).trim().toLowerCase() === 'advanced head and neck cancer (ahnc)'
  }
  
  if (data.selectedTreatment) {
    selectedTreatment.value = data.selectedTreatment
    const rowsForTrial = trialCriteriaRows.value.filter(item => item.trial_name === data.selectedTreatment)
    trialCriteria.value = [...new Set(rowsForTrial.map(item => item.criteria_name))]
    
    const mustSet = new Set(
      rowsForTrial
        .filter(item => {
          const v = item.must_apply
          if (v === null || v === undefined) return false
          const s = String(v).trim().toLowerCase()
          return s !== '' && s !== '0' && s !== 'false' && s !== 'no'
        })
        .map(item => item.criteria_name)
    )
    mustApplyCriteria.value = mustSet
    
    availableCriteriaTokens.value = await computeAvailableTokensForTrial(data.selectedTreatment, rowsForTrial)
    
    const normalize = (s) => String(s ?? '').trim().toLowerCase()
    filteredCriteria.value = criteria.value
      .filter(row => trialCriteria.value.includes(row.criteria_name))
      .map(row => {
        const name = normalize(row.criteria_name)
        const hasData = availableCriteriaTokens.value.has(name)
        return { ...row, must_apply: mustSet.has(row.criteria_name), no_data: !hasData }
      })
  }
  
  if (data.selectedEndpoint) {
    selectedEndpoint.value = data.selectedEndpoint
  }
  
  if (data.selectedCriteria) {
    selectedCriteria.value = data.selectedCriteria
  }
}
function onclickBackButton(currentStep) {
  console.log('Back button clicked for step:', currentStep)
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
    mustApplyCriteria.value = new Set()
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
  isAHNC.value = String(selectedCancerType.value).trim().toLowerCase() === 'advanced head and neck cancer (ahnc)'
  activeStep.value = '2'
}

async function onclickNextTreatment() {
  console.log('Selected Treatment:', selectedTreatment.value)
  // derive from original rows, do not overwrite original data
  const rowsForTrial = trialCriteriaRows.value.filter(item => item.trial_name === selectedTreatment.value)
  trialCriteria.value = [
    ...new Set(rowsForTrial.map(item => item.criteria_name))
  ]
  // compute must-apply set for this trial
  const mustSet = new Set(
    rowsForTrial
      .filter(item => {
        const v = item.must_apply
        if (v === null || v === undefined) return false
        const s = String(v).trim().toLowerCase()
        return s !== '' && s !== '0' && s !== 'false' && s !== 'no'
      })
      .map(item => item.criteria_name)
  )
  mustApplyCriteria.value = mustSet
  console.log('Parsed Excel trialCriteria:', trialCriteria.value)
  // compute availability from CSV for the selected trial
  availableCriteriaTokens.value = await computeAvailableTokensForTrial(selectedTreatment.value, rowsForTrial)
  // derive rows from criteria by name
  const normalize = (s) => String(s ?? '').trim().toLowerCase()
  filteredCriteria.value = criteria.value
    .filter(row => trialCriteria.value.includes(row.criteria_name))
    .map(row => {
      const name = normalize(row.criteria_name)
      const hasData = availableCriteriaTokens.value.has(name)
      return { ...row, must_apply: mustSet.has(row.criteria_name), no_data: !hasData }
    })
  console.log('Derived filteredCriteria rows:', filteredCriteria.value)
  activeStep.value = '3'
}

function onclickNextEndpoint() {
  console.log('Selected Endpoint:', selectedEndpoint.value)
  if (isAHNC.value && selectedEndpoint.value === 'Progression-free survival (PFS)') {
    selectedEndpoint.value = ''
    return
  }
  // preselect and lock must-apply criteria for the upcoming step
  selectedCriteria.value = Array.from(mustApplyCriteria.value)
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

// read trial CSV and extract normalized criteria tokens that actually appear
async function computeAvailableTokensForTrial(trialName, fallbackRows) {
  const normalize = (s) => String(s ?? '').trim().toLowerCase()
  try {
    const base = import.meta.env.BASE_URL || '/'
    const csvUrl = `${base}data/trail_dataset/${trialName}_results_web.csv`
    const res = await fetch(csvUrl)
    if (!res.ok) throw new Error('csv not found')
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (ct.includes('text/html')) throw new Error('unexpected html')
    const csvText = await res.text()
    const wb = XLSX.read(csvText, { type: 'string' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = ws ? XLSX.utils.sheet_to_json(ws, { defval: null }) : []
    const tokens = new Set()
    rows.forEach((row) => {
      String(row?.criteria ?? '')
        .split(',')
        .map(normalize)
        .filter(Boolean)
        .forEach((t) => tokens.add(t))
    })
    return tokens
  } catch (e) {
    // fallback: treat all criteria listed for this trial as available
    const tokens = new Set()
    ;(fallbackRows || []).forEach((r) => tokens.add(normalize(r.criteria_name)))
    return tokens
  }
}

function flushAll() {
  selectedCancerType.value = ''
  selectedTreatment.value = ''
  selectedEndpoint.value = ''
  selectedCriteria.value = []
}

function getShortName(cancerType) {
  // just get the text between ( and )
  const match = cancerType.match(/\(([^)]+)\)/)
  return match ? match[1] : cancerType
}

function getTrialMetadata(trialName) {
  return metadata.value.find(item => item.trial_name === trialName)
}
</script>

<style scoped>
.card {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10);
}
.step-title { display: flex; flex-direction: column; align-items: flex-start; }
.step-title-text { font-size: 14px; margin: 0 0 4px 0; }
.step-title-value { font-size: 12px; color: #6b7280; }
.step-layout { display: grid; grid-template-columns: 260px 1fr; gap: 12px; align-items: stretch; }
.step-left { position: sticky; top: 12px; align-self: stretch; height: 100%; }
.step-right { min-height: 300px; }
.step-left :deep(.p-stepper) { height: 100%; }
.step-left :deep(.p-stepper-nav) { height: 100%; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; }
.table-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: center; /* center DataTable horizontally */
}
.empty-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #6b7280;
  font-size: 14px;
  width: 100%;
}
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem; border: 1px solid 
  #ccc; margin-bottom: 0.5rem;
  border-radius: 8px;
}
.note { color: #374151; font-size: 12px; background: #F9FAFB; border: 1px dashed #E5E7EB; padding: 8px 10px; border-radius: 6px; }

.trial-meta {
  margin-top: 4px;
  padding-left: 0;
}

.trial-meta-item {
  display: flex;
  gap: 6px;
  margin: 1px 0;
  font-size: 12px;
  line-height: 1.4;
}

.trial-meta-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 110px;
}

.trial-meta-value {
  color: #374151;
}
</style>
