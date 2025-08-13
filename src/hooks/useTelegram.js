import { ref, onMounted } from 'vue'

export function useTelegram() {
  const tg = ref(null)
  const user = ref(null)
  const ready = ref(false)
  const error = ref(null)

  const onClose = () => {
    if (tg.value) {
      tg.value.close()
    }
  }

  const onToggleMainButton = (show, text = 'ПРОДОЛЖИТЬ') => {
    if (tg.value) {
      if (show) {
        tg.value.MainButton.setText(text)
        tg.value.MainButton.show()
      } else {
        tg.value.MainButton.hide()
      }
    }
  }

  // Инициализация WebApp API
  const initWebApp = () => {
    try {
      console.log('Инициализация Telegram WebApp...')
      // Проверяем доступность Telegram WebApp API
      if (window.Telegram && window.Telegram.WebApp) {
        tg.value = window.Telegram.WebApp
        console.log('WebApp API обнаружен:', tg.value)
        
        // Получаем данные пользователя, если доступны
        user.value = tg.value.initDataUnsafe?.user
        console.log('Данные пользователя:', user.value)
        
        // Уведомляем Telegram, что приложение готово
        // Вызываем только если этого не делал базовый скрипт
        try {
          tg.value.ready()
          console.log('WebApp отправил сигнал готовности (ready())')
        } catch (e) {
          console.log('ready() уже был вызван ранее или ошибка:', e)
        }
        
        // Настраиваем внешний вид (светлая/темная тема)
        console.log('Цветовая схема:', tg.value.colorScheme)
        if (tg.value.colorScheme === 'dark') {
          document.documentElement.classList.add('dark')
        }
        
        // Разрешаем расширение на весь экран на iOS
        try {
          tg.value.expand()
          console.log('WebApp расширен на весь экран (expand())')
        } catch (e) {
          console.log('expand() уже был вызван ранее или ошибка:', e)
        }
        
        ready.value = true
        
        // Скрываем экран загрузки
        if (window.hideLoading) {
          window.hideLoading()
        }
        
        return true
      } else {
        console.warn('Telegram WebApp API не найден в window.Telegram.WebApp')
        error.value = 'API_NOT_FOUND'
        
        // Если мы в режиме разработки и не в Telegram, создаем заглушку для тестирования
        if (import.meta.env.DEV) {
          console.log('Создаем заглушку для Telegram WebApp API в режиме разработки')
          tg.value = {
            ready: () => console.log('Mock: WebApp ready'),
            expand: () => console.log('Mock: WebApp expand'),
            close: () => console.log('Mock: WebApp close'),
            MainButton: {
              show: () => console.log('Mock: MainButton show'),
              hide: () => console.log('Mock: MainButton hide'),
              setText: (text) => console.log('Mock: MainButton setText', text)
            },
            colorScheme: 'light',
            initDataUnsafe: {
              user: {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser'
              }
            }
          }
          user.value = tg.value.initDataUnsafe.user
          ready.value = true
          
          // Скрываем экран загрузки даже для мокового API
          if (window.hideLoading) {
            window.hideLoading()
          }
          
          return true
        }
        
        return false
      }
    } catch (e) {
      console.error('Ошибка при инициализации Telegram WebApp:', e)
      error.value = e.message
      return false
    }
  }

  onMounted(() => {
    // Пытаемся инициализировать Telegram WebApp сразу после монтирования компонента
    initWebApp()
  })

  return {
    tg,
    user,
    ready,
    error,
    onClose,
    onToggleMainButton,
    initWebApp
  }
} 