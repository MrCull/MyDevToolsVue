import { createRouter, createWebHistory } from 'vue-router'
import JsonFormatter from '../components/JsonFormatter.vue'
import SqlFormatter from '../components/SqlFormatter.vue'
import CSharpFormatter from '../components/CSharpFormatter.vue'
import DiffTool from '../components/DiffTool.vue'
import BranchFormatter from '../components/BranchFormatter.vue'
import ContainerGenerator from '../components/ContainerGenerator.vue'
import GuidGenerator from '../components/GuidGenerator.vue'
import PasswordGenerator from '../components/PasswordGenerator.vue'
import HashGenerator from '../components/HashGenerator.vue'
import QRCodeGenerator from '../components/QRCodeGenerator.vue'
import TimeZoneConverter from '../components/TimeZoneConverter.vue'
import NumberBaseConverter from '../components/NumberBaseConverter.vue'
import UnitConverter from '../components/UnitConverter.vue'
import CronGenerator from '../components/CronGenerator.vue'
import RandomNumbers from '../components/RandomNumbers.vue'
import ToDoList from '../components/ToDoList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/json'
    },
    {
      path: '/json',
      component: JsonFormatter
    },
    {
      path: '/sql',
      component: SqlFormatter
    },
    {
      path: '/csharp',
      component: CSharpFormatter
    },
    {
      path: '/diff',
      component: DiffTool
    },
    {
      path: '/branch',
      component: BranchFormatter
    },
    {
      path: '/container',
      component: ContainerGenerator
    },
    {
      path: '/guid',
      component: GuidGenerator
    },
    {
      path: '/password',
      component: PasswordGenerator
    },
    {
      path: '/hash',
      component: HashGenerator
    },
    {
      path: '/qrcode',
      component: QRCodeGenerator
    },
    {
      path: '/timezone',
      component: TimeZoneConverter
    },
    {
      path: '/numberbase',
      component: NumberBaseConverter
    },
    {
      path: '/unit',
      component: UnitConverter
    },
    {
      path: '/cron',
      component: CronGenerator
    },
    {
      path: '/randomnumbers',
      component: RandomNumbers
    },
    {
      path: '/todo',
      component: ToDoList
    }
  ]
})

export default router 