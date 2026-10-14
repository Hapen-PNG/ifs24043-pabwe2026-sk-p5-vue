<script setup>
import { computed } from 'vue'
import { photoUrl } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  size: { type: String, default: 'md' },
})
const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-24 w-24 text-4xl' }
const dimensions = { sm: 32, md: 40, lg: 96 }
const src = computed(() => photoUrl(props.photo))
const dimension = computed(() => dimensions[props.size] || dimensions.md)
</script>

<template>
  <img v-if="src" loading="lazy" decoding="async" :src="src" alt="" :width="dimension" :height="dimension" :class="['shrink-0 rounded-full object-cover', sizes[size]]" />
  <span v-else aria-hidden="true" :class="['grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white', sizes[size]]">{{ name.charAt(0).toUpperCase() }}</span>
</template>
