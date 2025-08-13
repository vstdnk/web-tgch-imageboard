const API_BASE_URL = 'https://2ch.hk'
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest='
]

/**
 * API сервис для работы с досками Два.ч
 */
export class BoardsAPI {
  /**
   * Получить список всех досок
   * @returns {Promise<Array>} Список досок
   */
  static async getBoards() {
    console.log('Загрузка списка досок...')
    
    for (const proxy of CORS_PROXIES) {
      try {
        const url = proxy === 'https://api.allorigins.win/raw?url=' 
          ? `${proxy}${encodeURIComponent(`${API_BASE_URL}/api/boards.json`)}`
          : `${proxy}${encodeURIComponent(`${API_BASE_URL}/api/boards.json`)}`
        
        console.log(`Пробуем прокси: ${proxy}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 секунд таймаут
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Данные досок успешно загружены')
          return this.processBoardsData(data)
        } else {
          console.warn(`Прокси ${proxy} вернул статус: ${response.status}`)
        }
      } catch (error) {
        console.warn(`CORS proxy ${proxy} failed:`, error.message)
        continue
      }
    }
    
    // Fallback на локальные данные если все прокси не работают
    console.warn('All CORS proxies failed, using fallback data')
    return this.getFallbackBoards()
  }
  
  static getFallbackBoards() {
    // Возвращаем базовый список досок для fallback
    return [
      { id: 'b', name: 'Бред', category: 'Тематика', description: 'Доска для обсуждения всего подряд' },
      { id: 'o', name: 'Общение', category: 'Тематика', description: 'Доска для общения' },
      { id: 'soc', name: 'Общество', category: 'Тематика', description: 'Общественные темы' },
      { id: 'media', name: 'Медиа', category: 'Медиа', description: 'Медиа контент' },
      { id: 'a', name: 'Аниме', category: 'Японская культура', description: 'Аниме и манга' },
      { id: 'v', name: 'Видеоигры', category: 'Развлечения', description: 'Видеоигры' },
      { id: 'p', name: 'Фото', category: 'Творчество', description: 'Фотографии' },
      { id: 's', name: 'Программирование', category: 'Технологии', description: 'Программирование' }
    ]
  }
  
  static processBoardsData(data) {
    // Преобразуем данные в нужный формат
    const boards = []
    
    // Обрабатываем основные доски
    if (data.boards) {
      Object.keys(data.boards).forEach(boardId => {
        const board = data.boards[boardId]
        boards.push({
          id: boardId,
          name: board.name || boardId,
          category: this.mapCategory(board.category || 'Разное'),
          description: board.description || '',
          bump_limit: board.bump_limit || 500,
          pages: board.pages || 10
        })
      })
    }
    
    // Обрабатываем дополнительные доски если есть
    if (data.additional_boards) {
      Object.keys(data.additional_boards).forEach(boardId => {
        const board = data.additional_boards[boardId]
        boards.push({
          id: boardId,
          name: board.name || boardId,
          category: this.mapCategory(board.category || 'Разное'),
          description: board.description || '',
          bump_limit: board.bump_limit || 500,
          pages: board.pages || 10
        })
      })
    }
    
    return boards
  }
  
  /**
   * Получить треды с доски
   * @param {string} boardId - ID доски
   * @param {number} page - Номер страницы (по умолчанию 1)
   * @returns {Promise<Object>} Данные тредов
   */
  static async getThreads(boardId, page = 1) {
    console.log(`Загрузка тредов для доски ${boardId}, страница ${page}...`)
    
    for (const proxy of CORS_PROXIES) {
      try {
        const url = proxy === 'https://api.allorigins.win/raw?url=' 
          ? `${proxy}${encodeURIComponent(`${API_BASE_URL}/${boardId}/${page}.json`)}`
          : `${proxy}${encodeURIComponent(`${API_BASE_URL}/${boardId}/${page}.json`)}`
        
        console.log(`Пробуем прокси для тредов: ${proxy}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 секунд таймаут для тредов
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Треды для доски ${boardId} успешно загружены`)
          return this.processThreadsData(data, boardId, page)
        } else {
          console.warn(`Прокси ${proxy} вернул статус для тредов: ${response.status}`)
        }
      } catch (error) {
        console.warn(`CORS proxy ${proxy} failed for threads:`, error.message)
        continue
      }
    }
    
    // Fallback на моковые данные если все прокси не работают
    console.warn('All CORS proxies failed for threads, using fallback data')
    return this.getFallbackThreads(boardId, page)
  }
  
  static getFallbackThreads(boardId, page) {
    // Возвращаем моковые треды для fallback
    return {
      threads: [
        {
          id: 1,
          title: 'Тестовый тред 1',
          thumbnail: 'https://via.placeholder.com/300x200',
          image_url: 'https://via.placeholder.com/800x600',
          created_at: Date.now() / 1000,
          posts_count: 5,
          files_count: 2,
          views: 100,
          score: 0
        },
        {
          id: 2,
          title: 'Тестовый тред 2',
          thumbnail: 'https://via.placeholder.com/300x200',
          image_url: 'https://via.placeholder.com/800x600',
          created_at: Date.now() / 1000,
          posts_count: 3,
          files_count: 1,
          views: 50,
          score: 0
        },
        {
          id: 3,
          title: 'Тестовый тред 3',
          thumbnail: 'https://via.placeholder.com/300x200',
          image_url: 'https://via.placeholder.com/800x600',
          created_at: Date.now() / 1000,
          posts_count: 8,
          files_count: 3,
          views: 200,
          score: 0
        }
      ],
      page: page,
      pages: 1
    }
  }
  
  static processThreadsData(data, boardId, page) {
    // Преобразуем данные в удобный формат
    const threads = []
    
    if (data.threads) {
      data.threads.forEach(thread => {
        // Ищем первое изображение в треде
        let firstImage = null
        if (thread.posts && thread.posts.length > 0) {
          const firstPost = thread.posts[0]
          if (firstPost.files && firstPost.files.length > 0) {
            firstImage = firstPost.files[0]
          }
        }
        
        // Формируем заголовок треда
        let title = 'Без названия'
        if (thread.posts && thread.posts[0]) {
          const firstPost = thread.posts[0]
          if (firstPost.subject) {
            title = firstPost.subject
          } else if (firstPost.comment) {
            // Берем первые 100 символов комментария
            title = firstPost.comment.replace(/<[^>]*>/g, '').substring(0, 100)
            if (title.length === 100) title += '...'
          }
        }
        
        threads.push({
          id: thread.num,
          title: title,
          thumbnail: firstImage ? this.getThumbnailUrl(boardId, firstImage.name) : null,
          image_url: firstImage ? this.getImageUrl(boardId, firstImage.name) : null,
          created_at: thread.date,
          posts_count: thread.posts_count || 0,
          files_count: thread.files_count || 0,
          views: thread.views || 0,
          score: thread.score || 0
        })
      })
    }
    
    console.log(`Обработано ${threads.length} тредов для доски ${boardId}`)
    
    return {
      threads: threads,
      page: page,
      pages: data.pages || 1
    }
  }
  
  /**
   * Получить конкретный тред
   * @param {string} boardId - ID доски
   * @param {string} threadId - ID треда
   * @returns {Promise<Object>} Данные треда
   */
  static async getThread(boardId, threadId) {
    console.log(`Загрузка треда ${threadId} с доски ${boardId}...`)
    
    for (const proxy of CORS_PROXIES) {
      try {
        const url = proxy === 'https://api.allorigins.win/raw?url=' 
          ? `${proxy}${encodeURIComponent(`${API_BASE_URL}/${boardId}/res/${threadId}.json`)}`
          : `${proxy}${encodeURIComponent(`${API_BASE_URL}/${boardId}/res/${threadId}.json`)}`
        
        console.log(`Пробуем прокси для треда: ${proxy}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 20000 // 20 секунд таймаут для треда
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Тред ${threadId} успешно загружен`)
          return data
        } else {
          console.warn(`Прокси ${proxy} вернул статус для треда: ${response.status}`)
        }
      } catch (error) {
        console.warn(`CORS proxy ${proxy} failed for thread:`, error.message)
        continue
      }
    }
    
    throw new Error('All CORS proxies failed for thread')
  }
  
  /**
   * Маппинг категорий с английского на русский
   * @param {string} category - Категория на английском
   * @returns {string} Категория на русском
   */
  static mapCategory(category) {
    const categoryMap = {
      'Разное': 'Разное',
      'Тематика': 'Тематика',
      'Японская культура': 'Японская культура',
      'Технологии': 'Технологии',
      'Творчество': 'Творчество',
      'Развлечения': 'Развлечения',
      'Медиа': 'Медиа',
      'Политика': 'Политика',
      'Взрослый контент': 'Взрослый контент',
      'Other': 'Разное',
      'Thematic': 'Тематика',
      'Japanese Culture': 'Японская культура',
      'Technology': 'Технологии',
      'Creative': 'Творчество',
      'Entertainment': 'Развлечения',
      'Media': 'Медиа',
      'Politics': 'Политика',
      'Adult Content': 'Взрослый контент'
    }
    
    return categoryMap[category] || 'Разное'
  }
  
  /**
   * Получить URL изображения
   * @param {string} boardId - ID доски
   * @param {string} filename - Имя файла
   * @returns {string} URL изображения
   */
  static getImageUrl(boardId, filename) {
    return `${API_BASE_URL}/${boardId}/${filename}`
  }
  
  /**
   * Получить URL превью изображения
   * @param {string} boardId - ID доски
   * @param {string} filename - Имя файла
   * @returns {string} URL превью
   */
  static getThumbnailUrl(boardId, filename) {
    // Для превью обычно используется суффикс _thumb
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const ext = filename.split('.').pop()
    return `${API_BASE_URL}/${boardId}/thumb/${nameWithoutExt}_thumb.${ext}`
  }
} 