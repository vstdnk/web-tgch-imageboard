const API_BASE_URL = 'https://2ch.hk'

/**
 * API сервис для работы с досками Два.ч
 */
export class BoardsAPI {
  /**
   * Получить список всех досок
   * @returns {Promise<Array>} Список досок
   */
  static async getBoards() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/v2/boards`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ошибка при загрузке досок:', error)
      throw error
    }
  }
  
  /**
   * Получить треды с доски
   * @param {string} boardId - ID доски
   * @param {number} page - Номер страницы (по умолчанию 1)
   * @returns {Promise<Object>} Данные тредов
   */
  static async getThreads(boardId, page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/${boardId}/${page}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.processThreadsData(data, boardId, page)
    } catch (error) {
      console.error('Ошибка при загрузке тредов:', error)
      throw error
    }
  }
  
  static processThreadsData(data, boardId, page) {
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
    try {
      const response = await fetch(`${API_BASE_URL}/${boardId}/res/${threadId}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ошибка при загрузке треда:', error)
      throw error
    }
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
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const ext = filename.split('.').pop()
    return `${API_BASE_URL}/${boardId}/thumb/${nameWithoutExt}_thumb.${ext}`
  }
} 