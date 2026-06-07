<template>
  <div class="layout-bg w-full min-h-screen">
    <div class="md:max-w-[400px] mx-auto">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.layout-bg {
  background-color: #f3e8ff;
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
    linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%);
  background-size:
    50px 50px,
    50px 50px,
    100% 100%;
  background-attachment: fixed;
}
</style>
