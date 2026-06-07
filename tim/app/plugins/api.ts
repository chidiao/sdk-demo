export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: import.meta.dev ? '' : 'https://api.chidiao.xin',
  })

  return {
    provide: {
      api,
    },
  }
})