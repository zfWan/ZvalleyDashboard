<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p class="hello__hint">
      HelloWorld 是主题接入回归样本。正文使用 <code>--text-primary</code>， 主色使用
      <code>--moss-primary</code>，链接使用 <a class="hello__link" href="#">moss 链接色</a>。
    </p>
  </div>
</template>

<style scoped lang="scss">
.hello h1 {
  font-size: 24px;
  color: var(--moss-primary);
}

.hello__hint {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--leading-body);
}

.hello__link {
  color: var(--moss-primary);
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--moss-ink);
  }
}
</style>
