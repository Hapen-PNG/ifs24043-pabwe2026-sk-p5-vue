<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()
onMounted(users.loadProfile)

async function logout() {
  await auth.logoutUser()
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent :profile="users.profile" @logout="logout" />
    <div class="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:flex-row">
      <SidebarComponent />
      <main class="min-w-0 flex-1"><RouterView /></main>
    </div>
    <footer class="p-4 text-center text-sm text-stone-700">Delcom Auction</footer>
  </div>
</template>
