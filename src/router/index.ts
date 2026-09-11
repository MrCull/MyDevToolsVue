import { createRouter, createWebHistory } from 'vue-router'
import ToolDashboard from '../components/ToolDashboard.vue'
import { tools } from '../toolRegistry'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ToolDashboard },
    ...tools.map((tool) => ({ path: tool.path, component: tool.component })),
  ],
})

export default router
