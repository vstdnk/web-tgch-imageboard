<template>
  <div class="board-view">
    <div class="board-header">
      <h1>{{ boardInfo ? boardInfo.name : boardName }}</h1>
    </div>
    
    <div class="board-content">
      <div v-if="loading" class="loading">
        <div class="loader"></div>
        <p>Загрузка тредов...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-button">Попробовать снова</button>
      </div>
      
      <div v-else-if="threads.length === 0" class="no-images">
        <p>На этой доске пока нет тредов</p>
      </div>
      
      <div v-else class="images-grid">
        <div 
          v-for="thread in threads" 
          :key="thread.id" 
          class="image-item"
          @click="openThread(thread.id)"
        >
          <div v-if="thread.thumbnail" class="image-container">
            <img 
              :src="thread.thumbnail" 
              :alt="thread.title || 'Изображение'"
              loading="lazy"
              @error="handleImageError"
            />
          </div>
          <div v-else class="no-image-placeholder">
            <span class="placeholder-text">Нет изображения</span>
          </div>
          <div class="image-info">
            <span class="image-title">{{ thread.title || 'Без названия' }}</span>
            <span class="image-date">{{ formatDate(thread.created_at) }}</span>
            <span class="thread-stats">
              {{ thread.posts_count }} постов, {{ thread.files_count }} файлов
              <span v-if="thread.views" class="views-count">• {{ thread.views }} просмотров</span>
            </span>
          </div>
        </div>
        
        <!-- Кнопка загрузки дополнительных тредов -->
        <div v-if="currentPage < totalPages" class="load-more-container">
          <button 
            @click="loadMoreThreads" 
            :disabled="loadingMore"
            class="load-more-button"
          >
            <span v-if="loadingMore">Загрузка...</span>
            <span v-else>Загрузить еще</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'BoardView',
  props: {
    board: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    
    const threads = ref([])
    const loading = ref(true)
    const error = ref(null)
    const boardInfo = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const loadingMore = ref(false)
    
    const boardName = computed(() => {
      return route.params.board || props.board
    })
    
    const loadThreads = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Загружаем информацию о доске из localStorage
        const savedBoardInfo = localStorage.getItem('boardInfo_' + boardName.value)
        if (savedBoardInfo) {
          boardInfo.value = JSON.parse(savedBoardInfo)
        }
        
        // Загружаем треды с доски через API
        const { BoardsAPI } = await import('../api/boards.js')
        const data = await BoardsAPI.getThreads(boardName.value, 1)
        
        if (data && data.threads) {
          threads.value = data.threads
          totalPages.value = data.pages || 1
        } else {
          threads.value = []
          totalPages.value = 1
        }
      } catch (err) {
        error.value = 'Ошибка при загрузке тредов: ' + (err.message || 'Неизвестная ошибка')
      } finally {
        loading.value = false
      }
    }
    
    const retryLoad = () => {
      loadThreads()
    }
    
    const openThread = (threadId) => {
      router.push({
        name: 'thread',
        params: {
          board: boardName.value,
          thread: threadId
        }
      })
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Неизвестно'
      return new Date(timestamp * 1000).toLocaleDateString('ru-RU')
    }
    
    const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7QndCw0LfQsNGA0YvQuSDQstC40LTQtdC7PC90ZXh0Pgo8L3N2Zz4K'
    }
    
    const loadMoreThreads = async () => {
      if (loadingMore.value || currentPage.value >= totalPages.value) return
      
      try {
        loadingMore.value = true
        const nextPage = currentPage.value + 1
        
        const { BoardsAPI } = await import('../api/boards.js')
        const data = await BoardsAPI.getThreads(boardName.value, nextPage)
        
        if (data && data.threads) {
          threads.value = [...threads.value, ...data.threads]
          currentPage.value = nextPage
        }
      } catch (err) {
        console.error('Ошибка при загрузке дополнительных тредов:', err)
      } finally {
        loadingMore.value = false
      }
    }
    
    onMounted(() => {
      loadThreads()
    })
    
    return {
      threads,
      loading,
      error,
      boardName,
      boardInfo,
      currentPage,
      totalPages,
      loadingMore,
      openThread,
      formatDate,
      handleImageError,
      loadMoreThreads,
      retryLoad
    }
  }
}
</script>

<style scoped>
.board-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.board-header {
  background-color: var(--tg-theme-secondary-bg-color);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding-top: calc(16px + var(--safe-area-inset-top));
}

.board-header h1 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: var(--tg-theme-text-color);
}

.board-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.loading, .error, .no-images {
  text-align: center;
  padding: 40px 16px;
  font-size: 16px;
  color: var(--tg-theme-text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: var(--tg-theme-button-color);
  animation: spin 1s linear infinite;
}

html.dark .loader {
  border-color: rgba(255,255,255,0.1);
  border-top-color: var(--tg-theme-button-color);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #ff3b30;
}

.retry-button {
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.retry-button:active {
  opacity: 0.8;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 0 16px;
}

.image-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  background: var(--tg-theme-secondary-bg-color);
}

.image-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-image-placeholder {
  width: 100%;
  height: 200px;
  background-color: var(--tg-theme-secondary-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px 12px 0 0;
}

.placeholder-text {
  color: var(--tg-theme-hint-color);
  font-size: 14px;
}

.image-info {
  padding: 12px;
}

.image-title {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--tg-theme-text-color);
  font-size: 14px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.image-date {
  display: block;
  font-size: 12px;
  color: var(--tg-theme-hint-color);
  margin-bottom: 4px;
}

.thread-stats {
  display: block;
  font-size: 11px;
  color: var(--tg-theme-hint-color);
}

.views-count {
  color: var(--tg-theme-hint-color);
  font-size: 11px;
}

.load-more-container {
  text-align: center;
  margin-top: 20px;
  padding: 0 16px;
}

.load-more-button {
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  width: 100%;
  max-width: 300px;
}

.load-more-button:active:not(:disabled) {
  opacity: 0.8;
}

.load-more-button:disabled {
  background-color: var(--tg-theme-hint-color);
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .images-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 0 12px;
  }
  
  .image-container {
    height: 180px;
  }
  
  .board-header {
    padding: 12px 16px;
  }
  
  .board-header h1 {
    font-size: 16px;
  }
}
</style> 