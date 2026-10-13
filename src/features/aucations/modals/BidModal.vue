<script setup>
import { ref } from 'vue'
import ModalShell from './ModalShell.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { formatRupiah, showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({ id: { type: String, required: true }, current: { type: Number, required: true } })
const emit = defineEmits(['close', 'saved'])
const store = useAucationsStore()
const bid = ref('')

async function submit() {
  if (Number(bid.value) <= props.current) {
    showErrorDialog(`Penawaran harus lebih tinggi dari ${formatRupiah(props.current)}`)
    return
  }
  const res = await store.placeBid(props.id, { bid: Number(bid.value) })
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Tawar lelang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <p class="text-sm text-stone-700">Penawaran tertinggi saat ini <strong>{{ formatRupiah(current) }}</strong>. Tawarlah lebih tinggi dari itu.</p>
      <label for="bid-input" class="block text-sm font-semibold">Nominal penawaran</label>
      <input id="bid-input" v-model="bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <button type="submit" aria-label="Kirim penawaran" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Kirim penawaran</button>
    </form>
  </ModalShell>
</template>
