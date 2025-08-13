import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Логируем запуск приложения для отладки
console.log('Инициализация Vue приложения...')

// Оборачиваем инициализацию в try-catch для отлова ошибок
try {
  const app = createApp(App)
  
  app.use(createPinia())
  app.use(router)

  // Глобальный обработчик ошибок для Vue
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue ошибка:', err)
    console.error('Компонент:', instance)
    console.error('Информация:', info)
    
    // Если есть элемент для отображения ошибки, покажем ее там
    const errorElement = document.getElementById('error-message')
    if (errorElement) {
      errorElement.textContent = 'Ошибка Vue: ' + (err.message || String(err))
    }
  }
  
  console.log('Монтирование Vue приложения...')
  app.mount('#app')
  console.log('Vue приложение успешно запущено')

  // Полностью удаляем базовый интерфейс после монтирования Vue
  const basicApp = document.getElementById('basic-app');
  if (basicApp && basicApp.parentNode) {
    basicApp.parentNode.removeChild(basicApp);
  }
  const vueApp = document.getElementById('app');
  if (vueApp) {
    vueApp.style.display = 'block';
  }
} catch (error) {
  console.error('Критическая ошибка при инициализации Vue:', error)
  
  // Отображаем ошибку на странице загрузки
  const errorElement = document.getElementById('error-message')
  if (errorElement) {
    errorElement.textContent = 'Критическая ошибка: ' + (error.message || String(error))
  }
}
