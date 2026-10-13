import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import HomePage from './HomePage.vue'
import * as api from '../api/aucationApi.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/aucationApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(),
}))

const list = { success: true, data: { aucations: [{ id: 1, title: 'Lukisan', start_bid: 150000, closed_at: '2099-12-01 00:00:00', cover: 'http://x/c.png', author: { name: 'Sari', photo: 'http://x/p.png' } }, { id: 2, title: 'Jam', start_bid: 5000, closed_at: '2000-01-01 00:00:00', author: { name: 'Budi', photo: '' } }] } }

async function openAndFill() {
  await fireEvent.click(screen.getByRole('button', { name: 'Tambah lelang' }))
  await fireEvent.update(screen.getByLabelText('Judul'), 'Baru')
  await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Desc')
  await fireEvent.update(screen.getByLabelText('Harga awal'), '1000')
  await fireEvent.update(screen.getByLabelText('Ditutup pada'), '2026-12-01T10:00')
  await fireEvent.click(screen.getByRole('button', { name: 'Simpan lelang' }))
}

describe('HomePage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getAucations.mockResolvedValue(list) })

  it('shows cards, searches and switches tabs', async () => {
    renderWithProviders(HomePage)
    expect(await screen.findByText('Rp 150.000')).toBeInTheDocument()
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByText('Lelang selesai')).toBeInTheDocument()
    expect(screen.getByText('Sedang berlangsung')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sampul Lukisan' })).toBeInTheDocument()
    await fireEvent.update(screen.getByLabelText('Cari lelang'), 'jam')
    expect(screen.queryByText('Lukisan')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('tab', { name: 'Lelang saya' }))
    expect(api.getAucations).toHaveBeenLastCalledWith({ is_me: true })
    await fireEvent.click(screen.getByRole('tab', { name: 'Berlangsung' }))
    expect(api.getAucations).toHaveBeenLastCalledWith({ is_closed: false })
    await fireEvent.click(screen.getByRole('tab', { name: 'Selesai' }))
    expect(api.getAucations).toHaveBeenLastCalledWith({ is_closed: true })
  })

  it('creates an aucation, closes the modal and reloads', async () => {
    api.addAucation.mockResolvedValue({ success: true, message: 'Dibuat' })
    renderWithProviders(HomePage)
    await openAndFill()
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibuat'))
    expect(api.addAucation).toHaveBeenCalledWith({ title: 'Baru', description: 'Desc', start_bid: 1000, closed_at: '2026-12-01 10:00:00' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.getAucations).toHaveBeenCalledTimes(2)
  })

  it('keeps the modal open and shows an error when creation fails', async () => {
    api.addAucation.mockResolvedValue({ success: false, message: 'Gagal' })
    renderWithProviders(HomePage)
    await openAndFill()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal'))
    expect(screen.getByRole('dialog', { name: 'Tambah lelang' })).toBeInTheDocument()
  })

  it('closes the add modal with Escape', async () => {
    renderWithProviders(HomePage)
    await fireEvent.click(screen.getByRole('button', { name: 'Tambah lelang' }))
    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
