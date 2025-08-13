<template>
  <div class="home-view">
    <div class="header">
      <h1>2ch Boards</h1>
    </div>
    
    <div class="content">
      <div id="boards-container">
        <div v-for="(boards, category) in groupedBoards" :key="category" class="section">
          <div class="section-title">{{ category }}</div>
          
          <div class="section-content">
            <div class="boards-list">
              <div 
                v-for="board in boards" 
                :key="board.id" 
                class="board-item" 
                @click="openBoard(board)"
              >
                <span class="board-name">/{{ board.id }}/ - {{ board.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      boards: [],
      categoryOrder: [
        "Тематика", 
        "Японская культура", 
        "Технологии", 
        "Творчество", 
        "Развлечения", 
        "Медиа", 
        "Политика", 
        "Разное", 
        "Взрослый контент"
      ]
    }
  },
  computed: {
    groupedBoards() {
      const categories = {};
      
      // Группируем доски по категориям
      this.boards.forEach(board => {
        if (!categories[board.category]) {
          categories[board.category] = [];
        }
        categories[board.category].push(board);
      });
      
      // Сортируем доски внутри категорий по алфавиту
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          categories[category].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        }
      }
      
      // Создаем новый объект с отсортированными категориями
      const sortedCategories = {};
      this.categoryOrder.forEach(category => {
        if (categories[category]) {
          sortedCategories[category] = categories[category];
        }
      });
      
      return sortedCategories;
    }
  },
  mounted() {
    this.loadBoards();
  },
  methods: {
    async loadBoards() {
      try {
        // Загружаем данные из локального JSON файла
        const response = await fetch('/boards.json');
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        this.boards = data.boards || [];
      } catch (error) {
        console.error('Ошибка при загрузке досок:', error);
      }
    },
    openBoard(board) {
      // Сохраняем информацию о доске в localStorage
      localStorage.setItem('boardInfo_' + board.id, JSON.stringify({
        id: board.id,
        name: board.name
      }));
      
      // Переходим на страницу доски
      this.$router.push({
        name: 'board',
        params: {
          board: board.id
        }
      });
    }
  }
}
</script>

<style scoped>
.home-view {
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

.header h1 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  color: var(--tg-theme-text-color);
}

.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  margin: 16px 16px 8px;
  color: var(--tg-theme-hint-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-content {
  background-color: var(--tg-theme-secondary-bg-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 0 16px;
}

.boards-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.board-item {
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  color: var(--tg-theme-text-color);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  position: relative;
}

html.dark .board-item {
  border-bottom-color: rgba(255,255,255,0.05);
}

.board-item:last-child {
  border-bottom: none;
}

.board-item:active {
  background-color: rgba(0,0,0,0.05);
}

html.dark .board-item:active {
  background-color: rgba(255,255,255,0.05);
}

.board-item:after {
  content: '›';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--tg-theme-hint-color);
}

.board-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  padding-right: 20px;
}
</style> 