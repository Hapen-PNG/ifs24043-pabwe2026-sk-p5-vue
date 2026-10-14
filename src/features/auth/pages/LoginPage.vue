<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInput } from '../../../hooks/useInput.js'
import { useAuthStore } from '../states/authStore.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

const router = useRouter()
const auth = useAuthStore()
const { value: email, onInput: onEmail } = useInput()
const { value: password, onInput: onPassword } = useInput()
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  try {
    const res = await auth.loginUser({ email: email.value, password: password.value })
    if (res.success && auth.token) {
      await router.push('/')
    } else {
      errorMessage.value = res.message || 'Login gagal. Periksa kembali email dan kata sandi.'
      showErrorDialog(errorMessage.value)
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Gagal terhubung ke server. Coba lagi.'
    showErrorDialog(errorMessage.value)
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h2 class="text-lg font-semibold">Masuk ke akun Anda</h2>
    <div>
      <label for="email" class="block text-sm font-semibold mb-1">Email</label>
      <input id="email" name="email" type="email" aria-label="Email" required :value="email" @input="onEmail"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <div>
      <label for="password" class="block text-sm font-semibold mb-1">Kata sandi</label>
      <input id="password" name="password" type="password" aria-label="Kata sandi" required :value="password" @input="onPassword"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <p v-if="errorMessage" role="alert" class="text-sm text-red-700">
      {{ errorMessage }}
    </p>
    <button id="login-submit-button" type="submit" aria-label="Masuk"
      class="w-full rounded-lg bg-brand px-4 py-2 font-semibold text-white">Masuk</button>
    <p class="text-sm">Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-brand underline">Daftar</RouterLink>
    </p>
  </form>
</template>
