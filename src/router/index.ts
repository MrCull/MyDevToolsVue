import { createRouter, createWebHistory } from 'vue-router'
import ToolDashboard from '../components/ToolDashboard.vue'
import NotFound from '../components/NotFound.vue'
import { tools } from '../toolRegistry'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: ToolDashboard },
    ...tools.map((tool) => ({ path: tool.path, name: tool.id, component: tool.loader, meta: { toolId: tool.id } })),
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
  scrollBehavior(to, from) { return to.path === from.path ? false : { top: 0 } },
})
