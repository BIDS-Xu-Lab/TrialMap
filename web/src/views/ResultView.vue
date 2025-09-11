<template>
    <div class="result">
        <h2>Selected Summary</h2>
        <ul>
            <li><strong>Cancer Type</strong>: {{ result?.selectedCancerType || '-' }}</li>
            <li><strong>Treatment</strong>: {{ result?.selectedTreatment || '-' }}</li>
            <li><strong>Endpoint</strong>: {{ result?.selectedEndpoint || '-' }}</li>
            <li><strong>Criteria (names)</strong>: {{ result?.selectedCriteria?.join(', ') || '-' }}</li>
        </ul>
    </div>
 </template>

<script setup>
const props = defineProps({
    result: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
.result { padding: 16px; text-align: left; }
.result ul { list-style: none; padding: 0; }
.result li { margin: 6px 0; }
</style>