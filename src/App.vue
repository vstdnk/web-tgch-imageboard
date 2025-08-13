<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'

// Определяем iOS устройства
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Telegram WebApp API
const tg = ref(null);

// Инициализация Telegram WebApp
onMounted(() => {
  console.log('Vue приложение смонтировано, инициализация Telegram WebApp');
  
  // Инициализация Telegram API
  if (window.Telegram && window.Telegram.WebApp) {
    tg.value = window.Telegram.WebApp;
    
    // Отключаем свайп вниз для закрытия приложения
    try {
      var eventData = JSON.stringify({ allow_vertical_swipe: false });
      if (window.TelegramWebviewProxy) {
        window.TelegramWebviewProxy.postEvent('web_app_setup_swipe_behavior', eventData);
      } else {
        window.parent.postMessage(JSON.stringify({
          eventType: 'web_app_setup_swipe_behavior',
          eventData: { allow_vertical_swipe: false }
        }), 'https://web.telegram.org');
      }
      console.log('Свайп вниз отключен');
    } catch (e) {
      console.error('Ошибка при отключении свайпа вниз:', e);
    }
    
    // Скрываем кнопку "Назад" в левом верхнем углу
    try {
      if (window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
        console.log('Кнопка "Назад" скрыта');
      }
    } catch (e) {
      console.error('Ошибка при скрытии кнопки "Назад":', e);
    }
    
    // Блокировка ориентации экрана в портретном режиме
    try {
      var orientationData = JSON.stringify({ locked: true });
      if (window.TelegramWebviewProxy) {
        window.TelegramWebviewProxy.postEvent('web_app_toggle_orientation_lock', orientationData);
      } else {
        window.parent.postMessage(JSON.stringify({
          eventType: 'web_app_toggle_orientation_lock',
          eventData: { locked: true }
        }), 'https://web.telegram.org');
      }
      console.log('Ориентация экрана заблокирована');
    } catch (e) {
      console.error('Ошибка при блокировке ориентации экрана:', e);
    }
    
    // Применяем темную тему если нужно
    if (tg.value.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Настройка переменных CSS на основе Telegram темы
    if (tg.value.themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.value.themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.value.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', tg.value.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', tg.value.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.value.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.value.themeParams.button_text_color);
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.value.themeParams.secondary_bg_color);
    }
    
    // Функция активации полноэкранного режима
    const toggleFullScreen = () => {
      try {
        // Скрываем кнопки
        if (window.Telegram && window.Telegram.WebApp) {
          if (window.Telegram.WebApp.BackButton) window.Telegram.WebApp.BackButton.hide();
          if (window.Telegram.WebApp.MainButton) window.Telegram.WebApp.MainButton.hide();
          if (window.Telegram.WebApp.disableSwipeToClose) window.Telegram.WebApp.disableSwipeToClose();
        }
        
        // Добавляем класс для iOS
        if (isIOS) document.body.classList.add('ios-fullscreen');
        
        // Расширяем окно всеми доступными методами
        if (tg.value.expand) tg.value.expand();
        if (tg.value.requestFullscreen) tg.value.requestFullscreen();
        if (window.Telegram && window.Telegram.WebApp) {
          if (window.Telegram.WebApp.expand) window.Telegram.WebApp.expand();
          if (window.Telegram.WebApp.setViewportHeight) window.Telegram.WebApp.setViewportHeight(1.0);
        }
        
        // Отправляем событие для расширения
        try {
          var expandData = JSON.stringify({force: true});
          if (window.TelegramWebviewProxy) {
            window.TelegramWebviewProxy.postEvent('web_app_expand', expandData);
          } else {
            window.parent.postMessage(JSON.stringify({
              eventType: 'web_app_expand',
              eventData: {force: true}
            }), '*');
          }
        } catch (e) {}
        
        // Устанавливаем viewport
        var viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
      } catch (e) {
        console.error('Ошибка полноэкранного режима:', e);
      }
    };
    
    // Автоматически активируем полноэкранный режим при загрузке
    // Функция активации полноэкранного режима с повторами
    const activateFullScreenMode = (attempts = 0) => {
      const maxAttempts = isIOS ? 3 : 2;
      try {
        toggleFullScreen();
        if (isIOS && attempts < maxAttempts) {
          setTimeout(() => {
            activateFullScreenMode(attempts + 1);
          }, 300);
        }
      } catch (e) {
        if (attempts < maxAttempts) {
          setTimeout(() => {
            activateFullScreenMode(attempts + 1);
          }, 300);
        }
      }
    };
    
    // Запускаем активацию полноэкранного режима
    setTimeout(() => {
      activateFullScreenMode();
    }, isIOS ? 500 : 200);
    
    // Дополнительные события для iOS
    if (isIOS) {
      // При загрузке страницы
      window.addEventListener('load', () => {
        setTimeout(() => {
          activateFullScreenMode();
        }, 500);
      });
      
      // При возвращении на страницу
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) setTimeout(() => {
          activateFullScreenMode();
        }, 300);
      });
      
      // При получении фокуса
      window.addEventListener('focus', () => {
        setTimeout(() => {
          activateFullScreenMode();
        }, 300);
      });
      
      // При восстановлении из кэша
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) setTimeout(() => {
          activateFullScreenMode();
        }, 300);
      });
    }
    
    // Сообщаем Telegram что приложение готово
    tg.value.ready();
    tg.value.expand();
  }
  
  // Скрываем экран загрузки после монтирования Vue
  setTimeout(() => {
    if (window.hideLoading) {
      window.hideLoading();
    }
  }, 300);
});
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #222222;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2678b6;
  --tg-theme-button-color: #2678b6;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f5f5f5;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

html.dark {
  --tg-theme-bg-color: #212121;
  --tg-theme-text-color: #ffffff;
  --tg-theme-hint-color: #aaaaaa;
  --tg-theme-link-color: #8cc2ff;
  --tg-theme-button-color: #2678b6;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #292929;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  /* Предотвращение прокрутки и полноэкранный режим */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
}

/* Специфичные стили для iOS в полноэкранном режиме */
body.ios-fullscreen {
  /* Убираем отступы для полного экрана */
  padding: 0;
  margin: 0;
  /* Фиксация размера экрана */
  height: 100vh;
  height: -webkit-fill-available;
  width: 100vw;
  /* Предотвращение скролла */
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  /* Полноэкранное позиционирование */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
