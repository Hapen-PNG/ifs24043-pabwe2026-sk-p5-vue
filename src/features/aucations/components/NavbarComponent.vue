<script setup>
import UserAvatar from '../../users/components/UserAvatar.vue'

defineProps({ profile: { type: Object, default: null } })
const emit = defineEmits(['logout'])
</script>

<template>
  <header class="bg-brand text-white shadow">
    <nav class="mx-auto flex max-w-6xl items-center gap-3 p-3" aria-label="Navigasi utama">
      <span class="mr-auto text-lg font-extrabold">Delcom Auction</span>
      <RouterLink v-if="profile" to="/profile" class="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-4 font-semibold transition hover:bg-white/20">
        <UserAvatar :name="profile.name" :photo="profile.photo" size="sm" />
        <span>{{ profile.name }}</span>
      </RouterLink>
      <button type="button" aria-label="Keluar" class="rounded-lg bg-white px-3 py-2 font-semibold text-brand transition hover:bg-stone-200" @click="emit('logout')">Keluar</button>
    </nav>
  </header>
</template>
