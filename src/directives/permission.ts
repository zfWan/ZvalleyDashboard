import type { Directive } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * v-permission directive.
 * Usage: v-permission="['admin']"
 *
 * When the bound roles list is empty/undefined, the element is always shown.
 * Otherwise the element is removed from the DOM if the current user does not
 * possess any of the specified roles.
 */
export const permission: Directive<HTMLElement, string[] | undefined> = {
  mounted(el, binding) {
    checkPermission(el, binding.value)
  },
  updated(el, binding) {
    checkPermission(el, binding.value)
  },
}

function checkPermission(el: HTMLElement, roles?: string[]) {
  if (!roles || roles.length === 0) return
  const userStore = useUserStore()
  const hasPermission = roles.some((r) => userStore.roles.includes(r))
  if (!hasPermission && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

export default permission
