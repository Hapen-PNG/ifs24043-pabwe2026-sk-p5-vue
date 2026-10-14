import { render } from '@testing-library/vue'
import UserAvatar from './UserAvatar.vue'

describe('UserAvatar', () => {
  it('shows the resolved photo', () => {
    const { container } = render(UserAvatar, { props: { name: 'sari', photo: 'img/p.png', size: 'lg' } })
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://open-api.delcom.org/img/p.png')
    expect(container.querySelector('img')).toHaveAttribute('width', '96')
    expect(container.querySelector('img')).toHaveAttribute('height', '96')
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')
  })
  it('falls back to the initial', () => {
    const { container } = render(UserAvatar, { props: { name: 'sari' } })
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('S')
  })

  it('uses reserved default dimensions for an unknown size', () => {
    const { container } = render(UserAvatar, {
      props: { name: 'sari', photo: 'img/p.png', size: 'unknown' },
    })
    expect(container.querySelector('img')).toHaveAttribute('width', '40')
    expect(container.querySelector('img')).toHaveAttribute('height', '40')
  })
})
