<script setup>
import '~/assets/index.css'
</script>
<template>
  <div class="flex flex-col items-center w-full max-w-lg pb-12 mx-auto mt-20">
    <div class="mb-12">
      <div class="hidden sm:block">
        <nav class="flex gap-6" aria-label="Tabs">
          <Pill to="/">Example 1</Pill>
          <Pill to="/example2">Example 2</Pill>
          <Pill to="/example3">Example 3</Pill>
          <Pill to="/example4">Example 4</Pill>
          <Pill to="/example5">Example 5</Pill>
        </nav>
      </div>
    </div>
    <NuxtPage :keepalive="true" />
  </div>
</template>
