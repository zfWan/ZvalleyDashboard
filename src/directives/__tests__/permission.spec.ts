import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import permission from '@/directives/permission'
import { useUserStore } from '@/store/modules/user'

function renderTemplate(tpl: string) {
  return mount(
    { template: tpl },
    {
      global: {
        plugins: [createPinia()],
        directives: { permission },
      },
    },
  )
}

describe('v-permission directive', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('keeps admin-only button when user has admin role', () => {
    const store = useUserStore()
    store.userInfo = { username: 'admin', roles: ['admin'] }
    const wrapper = renderTemplate(`
      <div>
        <button data-testid="always">Always</button>
        <button v-permission="['admin']" data-testid="admin">Admin only</button>
      </div>
    `)
    expect(wrapper.find('[data-testid=always]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=admin]').exists()).toBe(true)
  })

  it('removes admin-only button for viewer user', () => {
    const store = useUserStore()
    store.userInfo = { username: 'alice', roles: ['viewer'] }
    const wrapper = renderTemplate(`
      <div>
        <button data-testid="always">Always</button>
        <button v-permission="['admin']" data-testid="admin">Admin only</button>
        <button v-permission="['viewer']" data-testid="viewer">Viewer</button>
      </div>
    `)
    expect(wrapper.find('[data-testid=always]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=admin]').exists()).toBe(false)
    expect(wrapper.find('[data-testid=viewer]').exists()).toBe(true)
  })

  it('keeps elements with empty role array visible', () => {
    const store = useUserStore()
    store.userInfo = { username: 'alice', roles: ['viewer'] }
    const wrapper = renderTemplate(`
      <div>
        <button v-permission="[]" data-testid="empty">empty</button>
        <button data-testid="plain">plain</button>
      </div>
    `)
    expect(wrapper.find('[data-testid=empty]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=plain]').exists()).toBe(true)
  })
})
