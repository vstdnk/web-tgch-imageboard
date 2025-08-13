import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'
import ThreadView from '../views/ThreadView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/board/:board',
      name: 'board',
      component: BoardView,
      props: true
    },
    {
      path: '/board/:board/thread/:thread',
      name: 'thread',
      component: ThreadView,
      props: true
    }
    // Здесь можно добавить другие маршруты по необходимости
  ]
})

export default router 