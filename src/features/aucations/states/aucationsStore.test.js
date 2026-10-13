import { setActivePinia, createPinia } from 'pinia'
import { useAucationsStore } from './aucationsStore.js'
import * as api from '../api/aucationApi.js'

vi.mock('../api/aucationApi.js')

describe('aucationsStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('loads list and detail, ignoring failures', async () => {
    const s = useAucationsStore()
    api.getAucations.mockResolvedValueOnce({ success: true, data: { aucations: [1] } }).mockResolvedValueOnce({ success: false })
    await s.loadAucations({}); await s.loadAucations({})
    expect(s.aucations).toEqual([1])
    api.getAucation.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: { aucation: { id: 2 } } })
    await s.loadAucation(2)
    expect(s.aucation).toBeNull()
    await s.loadAucation(2)
    expect(s.aucation).toEqual({ id: 2 })
  })

  it('tracks mutation flags', async () => {
    const s = useAucationsStore()
    api.addAucation.mockResolvedValue({ success: true })
    api.changeAucation.mockResolvedValue({ success: true })
    api.changeCover.mockResolvedValue({ success: true })
    api.deleteAucation.mockResolvedValue({ success: false })
    api.addBid.mockResolvedValue({ success: true })
    api.deleteBid.mockResolvedValue({ success: true })
    await s.addAucation({}); await s.changeAucation(1, {}); await s.changeCover(1, {}); await s.removeAucation(1); await s.placeBid(1, {}); await s.removeBid(1)
    expect([s.isAucationAdd, s.isAucationChange, s.isAucationDelete, s.isBidAdd, s.isBidDelete]).toEqual([true, true, false, true, true])
  })
})
