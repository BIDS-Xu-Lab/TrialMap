<template>
    <div class="result">
        <div class="result-layout">
            <div class="col-left">
                <div class="row-2">
                    <div class="r-card">
                        <h3 class="r-title">Cancer</h3>
                        <div class="r-value">{{ result?.selectedCancerType || '-' }}</div>
                    </div>
                    <div class="r-card">
                        <h3 class="r-title">Line of Therapy</h3>
                        <div class="r-value">{{ resultRelatedMetadata.lineOfTherapy ?? '-' }}</div>
                    </div>
                </div>

                <div class="r-card">
                    <h3 class="r-title">Regimens</h3>
                    <DataTable :value="regimenRows" tableStyle="min-width: 16rem" class="small-table">
                        <Column field="label" header="name" />
                        <Column field="value" header="value" />
                    </DataTable>
                </div>

                <div class="r-card">
                    <h3 class="r-title">Endpoint</h3>
                    <div class="r-value">{{ result?.selectedEndpoint || '-' }}</div>
                </div>

                <div class="r-card">
                    <h3 class="r-title">Criteria</h3>
                    <DataTable :value="criteriaTableRows" tableStyle="min-width: 24rem" class="criteria-table">
                        <Column header="#" :style="{width:'40px'}">
                            <template #body="{ index }">{{ index + 1 }}</template>
                        </Column>
                        <Column field="type" header="type" :style="{width:'90px'}" />
                        <Column field="criteria_description" header="criteria">
                            <template #body="{ data }">
                                <div class="criteria-desc">{{ data.criteria_description }}</div>
                            </template>
                        </Column>
                        <Column header="must have" :style="{width:'90px', textAlign:'center'}">
                            <template #body="{ data }">
                                <div style="display:flex;justify-content:center;">
                                    <i v-if="selectedSet.has(data.criteria_name)" class="pi pi-check" style="color:#16a34a;"></i>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="col-right">
                <div class="r-card" style="min-height: 240px;"></div>
            </div>
        </div>
    </div>
 </template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import * as XLSX from 'xlsx'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
const props = defineProps({
    result: { type: Object, default: () => ({}) }
})

const resultRelatedMetadata = ref({})
const trailResult = ref([])
const resultColumns = ref([])
const regimenRows = ref([])
const criteriaTableRows = ref([])
const selectedSet = computed(() => new Set(props.result.selectedCriteria || []))

onMounted(async () => {
    const url = new URL('../../public/data/meta_data.xlsx', import.meta.url)
    const res = await fetch(url)
    const ab = await res.arrayBuffer()
    const wb = XLSX.read(ab, { type: 'array' })

    const wsMetadata = wb.Sheets[wb.SheetNames[0]]
    const wsTrialCriteria = wb.Sheets[wb.SheetNames[1]]
    const wsCriteria = wb.Sheets[wb.SheetNames[2]]

    const metaRows = XLSX.utils.sheet_to_json(wsMetadata, { defval: null })
    const trialCriteriaRows = XLSX.utils.sheet_to_json(wsTrialCriteria, { defval: null })
    const criteriaRows = XLSX.utils.sheet_to_json(wsCriteria, { defval: null })

    const metaRow = metaRows.find(r => r.trial_name === props.result.selectedTreatment)
    const criteriaNames = new Set(
    trialCriteriaRows
        .filter(r => r.trial_name === props.result.selectedTreatment)
        .map(r => r.criteria_name)
    )
    const selectedCriteriaRows = criteriaRows.filter(r => criteriaNames.has(r.criteria_name))

    resultRelatedMetadata.value = {
    cancerType: props.result.selectedCancerType,
    trail: props.result.selectedTreatment,
    lineOfTherapy: metaRow?.line_of_therapy ?? null,
    treatment: metaRow?.treatment ?? props.result.selectedTreatment,
    control: metaRow?.control ?? null,
    endpoint: props.result.selectedEndpoint,
    criteria: selectedCriteriaRows,
    selectedCriteria: props.result.selectedCriteria
    }
    regimenRows.value = [
        { label: 'treatment', value: resultRelatedMetadata.value.treatment || '-' },
        { label: 'control', value: resultRelatedMetadata.value.control || '-' }
    ]
    criteriaTableRows.value = resultRelatedMetadata.value.criteria || []
    const filepath = `../../public/trail_dataset/${props.result.selectedTreatment}_results.csv`
    const fileUrl = new URL(filepath, import.meta.url)
    const fileRes = await fetch(fileUrl)
    if (fileRes.status === 200) {
        const fileAb = await fileRes.arrayBuffer()
        const fileWb = XLSX.read(fileAb, { type: 'array' })
        const fileSheet = fileWb.SheetNames[0]
        const fileWs = fileWb.Sheets[fileSheet]
        trailResult.value = XLSX.utils.sheet_to_json(fileWs, { defval: null })
        resultColumns.value = trailResult.value.length ? Object.keys(trailResult.value[0]) : []
        console.log('Loaded CSV rows:', trailResult.value.length)
    } else {
        console.error('File not found:', filepath)
    }
})
</script>

<style scoped>
.result { padding: 0; text-align: left; }
.result-layout { display: grid; grid-template-columns: 2fr 3fr; gap: 12px; }
.col-left, .col-right { display: flex; flex-direction: column; gap: 16px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.r-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; }
.r-title { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; }
.r-value { color: #111827; font-size: 13px; }
.small-table :deep(.p-datatable) { font-size: 12px; }
.criteria-table :deep(.p-datatable) { font-size: 11px; table-layout: fixed; }
.criteria-table :deep(.p-datatable .p-datatable-thead > tr > th) { padding: 3px 6px; }
.criteria-table :deep(.p-datatable .p-datatable-tbody > tr > td) { padding: 3px 6px; }
.criteria-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>