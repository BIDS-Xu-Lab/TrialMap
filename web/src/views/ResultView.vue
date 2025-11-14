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
                        <h3 class="r-title">Trial</h3>
                        <div class="r-value">{{ result?.selectedTreatment ?? '-' }}</div>
                    </div>
                </div>

                <div class="r-card">
                    <h3 class="r-title">Regimens</h3>
                    <div class="regimens">
                        <div class="regimen-line">
                            <span class="regimen-label">Treatment:</span>
                            <span class="regimen-value">{{ resultRelatedMetadata.treatment || '-' }}</span>
                        </div>
                        <div class="regimen-line">
                            <span class="regimen-label">Control:</span>
                            <span class="regimen-value">{{ resultRelatedMetadata.control || '-' }}</span>
                        </div>
                    </div>
                </div>
                <div class="row-2">
                    <div class="r-card">
                        <h3 class="r-title">Endpoint</h3>
                        <div class="r-value">{{ result?.selectedEndpoint || '-' }}</div>
                    </div>
                    <div class="r-card">
                        <h3 class="r-title">Line of Therapy</h3>
                        <div class="r-value">{{ resultRelatedMetadata.lineOfTherapy ?? '-' }}</div>
                    </div>
                </div>
    

                <div class="r-card push-down">
                    <h3 class="r-title">Criteria</h3>
                    <DataTable :value="criteriaTableRows" tableStyle="min-width: 24rem" class="criteria-table" size="small" :rowClass="criteriaRowClass">
                        <Column header="#" :style="{width:'40px'}">
                            <template #body="{ index }">{{ index + 1 }}</template>
                        </Column>
                        <Column field="type" header="type" :style="{width:'90px'}" />
                        <Column field="criteria_description" header="criteria">
                            <template #body="{ data }">
                                <div class="criteria-desc" style="display:flex;align-items:flex-start;gap:6px;">
                                    <span class="criteria-text" v-tooltip.top="data.criteria_description">{{ truncateText(data.criteria_description, 20) }}</span>
                                    <i class="pi pi-info-circle" v-tooltip.top="data.criteria_description" style="color:#6b7280; cursor: help; margin-left: auto;"></i>
                                </div>
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
                <div v-if="isLoading" class="r-card r-card-empty" style="flex: 1;">
                    <ProgressSpinner style="width:40px;height:40px" strokeWidth="6" />
                </div>
                <div  v-else-if="(Top4PathwaysResult && Top4PathwaysResult.length > 0)" class="right-stack">
                    <div class="r-card" style="min-height: 240px;">
                        <div class="r-card-header">
                            <div class="r-header-left">
                                <h3 class="r-title" style="display:flex;align-items:center;gap:6px;">
                                    Top paths
                                    <i class="pi pi-info-circle" v-tooltip.top="`By uncertainty-aware ranking`" style="color:#6b7280; cursor: help; font-size:14px; line-height:1; font-weight:normal;"></i>
                                </h3>
                                <Button class="ml-2" size="small" @click="onResetSort"> 
                                    Reset 
                                    <FontAwesomeIcon :icon="['fas', 'arrows-rotate']" />
                                </Button>
                            </div>
                            <Button size="small" severity="secondary" @click="onReturnToSelection">Return to Selection</Button>
                        </div>
                        <div class="top-paths-table-container">
                            <DataTable ref="topTableRef" v-model:selection="selectedTopPath" v-model:sortField="sortField" v-model:sortOrder="sortOrder" sortMode="single" :value="virtualPathwaysData" scrollable scrollHeight="280px" tableStyle="min-width: 50rem" :virtualScrollerOptions="{ lazy: true, onLazyLoad: loadPathwaysLazy, itemSize: 60, delay: 200, showLoader: true, loading: lazyLoading, numToleratedItems: 10 }" selectionMode="single" :metaKeySelection="false" dataKey="path_id" rowHover size="large" @rowSelect="onTopSelect" @rowUnselect="onTopUnselect" @sort="onSort">
                            <Column field="pathName" header="">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Combinations of eligibility criteria`">
                                        <b style="line-height:1;">Paths</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="60%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? data.pathName : '-' }}</template>
                            </Column>
                            <Column field="hr" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Treatment efficacy (hazard ratio)`">
                                        <b style="line-height:1;">HR</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="40%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? format2(data.hr) : '-' }}</template>
                            </Column>
                            <Column field="ae" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Safety (adverse event rate)`">
                                        <b style="line-height:1;">AE</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="40%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? format2(data.ae) : '-' }}</template>
                            </Column>
                            <Column field="number_of_patients" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Feasibility (number of eligible patients in EHR data)`">
                                        <b style="line-height:1;"># of Patients</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="50%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? data.number_of_patients : '-' }}</template>
                            </Column>
                            <Column field="ease" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Validity (systematic error measured by EASE score)`">
                                        <b style="line-height:1;">EASE</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="40%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? format2(data.ease) : '-' }}</template>
                            </Column>
                            <Column field="g_index" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Generalizability (distance from the overall population)`">
                                        <b style="line-height:1;">G-Index</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="40%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? format2(data.g_index) : '-' }}</template>
                            </Column>
                            <Column field="selog_hr" header="" sortable dataType="numeric">
                                <template #header>
                                    <div style="display:flex;align-items:center;gap:4px;" v-tooltip.top="`Efficiency (standard error of logHR)`">
                                        <b style="line-height:1;">selogHR</b>
                                        <i class="pi pi-info-circle" style="color:#6b7280; cursor: help; font-size:14px; line-height:1;"></i>
                                    </div>
                                </template>
                                <template #loading>
                                    <div class="flex items-center" style="height: 17px; flex-grow: 1; overflow: hidden;">
                                        <Skeleton width="50%" height="1rem" />
                                    </div>
                                </template>
                                <template #body="{ data }">{{ data ? format2(data.selog_hr) : '-' }}</template>
                            </Column>
                        </DataTable>
                        </div>
                    </div>
                    <div class="r-card" style="min-height: 240px;">
                        <div class="r-card-header">
                            <div class="r-header-left">
                                <h3 class="r-title">Origami Plots (alternative of Radar plots)</h3>
                                <p class="r-title-description">Scores are normalized, higher values indicate better performance.</p>
                            </div>
                        </div>
                        <div class="r-card-content">
                            <div v-for="chartItem in chartDataList" :key="chartItem.path_id" :class="{ 'chart-selected': selectedTopPath && selectedTopPath.path_id === chartItem.path_id }">
                                <div class="r-card-content-item">
                                    <Chart type="radar" :data="chartItem.data" :options="chartOptions" class="chart-radar" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="r-card r-card-empty" style="flex: 1;">
                    result not found
                </div>
                <div class="r-card">
                    <div class="r-card-header">
                        <h3 class="r-title">References</h3>
                    </div>
                    <div class="r-card-content references-content">
                        <ol class="references-list">
                            <li class="reference-item">
                                Duan, R., Tong, J., Sutton, A. J., Asch, D. A., Chu, H., Schmid, C. H., & Chen, Y. (2023). Origami plot: a novel multivariate data visualization tool that improves radar chart. <em>Journal of clinical epidemiology</em>, 156, 85-94.
                            </li>
                            <li class="reference-item">
                                Lu, Y., Tong, J., Lei, Y., Sutton, A. J., Chu, H., Levine, L. D., ... & Chen, Y. (2024). OrigamiPlot: An R Package and Shiny Web App Enhanced Visualizations for Multivariate Data. <em>arXiv preprint arXiv:2411.12674</em>.
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>
 </template>

<script setup>
import {ref, onMounted, computed, watch, shallowRef, nextTick} from 'vue'
import * as XLSX from 'xlsx'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ProgressSpinner from 'primevue/progressspinner'
import Skeleton from 'primevue/skeleton'
const props = defineProps({
    result: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['returnToSelection'])

const resultRelatedMetadata = ref({})
const isLoading = ref(true)
const Top4PathwaysResult = ref([])
const AllPathwaysResult = ref([])
const Top4PathwaysColumns = ref([])
const normParams = ref({})
const criteriaTableRows = ref([])
const virtualPathwaysData = ref([])
const lazyLoading = ref(false)
const loadLazyTimeout = ref(null)
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

// 缓存 chart options，避免不必要的重新渲染
const chartOptions = computed(() => ({
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
}))

// 缓存图表数据，避免每次渲染都创建新对象
const chartDataList = shallowRef([])

function updateChartDataList() {
    const p = normParams.value || {}
    chartDataList.value = Top4PathwaysResult.value.map(item => {
        const gap = 0.25
        const values = [
            normalizeRangeValue(item.hr, p.hr), gap,
            normalizeRangeValue(item.selog_hr, p.selog_hr), gap,
            normalizeRangeValue(item.ae, p.ae), gap,
            normalizeRangeValue(item.ease, p.ease), gap,
            normalizeRangeValue(item.g_index, p.g_index), gap,
            normalizeRangeValue(item.number_of_patients, p.number_of_patients), gap
        ]
        return {
            path_id: item.path_id,
            data: {
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
    })
}

// 只在 Top4PathwaysResult 或 normParams 变化时更新图表数据
watch([Top4PathwaysResult, normParams], () => {
    updateChartDataList()
}, { 
    deep: false, // 不使用深度监听，避免不必要的更新
    immediate: false // 不在初始化时立即执行，因为会在 onMounted 中手动调用
})

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
    criteriaTableRows.value = resultRelatedMetadata.value.criteria || []
    const csvUrl = `${base}data/trail_dataset/${props.result.selectedTreatment}_results_web.csv`
    isLoading.value = true
    try {
        const csvRes = await fetch(csvUrl)
        if (csvRes.ok) {
            const ct = (csvRes.headers.get('content-type') || '').toLowerCase()
            if (ct.includes('text/html')) {
                AllPathwaysResult.value = []
                Top4PathwaysResult.value = []
            } else {
                try {
                    const csvText = await csvRes.text()
                    const csvWb = XLSX.read(csvText, { type: 'string' })
                    const csvWs = csvWb.Sheets[csvWb.SheetNames[0]]
                    const trailResult = csvWs ? XLSX.utils.sheet_to_json(csvWs, { defval: null }) : []
                    // build full filtered result set first
                    AllPathwaysResult.value = buildAllPathways(
                        trailResult,
                        props.result.selectedCriteria,
                        props.result.selectedEndpoint,
                        criteriaNameToIndex.value
                    )
                    // normalization params are always based on the entire CSV
                    normParams.value = computeNormalizationParams(
                        trailResult,
                        props.result.selectedEndpoint
                    )
                    // show initial Top 4 (default by SUCRA)
                    updateDisplayedTop4()
                    // initialize chart data
                    updateChartDataList()
                    // initialize virtual array for lazy loading with placeholder objects
                    const sorted = getSortedData()
                    virtualPathwaysData.value = Array.from({ length: sorted.length }, (_, i) => ({ 
                        path_id: `placeholder-${i}`,
                        pathName: '',
                        hr: null,
                        ae: null,
                        ease: null,
                        g_index: null,
                        selog_hr: null,
                        number_of_patients: null
                    }))
                } catch (e) {
                    AllPathwaysResult.value = []
                    Top4PathwaysResult.value = []
                }
            }
        } else {
            AllPathwaysResult.value = []
            Top4PathwaysResult.value = []
        }
    } catch (e) {
        AllPathwaysResult.value = []
        Top4PathwaysResult.value = []
    } finally {
        isLoading.value = false
    }
})

function format2(v) {
    const n = Number(v)
    if (!Number.isFinite(n)) return '-'
    return n.toFixed(2)
}

function buildAllPathways(trailResult, criteria, endpoint, criteriaNameToIndex) {
    const normalize = (s) => String(s ?? '').trim().toLowerCase()
    const selectedSet = new Set((criteria ?? []).map(normalize))

    // Build a set of all criteria tokens that actually appear in CSV rows
    const availableTokens = new Set(
        (trailResult || [])
            .flatMap((row) => String(row?.criteria ?? '').split(',').map(normalize))
            .filter((t) => t)
    )

    // Ignore selected criteria that never appear in this trial's CSV
    const effectiveSelected = new Set(
        Array.from(selectedSet).filter((t) => availableTokens.has(t))
    )

    // Pre-compute indices of missing-but-selected criteria to always display on paths
    const missingSelectedIndices = Array.from(selectedSet)
        .filter((t) => !availableTokens.has(t))
        .map((t) => criteriaNameToIndex.get(t))
        .filter((v) => Number.isInteger(v))
        .sort((a, b) => a - b)

    // Filter rows where row.criteria (comma-separated) contains all selected tokens
    const filtered = trailResult.filter((row) => {
        const rowTokens = String(row.criteria ?? '')
            .split(',')
            .map(normalize)
        const rowSet = new Set(rowTokens)
        // If nothing effectively selected, include row
        if (effectiveSelected.size === 0) return true
        for (const token of effectiveSelected) {
            if (!rowSet.has(token)) return false
        }
        return true
    })

    // Map to UI items, keep all rows
    const keyMap = endpoint === 'Overall survival (OS)'
        ? { srcHr: 'hr_os', srcSelog: 'selog_hr_os', srcSucra: 'sucra_os' }
        : { srcHr: 'hr_pfs', srcSelog: 'selog_hr_pfs', srcSucra: 'sucra_pfs' }

    return filtered.map((row, idx) => {
        const rowTokens = String(row.criteria ?? '').split(',').map(normalize)
        const indices = rowTokens
            .map((t) => criteriaNameToIndex.get(t))
            .filter((v) => Number.isInteger(v))
        // Merge with missing-but-selected indices for display/highlight
        const mergedIndices = Array.from(new Set([...indices, ...missingSelectedIndices])).sort((a, b) => a - b)
        const displayIndices = mergedIndices.map((i) => i + 1)
        const labelId = String(
            row.path_id ?? row.paths ?? row.pathId ?? row.path ?? `#${idx + 1}`
        ).trim()
        const item = {
            path_id: labelId,
            pathName: `${displayIndices.length ? `${displayIndices.join(',')}` : ''}`,
            criteriaIndices: mergedIndices,
            ae: row.ae,
            ease: row.ease,
            g_index: row.g_index,
            number_of_patients: row.number_of_patients
        }
        if (row[keyMap.srcHr] != null) item.hr = row[keyMap.srcHr]
        if (row[keyMap.srcSelog] != null) item.selog_hr = row[keyMap.srcSelog]
        if (row[keyMap.srcSucra] != null) item.sucra = row[keyMap.srcSucra]
        return item
    })
}

function getSortedData() {
    const field = sortField.value
    const order = typeof sortOrder.value === 'number' ? sortOrder.value : null
    const asNumber = (v, fb) => {
        const n = Number(v)
        return Number.isFinite(n) ? n : fb
    }
    const metric = field || 'sucra'
    const isDefault = field == null
    // For default (SUCRA): higher is better (desc). Otherwise respect sortOrder (1 asc, -1 desc)
    const factor = isDefault ? -1 : (order === -1 ? -1 : 1)
    const fallbackAsc = factor === 1 ? Infinity : -Infinity
    const sorted = [...(AllPathwaysResult.value || [])].sort((a, b) => {
        const av = asNumber(a?.[metric], fallbackAsc)
        const bv = asNumber(b?.[metric], fallbackAsc)
        if (av === bv) return 0
        return av > bv ? factor : -factor
    })
    return sorted
}

function updateDisplayedTop4() {
    const sorted = getSortedData()
    const newTop4 = sorted.slice(0, 4)
    // 只有当数据真正变化时才更新，避免不必要的重新渲染
    const currentIds = Top4PathwaysResult.value.map(item => item.path_id).join(',')
    const newIds = newTop4.map(item => item.path_id).join(',')
    if (currentIds !== newIds || Top4PathwaysResult.value.length === 0) {
        Top4PathwaysResult.value = newTop4
    }
}

function loadPathwaysLazy(event) {
    if (!lazyLoading.value) {
        lazyLoading.value = true
    }
    
    if (loadLazyTimeout.value) {
        clearTimeout(loadLazyTimeout.value)
    }
    
    // 模拟异步加载，避免阻塞 UI
    loadLazyTimeout.value = setTimeout(() => {
        const sorted = getSortedData()
        let _virtualPathways = [...virtualPathwaysData.value]
        let { first, last } = event
        
        // 确保虚拟数组长度与排序后的数据长度一致
        if (_virtualPathways.length !== sorted.length) {
            _virtualPathways = Array.from({ length: sorted.length }, (_, i) => ({ 
                path_id: `placeholder-${i}`,
                pathName: '',
                hr: null,
                ae: null,
                ease: null,
                g_index: null,
                selog_hr: null,
                number_of_patients: null
            }))
        }
        
        // 确保索引范围有效
        const validLast = Math.min(last, sorted.length)
        const validFirst = Math.max(0, Math.min(first, sorted.length))
        
        // 加载所需页面的数据
        const loadedData = sorted.slice(validFirst, validLast)
        
        // 填充虚拟数组的页面数据
        for (let i = 0; i < loadedData.length; i++) {
            const targetIndex = validFirst + i
            if (targetIndex < _virtualPathways.length) {
                _virtualPathways[targetIndex] = loadedData[i]
            }
        }
        
        virtualPathwaysData.value = _virtualPathways
        lazyLoading.value = false
    }, 100)
}

watch([sortField, sortOrder], () => {
    updateDisplayedTop4()
    // 重置虚拟数组，触发重新加载
    const sorted = getSortedData()
    virtualPathwaysData.value = Array.from({ length: sorted.length }, (_, i) => ({ 
        path_id: `placeholder-${i}`,
        pathName: '',
        hr: null,
        ae: null,
        ease: null,
        g_index: null,
        selog_hr: null,
        number_of_patients: null
    }))
    // 立即加载第一页数据
    nextTick(() => {
        const itemSize = 60
        const visibleRows = Math.ceil(280 / itemSize) + 5 // 可见行数 + 缓冲
        loadPathwaysLazy({ first: 0, last: visibleRows })
    })
})

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
function onSort(event) {
    // 排序改变时，重置虚拟数组并立即加载第一页数据
    const sorted = getSortedData()
    virtualPathwaysData.value = Array.from({ length: sorted.length }, (_, i) => ({ 
        path_id: `placeholder-${i}`,
        pathName: '',
        hr: null,
        ae: null,
        ease: null,
        g_index: null,
        selog_hr: null,
        number_of_patients: null
    }))
    updateDisplayedTop4()
    // 立即加载第一页数据
    nextTick(() => {
        // 手动触发懒加载，加载第一页
        const itemSize = 60
        const visibleRows = Math.ceil(280 / itemSize) + 5 // 可见行数 + 缓冲
        loadPathwaysLazy({ first: 0, last: visibleRows })
    })
}
function onResetSort() {
    sortField.value = null
    sortOrder.value = null
    updateDisplayedTop4()
}

function onReturnToSelection() {
    emit('returnToSelection', { step: '4' })
}

function computeNormalizationParams(allRows, endpoint) {
    const getNums = (rows, key) => rows.map(r => Number(r?.[key])).filter(n => Number.isFinite(n))
    const hrKey = endpoint === 'Overall survival (OS)' ? 'hr_os' : 'hr_pfs'
    const selogKey = endpoint === 'Overall survival (OS)' ? 'selog_hr_os' : 'selog_hr_pfs'
    const makeParams = (arr, reverse) => {
        const has = Array.isArray(arr) && arr.length > 0
        const min = has ? Math.min(...arr) : 0
        const max = has ? Math.max(...arr) : 0
        return { min, max, reverse, min_val: 0.4, max_val: 1 }
    }
    return {
        hr: makeParams(getNums(allRows, hrKey), true),
        selog_hr: makeParams(getNums(allRows, selogKey), true),
        ae: makeParams(getNums(allRows, 'ae'), true),
        ease: makeParams(getNums(allRows, 'ease'), true),
        g_index: makeParams(getNums(allRows, 'g_index'), false),
        number_of_patients: makeParams(getNums(allRows, 'number_of_patients'), false)
    }
}

function normalizeRangeValue(x, params) {
    const v = Number(x)
    if (!Number.isFinite(v) || !params) return 0.4
    const min = Number(params.min)
    const max = Number(params.max)
    const denom = max - min
    if (!(denom > 0)) return params.min_val ?? 0.4
    let norm01 = params.reverse ? (max - v) / denom : (v - min) / denom
    if (!Number.isFinite(norm01)) norm01 = 0
    norm01 = Math.max(0, Math.min(1, norm01))
    const a = params.min_val ?? 0.4
    const b = params.max_val ?? 1
    return norm01 * (b - a) + a
}

function truncateText(text, maxLen) {
    const s = String(text ?? '')
    if (s.length <= maxLen) return s
    return s.slice(0, maxLen) + '...'
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
.r-title-description { margin: 0; font-size: 12px; color: #6b7280; }
.r-value { color: #111827; font-size: 13px; }
.regimens { display: flex; flex-direction: column; gap: 4px; }
.regimen-line { color: #111827; font-size: 13px; }
.regimen-label { font-weight: 600; margin-right: 6px; color: #374151; }
.regimen-value { color: #111827; }
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
  justify-content: space-between;
}
.r-header-left { display: flex; flex-direction: column; align-items: flex-start; }
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
.top-paths-table-container {
  position: relative;
}
.top-paths-table-container :deep(.p-datatable .p-datatable-thead > tr > th) {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
}
/* 滚动条样式：静止时隐藏，滚动时显示 */
.top-paths-table-container :deep(.p-datatable-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.top-paths-table-container :deep(.p-datatable-wrapper:hover),
.top-paths-table-container :deep(.p-datatable-wrapper:active) {
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
.top-paths-table-container :deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}
.top-paths-table-container :deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}
.top-paths-table-container :deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: transparent;
  border-radius: 4px;
}
.top-paths-table-container :deep(.p-datatable-wrapper:hover::-webkit-scrollbar-thumb),
.top-paths-table-container :deep(.p-datatable-wrapper:active::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
}
/* 高亮选中的雷达图 - 绿色边框 */
.chart-selected {
  border: 3px solid #16a34a;
  border-radius: 8px;
  padding: 4px;
}
.references-content { padding: 8px; }
.references-list {
  margin: 0;
  padding-left: 20px;
  list-style-position: outside;
}
.references-list li::marker {
  content: '[' counter(list-item) '] ';
}
.reference-item {
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #111827;
}
.reference-item:last-child {
  margin-bottom: 0;
}
.reference-item em {
  font-style: italic;
  color: #374151;
}
</style>