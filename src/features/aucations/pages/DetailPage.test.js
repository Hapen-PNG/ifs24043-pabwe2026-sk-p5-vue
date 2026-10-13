import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import DetailPage from './DetailPage.vue'
import * as api from '../api/aucationApi.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/aucationApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(),
}))

const detail = (extra = {}) => ({
  success: true,
  data: { aucation: { id: 7, user_id: 1, title: 'Lukisan', description: '**Cat** minyak', start_bid: 150000, closed_at: '2099-12-01 00:00:00', bids: [{ id: 1, bid: 200000, created_at: '2026-10-05T08:44:12.000000Z', user: { name: 'Budi' } }, { id: 2, bid: 100000, created_at: '2026-10-04T08:00:00.000000Z' }], author: { name: 'Sari', photo: '' }, ...extra } },
})
const click = (name) => fireEvent.click(screen.getByRole('button', { name }))
const noDialog = () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

async function mount({ me = 99 } = {}) {
  const utils = renderWithProviders(DetailPage, { route: '/aucations/7' })
  if (me) useUsersStore(utils.pinia).profile = { id: me }
  await screen.findByText('Lukisan')
  await waitFor(() => expect(api.getAucation).toHaveBeenCalledWith('7'))
  return utils
}

describe('DetailPage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getAucation.mockResolvedValue(detail()) })

  it('renders details, markdown and bids without a cover', async () => {
    await mount()
    expect(screen.getByText('Rp 200.000')).toBeInTheDocument()
    expect(screen.getByText('Cat').tagName).toBe('STRONG')
    expect(screen.getByText('Sari')).toBeInTheDocument()
    expect(screen.getByText('oleh Budi')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Rp 200.000')
    expect(screen.getByRole('button', { name: 'Tawar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ubah lelang' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hapus lelang' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Sampul Lukisan' })).not.toBeInTheDocument()
  })

  it('shows only management actions to the owner', async () => {
    await mount({ me: 1 })
    for (const name of ['Ubah lelang', 'Ubah sampul', 'Hapus lelang']) expect(screen.getByRole('button', { name })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
  })

  it('hides all actions until the profile is loaded', async () => {
    await mount({ me: null })
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hapus lelang' })).not.toBeInTheDocument()
  })

  it('shows the highest bid in the bid modal', async () => {
    await mount()
    await click('Tawar')
    expect(screen.getByRole('dialog')).toHaveTextContent('Penawaran tertinggi saat ini Rp 200.000')
  })

  it('blocks a bid that is not higher than the current highest bid', async () => {
    await mount()
    await click('Tawar')
    await fireEvent.update(screen.getByLabelText('Nominal penawaran'), '100000')
    await click('Kirim penawaran')
    expect(showErrorDialog).toHaveBeenCalledWith('Penawaran harus lebih tinggi dari Rp 200.000')
    expect(api.addBid).not.toHaveBeenCalled()
  })

  it('hides bidding once the aucation is closed', async () => {
    api.getAucation.mockResolvedValue(detail({ closed_at: '2000-01-01 00:00:00' }))
    await mount()
    expect(screen.getByRole('status')).toHaveTextContent('Lelang sudah ditutup')
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
  })

  it('lets a bidder cancel an existing bid instead of bidding again', async () => {
    api.getAucation.mockResolvedValue(detail({ my_bid: { id: 2, bid: 250000 } }))
    await mount()
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
    showConfirmDialog.mockResolvedValueOnce(false).mockResolvedValue(true)
    api.deleteBid.mockResolvedValueOnce({ success: false, message: 'Gagal batal' }).mockResolvedValueOnce({ success: true, message: 'Dibatalkan' })
    await click('Batalkan penawaran')
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
    expect(api.deleteBid).not.toHaveBeenCalled()
    await click('Batalkan penawaran')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal batal'))
    await click('Batalkan penawaran')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibatalkan'))
    expect(api.deleteBid).toHaveBeenLastCalledWith('7')
  })

  it('shows an empty state when there are no bids', async () => {
    api.getAucation.mockResolvedValue(detail({ bids: [] }))
    await mount()
    expect(screen.getByText('Belum ada penawaran')).toBeInTheDocument()
  })

  it('shows the cover when present', async () => {
    api.getAucation.mockResolvedValue(detail({ cover: 'http://x/c.png' }))
    await mount()
    expect(screen.getByRole('img', { name: 'Sampul Lukisan' })).toBeInTheDocument()
  })

  it('places a bid: error keeps the modal, success closes it and reloads', async () => {
    await mount()
    const before = api.getAucation.mock.calls.length
    api.addBid.mockResolvedValueOnce({ success: false, message: 'Rendah' }).mockResolvedValueOnce({ success: true, message: 'Ok' })
    await click('Tawar')
    await fireEvent.update(screen.getByLabelText('Nominal penawaran'), '300000')
    await click('Kirim penawaran')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Rendah'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await click('Kirim penawaran')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Ok'))
    expect(api.addBid).toHaveBeenLastCalledWith('7', { bid: 300000 })
    await waitFor(noDialog)
    expect(api.getAucation.mock.calls.length).toBeGreaterThan(before)
  })

  it('edits the aucation', async () => {
    await mount({ me: 1 })
    api.changeAucation.mockResolvedValueOnce({ success: false, message: 'Gagal ubah' }).mockResolvedValueOnce({ success: true, message: 'Diubah' })
    await click('Ubah lelang')
    await fireEvent.update(screen.getByLabelText('Judul'), 'Baru')
    await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Desc baru')
    await fireEvent.update(screen.getByLabelText('Harga awal'), '200000')
    await fireEvent.update(screen.getByLabelText('Ditutup pada'), '2027-01-01T08:00')
    await click('Simpan perubahan')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal ubah'))
    await click('Simpan perubahan')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Diubah'))
    expect(api.changeAucation).toHaveBeenLastCalledWith('7', { title: 'Baru', description: 'Desc baru', start_bid: 200000, closed_at: '2027-01-01 08:00:00' })
    await waitFor(noDialog)
  })

  it('changes the cover', async () => {
    await mount({ me: 1 })
    api.changeCover.mockResolvedValueOnce({ success: false, message: 'Besar' }).mockResolvedValueOnce({ success: true, message: 'Sampul' })
    const file = new File(['x'], 'c.png', { type: 'image/png' })
    await click('Ubah sampul')
    await fireEvent.change(screen.getByLabelText('File sampul'), { target: { files: [file] } })
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Besar'))
    await fireEvent.change(screen.getByLabelText('File sampul'), { target: { files: [file] } })
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Sampul'))
    expect(api.changeCover).toHaveBeenLastCalledWith('7', file)
    await waitFor(noDialog)
  })

  it('closes the bid modal with Escape', async () => {
    await mount()
    await click('Tawar')
    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    noDialog()
  })

  it('closes the owner modals with Escape', async () => {
    await mount({ me: 1 })
    for (const name of ['Ubah lelang', 'Ubah sampul']) {
      await click(name)
      await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      noDialog()
    }
  })

  it('does nothing when deletion is cancelled', async () => {
    await mount({ me: 1 })
    showConfirmDialog.mockResolvedValue(false)
    await click('Hapus lelang')
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
    expect(api.deleteAucation).not.toHaveBeenCalled()
  })

  it('deletes and goes home, or shows an error', async () => {
    const { router } = await mount({ me: 1 })
    const push = vi.spyOn(router, 'push')
    showConfirmDialog.mockResolvedValue(true)
    api.deleteAucation.mockResolvedValueOnce({ success: false, message: 'Tidak bisa' }).mockResolvedValueOnce({ success: true, message: 'Dihapus' })
    await click('Hapus lelang')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Tidak bisa'))
    await click('Hapus lelang')
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
  })
})
