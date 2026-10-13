<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import UserAvatar from '../../users/components/UserAvatar.vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import BidModal from '../modals/BidModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import { formatRupiah, formatDate, isClosedAt, showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

const route = useRoute()
const router = useRouter()
const store = useAucationsStore()
const users = useUsersStore()
const modal = ref('')
const ownerActions = [
  { key: 'change', label: 'Ubah lelang' },
  { key: 'cover', label: 'Ubah sampul' },
]
const isOwner = computed(() => users.profile.id === store.aucation.user_id)
const isClosed = computed(() => isClosedAt(store.aucation.closed_at))
const sortedBids = computed(() => [...store.aucation.bids].sort((a, b) => b.bid - a.bid))
const currentBid = computed(() => Math.max(store.aucation.start_bid, ...store.aucation.bids.map((b) => b.bid)))
const load = () => store.loadAucation(route.params.aucationId)
const closeModal = () => { modal.value = '' }
watch(() => route.params.aucationId, load, { immediate: true })

async function cancelBid() {
  if (!(await showConfirmDialog('Batalkan penawaran Anda?'))) return
  const res = await store.removeBid(route.params.aucationId)
  if (res.success) {
    showSuccessDialog(res.message)
    await load()
  } else showErrorDialog(res.message)
}

async function remove() {
  if (!(await showConfirmDialog('Hapus lelang ini?'))) return
  const res = await store.removeAucation(route.params.aucationId)
  if (res.success) {
    await showSuccessDialog(res.message)
    router.push('/')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <article v-if="store.aucation" class="space-y-4 rounded-xl bg-white p-6 shadow">
    <img v-if="store.aucation.cover" :src="store.aucation.cover" :alt="`Sampul ${store.aucation.title}`" class="max-h-80 w-full rounded-xl object-cover" />
    <h1 class="text-2xl font-extrabold text-brand">{{ store.aucation.title }}</h1>
    <div class="flex items-center gap-3 text-sm">
      <UserAvatar :name="store.aucation.author.name" :photo="store.aucation.author.photo" />
      <p>Dilelang oleh <span class="font-semibold">{{ store.aucation.author.name }}</span></p>
    </div>
    <MarkdownViewer :source="store.aucation.description" />
    <p class="font-semibold text-accent">Harga awal {{ formatRupiah(store.aucation.start_bid) }}</p>
    <p class="text-sm">Ditutup {{ formatDate(store.aucation.closed_at) }}</p>
    <output v-if="isClosed" class="block font-semibold text-red-800">Lelang sudah ditutup</output>
    <section aria-label="Penawaran">
      <h2 class="mb-2 text-lg font-bold">Penawaran ({{ sortedBids.length }})</h2>
      <p v-if="sortedBids.length === 0" class="text-stone-700">Belum ada penawaran</p>
      <ul v-else aria-label="Daftar penawaran" class="divide-y divide-stone-200">
        <li v-for="b in sortedBids" :key="b.id" class="flex justify-between gap-2 py-2">
          <span class="font-semibold">{{ formatRupiah(b.bid) }}<span v-if="b.user" class="font-normal"> oleh {{ b.user.name }}</span></span>
          <span class="text-sm text-stone-700">{{ formatDate(b.created_at) }}</span>
        </li>
      </ul>
    </section>
    <div v-if="users.profile" class="flex flex-wrap items-center gap-2">
      <template v-if="isOwner">
        <button v-for="a in ownerActions" :key="a.key" type="button" :aria-label="a.label"
          class="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand/90" @click="modal = a.key">{{ a.label }}</button>
        <button type="button" aria-label="Hapus lelang" class="rounded-lg border border-red-800 px-4 py-2 font-semibold text-red-800 transition hover:bg-red-50" @click="remove">Hapus lelang</button>
      </template>
      <template v-else-if="!isClosed">
        <template v-if="store.aucation.my_bid">
          <p class="mr-2">Penawaran Anda <strong>{{ formatRupiah(store.aucation.my_bid.bid) }}</strong></p>
          <button type="button" aria-label="Batalkan penawaran" class="rounded-lg border border-red-800 px-4 py-2 font-semibold text-red-800 transition hover:bg-red-50" @click="cancelBid">Batalkan penawaran</button>
        </template>
        <button v-else type="button" aria-label="Tawar" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand/90" @click="modal = 'bid'">Tawar</button>
      </template>
    </div>
    <BidModal v-if="modal === 'bid'" :id="route.params.aucationId" :current="currentBid" @close="closeModal" @saved="load" />
    <ChangeModal v-if="modal === 'change'" :id="route.params.aucationId" :aucation="store.aucation" @close="closeModal" @saved="load" />
    <ChangeCoverModal v-if="modal === 'cover'" :id="route.params.aucationId" @close="closeModal" @saved="load" />
  </article>
</template>
