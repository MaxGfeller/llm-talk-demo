<template>
  <NuxtLink
    class="shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
    exact-active-class="shrink-0 rounded-lg bg-gray-100 p-2 text-sm font-medium text-gray-700"
    aria-current="page"
  >
    <slot />
  </NuxtLink>
</template>