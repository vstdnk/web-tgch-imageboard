import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTelegramStore = defineStore('telegram', () => {
  const user = ref(null)
  const initData = ref(null)
  const isInitialized = ref(false)
  
  function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp
      
      // Получаем данные пользователя
      user.value = webApp.initDataUnsafe?.user || null
      initData.value = webApp.initData || null
      isInitialized.value = true
      
      return true
    }
    
    return false
  }
  
  return { 
    user, 
    initData,
    isInitialized,
    initTelegram
  }
}) 