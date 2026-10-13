<script setup>
import { reactive } from 'vue'
import ModalShell from './ModalShell.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { showSuccessDialog, showErrorDialog, toApiTimestamp, toInputTimestamp } from '../../../helpers/toolsHelper.js'

const props = defineProps({ id: { type: String, required: true }, aucation: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])
const store = useAucationsStore()
const form = reactive({
  title: props.aucation.title,
  description: props.aucation.description,
  start_bid: props.aucation.start_bid,
  closed_at: toInputTimestamp(props.aucation.closed_at),
})

async function submit() {
  const res = await store.changeAucation(props.id, {
    title: form.title,
    description: form.description,
    start_bid: Number(form.start_bid),
    closed_at: toApiTimestamp(form.closed_at),
  })
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Ubah lelang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <label for="change-title" class="block text-sm font-semibold">Judul</label>
      <input id="change-title" v-model="form.title" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <MarkdownEditor id="change-description" v-model="form.description" label="Deskripsi" />
      <label for="change-start-bid" class="block text-sm font-semibold">Harga awal</label>
      <input id="change-start-bid" v-model="form.start_bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="change-closed-at" class="block text-sm font-semibold">Ditutup pada</label>
      <input id="change-closed-at" v-model="form.closed_at" type="datetime-local" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <button type="submit" aria-label="Simpan perubahan" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Simpan perubahan</button>
    </form>
  </ModalShell>
</template>
