import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import LoginPage from './LoginPage.vue'
import * as api from '../api/authApi.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/authApi.js')
vi.mock('../../../helpers/toolsHelper.js', () => ({ showErrorDialog: vi.fn() }))

async function fillAndSubmit() {
  await fireEvent.update(document.querySelector('#login-email-input'), 'a@b.c')
  await fireEvent.update(document.querySelector('#login-password-input'), 'secret')
  await fireEvent.click(document.querySelector('#login-submit-button'))
}

describe('LoginPage', () => {
  it('redirects home on success', async () => {
    api.login.mockResolvedValue({ success: true, data: { token: 't' } })
    const { router } = renderWithProviders(LoginPage)
    const push = vi.spyOn(router, 'push').mockImplementation((...args) => {
      expect(localStorage.getItem('accessToken')).toBe('t')
      return Promise.resolve()
    })
    await fillAndSubmit()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(api.login).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret' })
  })

  it('exposes standard field names and types for automated form submission', () => {
    renderWithProviders(LoginPage)

    expect(document.querySelector('form').tagName).toBe('FORM')
    expect(document.querySelector('#login-email-input')).toHaveAttribute('type', 'email')
    expect(document.querySelector('#login-email-input')).toHaveAttribute('name', 'email')
    expect(document.querySelector('label[for="login-email-input"]')).toBeInTheDocument()
    expect(document.querySelector('#login-password-input')).toHaveAttribute('type', 'password')
    expect(document.querySelector('#login-password-input')).toHaveAttribute('name', 'password')
    expect(document.querySelector('label[for="login-password-input"]')).toBeInTheDocument()
    expect(document.querySelector('#login-submit-button')).toHaveAttribute('type', 'submit')
  })

  it('shows error dialog on failure', async () => {
    api.login.mockResolvedValue({ success: false, message: 'Salah' })
    renderWithProviders(LoginPage)
    await fillAndSubmit()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Salah'))
    expect(screen.getByRole('alert')).toHaveTextContent('Salah')
    expect(screen.getByRole('link', { name: 'Daftar' })).toBeInTheDocument()
  })

  it('shows a fallback when the API failure has no message', async () => {
    api.login.mockResolvedValue({ success: false })
    renderWithProviders(LoginPage)

    await fillAndSubmit()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Login gagal. Periksa kembali email dan kata sandi.'
      )
    )
  })

  it('shows a readable message when the login request fails', async () => {
    api.login.mockRejectedValue(new Error('Permintaan login gagal'))
    renderWithProviders(LoginPage)

    await fillAndSubmit()

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Permintaan login gagal'))
    expect(showErrorDialog).toHaveBeenCalledWith('Permintaan login gagal')
  })

  it('shows a fallback for a non-Error request failure', async () => {
    api.login.mockRejectedValue('offline')
    renderWithProviders(LoginPage)

    await fillAndSubmit()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Gagal terhubung ke server. Coba lagi.'
      )
    )
  })
})
