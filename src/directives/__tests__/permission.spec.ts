import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import permission from '@/directives/permission'
import { useUserStore } from '@/store/modules/user'

function renderWithRoles(roles: string[], tpl: string) {
  localStorage.clear()
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useUserStore(pinia)
  store.userInfo = { username: 'tester', roles }
  const wrapper = mount(
    { template: tpl },
    {
      global: {
        plugins: [pinia],
        directives: { permission },
      },
    },
  )
  return { wrapper, store }
}

describe('v-permission directive', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps admin-only button when user has admin role', () => {
    const { wrapper } = renderWithRoles(
      ['admin'],
      `<div>
        <button data-testid="always">Always</button>
        <button v-permission="['admin']" data-testid="admin">Admin only</button>
      </div>`,
    )
    expect(wrapper.find('[data-testid=always]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=admin]').exists()).toBe(true)
  })

  it('removes admin-only button for viewer user and keeps viewer-only button', () => {
    const { wrapper } = renderWithRoles(
      ['viewer'],
      `<div>
        <button data-testid="always">Always</button>
        <button v-permission="['admin']" data-testid="admin">Admin only</button>
        <button v-permission="['viewer']" data-testid="viewer">Viewer</button>
      </div>`,
    )
    expect(wrapper.find('[data-testid=always]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=admin]').exists()).toBe(false)
    expect(wrapper.find('[data-testid=viewer]').exists()).toBe(true)
  })

  it('keeps elements with empty role array visible for any user', () => {
    const { wrapper } = renderWithRoles(
      ['viewer'],
      `<div>
        <button v-permission="[]" data-testid="empty">empty</button>
        <button data-testid="plain">plain</button>
      </div>`,
    )
    expect(wrapper.find('[data-testid=empty]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=plain]').exists()).toBe(true)
  })
})
