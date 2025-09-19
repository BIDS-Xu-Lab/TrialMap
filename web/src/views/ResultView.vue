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
                    <DataTable :value="regimenRows" tableStyle="min-width: 16rem" class="small-table" size="small">
                        <Column field="label" header="name" />
                        <Column field="value" header="value" />
                    </DataTable>
                </div>

                <div class="r-card">
                    <h3 class="r-title">Endpoint</h3>
                    <div class="r-value">{{ result?.selectedEndpoint || '-' }}</div>
                </div>

                <div class="r-card push-down">
                    <h3 class="r-title">Criteria</h3>
                    <DataTable :value="criteriaTableRows" tableStyle="min-width: 24rem" class="criteria-table" size="small" :rowClass="criteriaRowClass" scrollable scrollHeight="320px">
                        <Column header="#" :style="{width:'40px'}">
                            <template #body="{ index }">{{ index + 1 }}</template>
                        </Column>
                        <Column field="type" header="type" :style="{width:'90px'}" />
                        <Column field="criteria_description" header="criteria">
                            <template #body="{ data }">
                                <div class="criteria-desc">{{ data.criteria_description }}</div>
                            </template>
                        </Column>
                        <Column header="must" :style="{width:'90px', textAlign:'center'}">
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
                <div  v-if="(Top4PathwaysResult && Top4PathwaysResult.length > 0)" class="right-stack">
                    <div class="r-card" style="min-height: 240px;">
                        <div class="r-card-header">
                            <h3 class="r-title">Top 4 Pathways</h3>
                            <Button class="ml-2" size="small" @click="onResetSort">
                                Reset 
                                <FontAwesomeIcon :icon="['fas', 'arrows-rotate']" />
                            </Button>
                        </div>
                        <DataTable ref="topTableRef" v-model:selection="selectedTopPath" v-model:sortField="sortField" v-model:sortOrder="sortOrder" sortMode="single" :value="Top4PathwaysResult" selectionMode="single" :metaKeySelection="false" dataKey="path_id" rowHover tableStyle="margin-top: 24px;" size="large" @rowSelect="onTopSelect" @rowUnselect="onTopUnselect">
                            <Column field="pathName" header="Paths" />
                            <Column field="hr" header="HR" sortable dataType="numeric">
                                <template #body="{ data }">{{ format2(data.hr) }}</template>
                            </Column>
                            <Column field="ae" header="AE" sortable dataType="numeric">
                                <template #body="{ data }">{{ format2(data.ae) }}</template>
                            </Column>
                            <Column field="number_of_patients" header="# of Patients" sortable dataType="numeric">
                                <template #body="{ data }">{{ data.number_of_patients }}</template>
                            </Column>
                            <Column field="ease" header="EASE" sortable dataType="numeric">
                                <template #body="{ data }">{{ format2(data.ease) }}</template>
                            </Column>
                            <Column field="g_index" header="G-Index" sortable dataType="numeric">
                                <template #body="{ data }">{{ format2(data.g_index) }}</template>
                            </Column>
                            <Column field="selog_hr" header="selogHR" sortable dataType="numeric">
                                <template #body="{ data }">{{ format2(data.selog_hr) }}</template>
                            </Column>
                        </DataTable>
                    </div>
                    <div class="r-card" style="min-height: 240px;">
                        <div class="r-card-header">
                            <h3 class="r-title">Charts</h3>
                        </div>
                        <div class="r-card-content">
                            <div v-for="item in Top4PathwaysResult" :key="item.path_id">
                                <div class="r-card-content-item">
                                    <Chart type="radar" :data="getChartData(item)" :options="getChartOptions()" class="chart-radar" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="r-card r-card-empty" style="flex: 1;">
                    result not found
                </div>
            </div>
        </div>
    </div>
 </template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import * as XLSX from 'xlsx'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const props = defineProps({
    result: { type: Object, default: () => ({}) }
})

const resultRelatedMetadata = ref({})
const Top4PathwaysResult = ref([])
const Top4PathwaysColumns = ref([])
const regimenRows = ref([])
const criteriaTableRows = ref([])
const criteriaNameToIndex = computed(() => {
    const map = new Map()
    ;(criteriaTableRows.value || []).forEach((row, idx) => {
        const key = String(row?.criteria_name ?? '').trim().toLowerCase()
        if (key) map.set(key, idx)
    })
    return map
})
const selectedSet = computed(() => new Set(props.result.selectedCriteria || []))
const selectedCriteriaPath = ref([])
const selectedTopPath = ref(null)
const topTableRef = ref(null)
const sortField = ref(null)
const sortOrder = ref(null)

onMounted(async () => {
    const base = import.meta.env.BASE_URL || '/'
    const metaUrl = `${base}data/meta_data.xlsx`
    let metaRows = []
    let trialCriteriaRows = []
    let criteriaRows = []
    try {
        const res = await fetch(metaUrl)
        if (!res.ok) throw new Error('meta not found')
        const ct = (res.headers.get('content-type') || '').toLowerCase()
        if (ct.includes('text/html')) throw new Error('unexpected html')
        const ab = await res.arrayBuffer()
        const wb = XLSX.read(ab, { type: 'array' })

        const wsMetadata = wb.Sheets[wb.SheetNames[0]]
        const wsTrialCriteria = wb.Sheets[wb.SheetNames[1]]
        const wsCriteria = wb.Sheets[wb.SheetNames[2]]

        metaRows = wsMetadata ? XLSX.utils.sheet_to_json(wsMetadata, { defval: null }) : []
        trialCriteriaRows = wsTrialCriteria ? XLSX.utils.sheet_to_json(wsTrialCriteria, { defval: null }) : []
        criteriaRows = wsCriteria ? XLSX.utils.sheet_to_json(wsCriteria, { defval: null }) : []
    } catch (e) {
        metaRows = []
        trialCriteriaRows = []
        criteriaRows = []
    }

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
    const csvUrl = `${base}data/trail_dataset/${props.result.selectedTreatment}_results_web.csv`
    try {
        const csvRes = await fetch(csvUrl)
        if (csvRes.ok) {
            const ct = (csvRes.headers.get('content-type') || '').toLowerCase()
            if (ct.includes('text/html')) {
                Top4PathwaysResult.value = []
            } else {
                try {
                    const csvText = await csvRes.text()
                    const csvWb = XLSX.read(csvText, { type: 'string' })
                    const csvWs = csvWb.Sheets[csvWb.SheetNames[0]]
                    const trailResult = csvWs ? XLSX.utils.sheet_to_json(csvWs, { defval: null }) : []
                    Top4PathwaysResult.value = getTop4Pathways(
                      trailResult,
                      props.result.selectedCriteria,
                      props.result.selectedEndpoint,
                      criteriaNameToIndex.value
                    )
                } catch (e) {
                    Top4PathwaysResult.value = []
                }
            }
        } else {
            Top4PathwaysResult.value = []
        }
    } catch (e) {
        Top4PathwaysResult.value = []
    }
})

function format2(v) {
    const n = Number(v)
    if (!Number.isFinite(n)) return '-'
    return n.toFixed(2)
}

function getTop4Pathways(trailResult, criteria, endpoint, criteriaNameToIndex) {
    const normalize = (s) => String(s ?? '').trim().toLowerCase()
    const selectedSet = new Set((criteria ?? []).map(normalize))

    // Filter rows where row.criteria (comma-separated) contains all selected tokens
    let filtered = trailResult.filter((row) => {
        const rowTokens = String(row.criteria ?? '')
            .split(',')
            .map(normalize)
        const rowSet = new Set(rowTokens)
        for (const token of selectedSet) {
            if (!rowSet.has(token)) return false
        }
        return true
    })

    // Sort by SUCRA based on endpoint and take top 4
    const key = endpoint === 'Overall survival (OS)' ? 'sucra_os' : 'sucra_pfs'
    filtered = filtered
        .sort((a, b) => Number(b[key] ?? -Infinity) - Number(a[key] ?? -Infinity))
        .slice(0, 4)

    // attach linkage: indices of criteria rows and a user-facing path name
    return filtered.map((row, idx) => {
        const rowTokens = String(row.criteria ?? '').split(',').map(normalize)
        const indices = rowTokens
          .map((t) => criteriaNameToIndex.get(t))
          .filter((v) => Number.isInteger(v))
        const uniqueSorted = Array.from(new Set(indices)).sort((a, b) => a - b)
        const displayIndices = uniqueSorted.map((i) => i + 1)
        const labelId = String(
          row.path_id ?? row.paths ?? row.pathId ?? row.path ?? `#${idx + 1}`
        ).trim()
        const metricKeys = endpoint === 'Overall survival (OS)'
          ? { srcHr: 'hr_os', srcSelog: 'selog_hr_os', srcSucra: 'sucra_os' }
          : { srcHr: 'hr_pfs', srcSelog: 'selog_hr_pfs', srcSucra: 'sucra_pfs' }
        const res = {
          path_id: labelId,
          pathName: `${labelId}${displayIndices.length ? ` (${displayIndices.join(',')})` : ''}`,
          criteriaIndices: uniqueSorted,
          ae: row.ae,
          ease: row.ease,
          g_index: row.g_index,
          number_of_patients: row.number_of_patients
        }
        if (row[metricKeys.srcHr] != null) res.hr = row[metricKeys.srcHr]
        if (row[metricKeys.srcSelog] != null) res.selog_hr = row[metricKeys.srcSelog]
        if (row[metricKeys.srcSucra] != null) res.sucra = row[metricKeys.srcSucra]
        return res
    })
}

// interaction: highlight criteria rows by indices
function criteriaRowClass(rowData, meta) {
    const idx = (meta && typeof meta.index === 'number')
      ? meta.index
      : criteriaTableRows.value.findIndex(r => r === rowData || r?.criteria_name === rowData?.criteria_name)
    const isSelected = selectedCriteriaPath.value.includes(idx)
    return isSelected ? { 'crit-selected': true } : ''
}
function onTopSelect(event) {
    const row = event?.data || event
    selectedCriteriaPath.value = Array.isArray(row?.criteriaIndices) ? row.criteriaIndices : []
}
function onTopUnselect() {
    selectedCriteriaPath.value = []
}
function onResetSort() {
    sortField.value = null
    sortOrder.value = null
    if (topTableRef?.value) {
        const tmp = [...Top4PathwaysResult.value]
        Top4PathwaysResult.value = []
        queueMicrotask(() => (Top4PathwaysResult.value = tmp))
    }
}

function getMaxes() {
    const rows = Top4PathwaysResult.value || []
    return {
        hr: Math.max(1, ...rows.map(r => Number(r.hr) || 0)),
        selog_hr: Math.max(1, ...rows.map(r => Number(r.selog_hr) || 0)),
        ae: Math.max(1, ...rows.map(r => Number(r.ae) || 0)),
        ease: Math.max(1, ...rows.map(r => Number(r.ease) || 0)),
        g_index: Math.max(1, ...rows.map(r => Number(r.g_index) || 0)),
        number_of_patients: Math.max(1, ...rows.map(r => Number(r.number_of_patients) || 0))
    }
}

function normalize(value, max) {
    const v = Number(value) || 0
    const m = Number(max) || 1
    if (m <= 0) return 0
    const n = v / m
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0
}

function getChartData(item) {
    const maxes = getMaxes()
    const gap = 0.1
    const values = [
        normalize(item.hr, maxes.hr), gap,
        normalize(item.selog_hr, maxes.selog_hr), gap,
        normalize(item.ae, maxes.ae), gap,
        normalize(item.ease, maxes.ease), gap,
        normalize(item.g_index, maxes.g_index), gap,
        normalize(item.number_of_patients, maxes.number_of_patients), gap
    ]
    return {
        labels: ['HR', '', 'selogHR', '', 'AE', '', 'EASE', '', 'G-Index', '', '# of Patients', ''],
        datasets: [
            {
                label: item.pathName,
                data: values,
                fill: true,
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderColor: 'rgba(16,185,129,0.7)',
                pointRadius: 0,
                borderWidth: 1
            }
        ]
    }
}

function getChartOptions() {
    return {
        plugins: {
            legend: { display: true }
        },
        layout: {
            padding: { top: 10 }
        },
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 1,
                ticks: {
                    stepSize: 0.25,
                    color: 'rgba(17, 24, 39, 0.35)',
                    backdropColor: 'transparent'
                }
            }
        }
    }
}
</script>

<style scoped>
.result { padding: 0; text-align: left; }
.result-layout { display: grid; grid-template-columns: 3fr 5fr; gap: 10px; align-items: start; }
.col-left, .col-right { display: flex; flex-direction: column; gap: 12px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.r-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; }
.r-card-content { display: flex; flex-direction: row; gap: 12px; }
/* chart container width for PrimeVue Chart */
.r-card-content-item { width: 240px; }
.r-title { margin: 0 0 4px 0; font-size: 15px; font-weight: 600; }
.r-value { color: #111827; font-size: 13px; }
.small-table :deep(.p-datatable) { font-size: 12px; }
.criteria-table :deep(.p-datatable) { font-size: 11px; table-layout: fixed; }
.criteria-table :deep(.p-datatable .p-datatable-thead > tr > th) { padding: 3px 6px; }
.criteria-table :deep(.p-datatable .p-datatable-tbody > tr > td) { padding: 3px 6px; }
.criteria-desc {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.result :deep(tr.crit-hover) > td { background-color: #f0fdf4; }
.result :deep(tr.crit-selected) > td { background-color: #dcfce7; }
.interactive-cell { cursor: pointer; }
.r-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}
.r-card-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  color: #6b7280;
  font-size: 14px;
}
.push-down { margin-top: 6px; }
.right-stack { display: flex; flex-direction: column; gap: 12px; }
</style>