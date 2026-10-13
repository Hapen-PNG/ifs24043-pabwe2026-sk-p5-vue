import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/aucationApi.js'

async function run(flag, call) {
  const res = await call()
  flag.value = Boolean(res.success)
  return res
}

export const useAucationsStore = defineStore('aucations', () => {
  const aucations = ref([])
  const aucation = ref(null)
  const isAucationAdd = ref(false)
  const isAucationChange = ref(false)
  const isAucationDelete = ref(false)
  const isBidAdd = ref(false)
  const isBidDelete = ref(false)

  async function loadAucations(filters) {
    const res = await api.getAucations(filters)
    if (res.success) aucations.value = res.data.aucations
    return res
  }
  async function loadAucation(id) {
    const res = await api.getAucation(id)
    if (res.success) aucation.value = res.data.aucation
    return res
  }
  const addAucation = (body) => run(isAucationAdd, () => api.addAucation(body))
  const changeAucation = (id, body) => run(isAucationChange, () => api.changeAucation(id, body))
  const changeCover = (id, file) => run(isAucationChange, () => api.changeCover(id, file))
  const removeAucation = (id) => run(isAucationDelete, () => api.deleteAucation(id))
  const removeBid = (id) => run(isBidDelete, () => api.deleteBid(id))
  const placeBid = (id, body) => run(isBidAdd, () => api.addBid(id, body))

  return {
    aucations, aucation, isAucationAdd, isAucationChange, isAucationDelete, isBidAdd, isBidDelete,
    loadAucations, loadAucation, addAucation, changeAucation, changeCover, removeAucation, placeBid, removeBid,
  }
})
