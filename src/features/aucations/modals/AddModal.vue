<script setup>
import { reactive } from 'vue'
import ModalShell from './ModalShell.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { showSuccessDialog, showErrorDialog, toApiTimestamp } from '../../../helpers/toolsHelper.js'

const emit = defineEmits(['close', 'saved'])
const store = useAucationsStore()
const form = reactive({ title: '', description: '', start_bid: '', closed_at: '' })

async function submit() {
  const res = await store.addAucation({ ...form, start_bid: Number(form.start_bid), closed_at: toApiTimestamp(form.closed_at) })
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Tambah lelang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <label for="aucation-title" class="block text-sm font-semibold">Judul</label>
      <input id="aucation-title" v-model="form.title" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <MarkdownEditor id="aucation-description" v-model="form.description" label="Deskripsi" />
      <label for="aucation-start-bid" class="block text-sm font-semibold">Harga awal</label>
      <input id="aucation-start-bid" v-model="form.start_bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="aucation-closed-at" class="block text-sm font-semibold">Ditutup pada</label>
      <input id="aucation-closed-at" v-model="form.closed_at" type="datetime-local" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <button type="submit" aria-label="Simpan lelang" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Simpan lelang</button>
    </form>
  </ModalShell>
</template>
