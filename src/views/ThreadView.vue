<template>
  <div class="thread-view">
    <div class="header">
      <div class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </div>
      <h1>{{ threadSubject || boardName }}</h1>
    </div>
    
    <div class="content">
      <div v-if="loading" class="welcome-text">
        <div class="loader"></div>
        <span>Загрузка треда...</span>
      </div>
      
      <div v-else-if="error" class="welcome-text error">
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-button">Попробовать снова</button>
      </div>
      
      <div v-else class="posts-container">
        <!-- ОП-пост -->
        <div v-if="opPost" class="post op-post">
          <div class="post-header">
            <span class="post-name">{{ opPost.name || 'Аноним' }}</span>
            <span class="post-date">{{ formatDate(opPost.timestamp) }}</span>
            <span class="post-number">#{{ opPost.num }}</span>
          </div>
          
          <div v-if="opPost.subject" class="post-subject">{{ opPost.subject }}</div>
          
          <div v-if="opPost.files && opPost.files.length" class="post-files">
            <div v-for="(file, index) in opPost.files" :key="index" class="post-file">
              <a :href="getImageUrl(boardId, file.name)" target="_blank">
                <img 
                  :src="getThumbnailUrl(boardId, file.name)" 
                  :alt="file.name || 'Изображение'"
                  @error="handleImageError"
                >
              </a>
              <div class="file-info">{{ formatFileInfo(file) }}</div>
            </div>
          </div>
          
          <div class="post-comment" v-html="formatComment(opPost.comment)"></div>
        </div>
        
        <!-- Ответы -->
        <div class="post-replies">
          <div v-for="post in replies" :key="post.num" class="post">
            <div class="post-header">
              <span class="post-name">{{ post.name || 'Аноним' }}</span>
              <span class="post-date">{{ formatDate(post.timestamp) }}</span>
              <span class="post-number">#{{ post.num }}</span>
            </div>
            
            <div v-if="post.files && post.files.length" class="post-files">
              <div v-for="(file, index) in post.files" :key="index" class="post-file">
                <a :href="getImageUrl(boardId, file.name)" target="_blank">
                  <img 
                    :src="getThumbnailUrl(boardId, file.name)" 
                    :alt="file.name || 'Изображение'"
                    @error="handleImageError"
                  >
                </a>
                <div class="file-info">{{ formatFileInfo(file) }}</div>
              </div>
            </div>
            
            <div class="post-comment" v-html="formatComment(post.comment)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ThreadView',
  props: {
    board: {
      type: String,
      required: true
    },
    thread: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    
    const boardId = ref('')
    const threadId = ref(0)
    const boardName = ref('')
    const threadSubject = ref('')
    const opPost = ref(null)
    const replies = ref([])
    const loading = ref(true)
    const error = ref(null)
    
    const loadBoardInfo = () => {
      // Получаем информацию о доске из локального хранилища или из параметров маршрута
      const boardInfo = localStorage.getItem('boardInfo_' + boardId.value)
      if (boardInfo) {
        const info = JSON.parse(boardInfo)
        boardName.value = info.name
        console.log('Информация о доске загружена:', info)
      } else {
        boardName.value = '/' + boardId.value + '/'
        console.log('Информация о доске не найдена, используем ID')
      }
    }
    
    const loadThread = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log(`Загрузка треда ${threadId.value} с доски ${boardId.value}...`)
        
        // Используем наш API сервис
        const { BoardsAPI } = await import('../api/boards.js')
        const data = await BoardsAPI.getThread(boardId.value, threadId.value)
        
        console.log('Данные треда получены:', data)
        
        if (data && data.threads && data.threads.length > 0) {
          const thread = data.threads[0]
          
          // Находим ОП-пост и ответы
          if (thread.posts && thread.posts.length > 0) {
            opPost.value = thread.posts[0]
            threadSubject.value = opPost.value.subject || ''
            replies.value = thread.posts.slice(1)
            
            console.log(`Тред загружен: ОП-пост + ${replies.value.length} ответов`)
          } else {
            throw new Error('Тред не содержит постов')
          }
        } else {
          throw new Error('Не удалось загрузить данные треда')
        }
      } catch (error) {
        console.error('Ошибка при загрузке треда:', error)
        error.value = 'Ошибка при загрузке треда: ' + (error.message || 'Неизвестная ошибка')
      } finally {
        loading.value = false
      }
    }
    
    const retryLoad = () => {
      loadThread()
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Неизвестно'
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatComment = (comment) => {
      if (!comment) return ''
      
      // Простая обработка HTML тегов для безопасности
      return comment
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
    }
    
    const getImageUrl = (boardId, filename) => {
      if (!filename) return ''
      return `https://2ch.hk/${boardId}/${filename}`
    }
    
    const getThumbnailUrl = (boardId, filename) => {
      if (!filename) return ''
      // Для превью обычно используется суффикс _thumb
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
      const ext = filename.split('.').pop()
      return `https://2ch.hk/${boardId}/thumb/${nameWithoutExt}_thumb.${ext}`
    }
    
    const handleImageError = (event) => {
      // Заменяем изображение на заглушку при ошибке загрузки
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7QndCw0LfQsNGA0YvQuSDQstC40LTQtdC7PC90ZXh0Pgo8L3N2Zz4K'
    }
    
    const formatFileInfo = (file) => {
      if (!file) return ''
      
      let info = ''
      if (file.name) {
        info += file.name
      }
      
      if (file.size) {
        const sizeKb = Math.round(file.size / 1024)
        info += ` (${sizeKb} KB)`
      }
      
      if (file.width && file.height) {
        info += ` ${file.width}x${file.height}`
      }
      
      return info
    }
    
    const goBack = () => {
      // Возврат на страницу доски
      router.push({
        name: 'board',
        params: {
          board: boardId.value
        }
      })
    }
    
    onMounted(() => {
      boardId.value = route.params.board || props.board
      threadId.value = parseInt(route.params.thread || props.thread)
      
      console.log('ThreadView смонтирован:', { boardId: boardId.value, threadId: threadId.value })
      
      loadBoardInfo()
      loadThread()
    })
    
    return {
      boardId,
      threadId,
      boardName,
      threadSubject,
      opPost,
      replies,
      loading,
      error,
      loadBoardInfo,
      loadThread,
      retryLoad,
      formatDate,
      formatComment,
      getImageUrl,
      getThumbnailUrl,
      handleImageError,
      formatFileInfo,
      goBack
    }
  }
}
</script>

<style scoped>
.thread-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--tg-theme-secondary-bg-color);
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding-top: calc(16px + var(--safe-area-inset-top));
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 10;
  color: var(--tg-theme-hint-color);
  font-size: 20px;
}

.back-button:active {
  opacity: 0.7;
}

.header h1 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
  color: var(--tg-theme-text-color);
}

.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.welcome-text {
  margin: 20px 16px;
  font-size: 18px;
  text-align: center;
  color: var(--tg-theme-text-color);
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

.posts-container {
  padding: 0 16px;
}

.post {
  background-color: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  padding: 12px 16px;
}

.op-post {
  margin-bottom: 24px;
  border: 2px solid var(--tg-theme-button-color);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.post-name {
  font-weight: 500;
  color: var(--tg-theme-link-color);
}

.post-date {
  color: var(--tg-theme-hint-color);
  font-size: 12px;
}

.post-number {
  color: var(--tg-theme-hint-color);
  font-size: 12px;
}

.post-subject {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--tg-theme-text-color);
}

.post-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.post-file {
  max-width: 100%;
}

.post-file img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.file-info {
  font-size: 12px;
  color: var(--tg-theme-hint-color);
  margin-top: 4px;
}

.post-comment {
  font-size: 14px;
  line-height: 1.5;
  color: var(--tg-theme-text-color);
  word-wrap: break-word;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 480px) {
  .header {
    padding: 12px 16px;
  }
  
  .header h1 {
    font-size: 16px;
  }
  
  .posts-container {
    padding: 0 12px;
  }
  
  .post {
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  
  .post-header {
    font-size: 12px;
  }
  
  .post-subject {
    font-size: 14px;
  }
  
  .post-comment {
    font-size: 13px;
  }
}

/* Темная тема */
html.dark .post {
  background: var(--tg-theme-secondary-bg-color);
}

html.dark .op-post {
  border-color: var(--tg-theme-button-color);
}
</style> 