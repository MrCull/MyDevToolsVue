<template>
  <div class="container">
    <h1 class="title">To Do List</h1>
    <div>
        <div>
            <button class="primary-btn" @click="addTask" :disabled="!newTask.trim()" data-test-id="add-btn">Add</button>
            <input type="text" v-model="newTask" placeholder="Add a new task" @keyup.enter="addTask" data-test-id="task-input" />
        </div>
        <div>
            <div class="toggle-group">
                <label class="toggle-label">
                    <span class="toggle-text">Active</span>
                    <input type="checkbox" v-model="filters.active" data-test-id="filter-active-checkbox">
                </label>
                <label class="toggle-label">
                    <span class="toggle-text">Completed</span>
                    <input type="checkbox" v-model="filters.completed" data-test-id="filter-completed-checkbox">
                </label>
            </div>
            <button v-show="filters.completed" class="secondary-btn" @click="clearCompleted" data-test-id="delete-completed-btn">Delete Completed</button>
        </div>
        <div>
            <TransitionGroup name="list" tag="ul" class="task-list" data-test-id="task-list">
                <li v-for="task in filteredTasks" :key="task.id" :data-test-id="'task-item-' + task.id">
                    <input type="checkbox" v-model="task.completed" @change="saveTasks" :data-test-id="'task-checkbox-' + task.id" />
                    <span class="task-description" :class="{ completed: task.completed }" :data-test-id="'task-desc-' + task.id">{{ task.description }}</span>
                    <span class="task-date">{{ formatDate(task.addedDate) }}</span>
                    <button class="remove-btn" @click="removeTask(task.id)" aria-label="Remove task" :data-test-id="'remove-task-btn-' + task.id">×</button>
                </li>
            </TransitionGroup>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  addedDate: string;
}

interface FilterState {
  active: boolean;
  completed: boolean;
}

const newTask = ref<string>("");
const tasks = ref<Task[]>([]);
const filters = ref<FilterState>({
  active: true,
  completed: false
});

const filteredTasks = computed<Task[]>(() => {
    return tasks.value.filter(task => (filters.value.active && !task.completed) || (filters.value.completed && task.completed));
});

onMounted(() => {
    loadTasks();
});

const addTask = (): void => {
    const trimmedTask = newTask.value.trim();
    if (trimmedTask) {
        const task: Task = {
            id: crypto.randomUUID(),
            description: trimmedTask,
            completed: false,
            addedDate: new Date().toISOString()
        };
        tasks.value.push(task);
        newTask.value = "";
        saveTasks();
    }
}

const removeTask = (id: string): void => {
    tasks.value = tasks.value.filter(task => task.id !== id);
    saveTasks();
}

const clearCompleted = (): void => {
    tasks.value = tasks.value.filter(task => !task.completed);
    saveTasks();
}

const saveTasks = (): void => {   
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
}

const loadTasks = (): void => {
    try {
        const savedTasks = localStorage.getItem('tasks');
        tasks.value = savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks.value = [];
    }
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

</script>


<style>
.container {
  width: 100%;
  max-width: 800px;
  padding: 2.5rem;
  background: var(--container-bg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  margin: 2rem auto;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #6366f1, #818cf8);
  opacity: 0.8;
}

.dark-mode .container {
  background: var(--container-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
}

.container > div {
  margin-bottom: 2rem;
}

.container input[type="text"] {
  width: 70%;
  padding: 1rem 1.25rem;
  margin: 0 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;
}

.container input[type="text"]:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
  transform: translateY(-2px);
}

.container input[type="text"]::placeholder {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.container input[type="text"]:focus::placeholder {
  opacity: 0.7;
  transform: translateX(5px);
}

.container li {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.container li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #4f46e5, #6366f1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.container li:hover::before {
  opacity: 1;
}

.container li:hover {
  transform: translateX(8px) translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.container .primary-btn {
  background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8) !important;
  color: white !important;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
}

.container .primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.container .primary-btn:hover::before {
  left: 100%;
}

.container .primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.container .primary-btn:active {
  transform: translateY(-1px);
}

.container .secondary-btn {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
  color: #374151 !important;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.5px;
  font-size: 1.1rem;
}

.container .secondary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

/* Enhanced checkbox styles */
.container li input[type="checkbox"] {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid #4f46e5;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
}

.container li input[type="checkbox"]:checked {
  background: #4f46e5;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
}

.container li input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: checkmark 0.3s ease-in-out;
}

@keyframes checkmark {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Enhanced toggle styles */
.toggle-group {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .toggle-group {
  background: rgba(31, 41, 55, 0.5);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.toggle-label:hover {
  background: rgba(79, 70, 229, 0.1);
}

.dark-mode .toggle-label:hover {
  background: rgba(99, 102, 241, 0.2);
}

.toggle-text {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
}

/* Enhanced task description */
.task-description {
  font-size: 1.2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-description.completed {
  text-decoration: line-through;
  opacity: 0.7;
  transform: translateX(10px);
  color: #6b7280;
}

.task-description.completed::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, transparent);
  transform: translateY(-50%);
  opacity: 0.5;
}

/* Enhanced date display */
.task-date {
  font-size: 0.9rem;
  color: #6b7280;
  padding: 0.5rem 0.75rem;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 150px;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: center;
}

.dark-mode .task-date {
  color: #9ca3af;
  background: rgba(75, 85, 99, 0.3);
}

/* Enhanced remove button */
.container li .remove-btn {
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(229, 62, 62, 0.1) !important;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
}

.container li .remove-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(229, 62, 62, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.container li .remove-btn:hover::before {
  width: 100%;
  height: 100%;
}

.container li:hover .remove-btn {
  opacity: 1;
  transform: scale(1.1);
}

/* List animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.9);
}

/* Empty state */
.task-list:empty::before {
  content: 'No tasks yet';
  display: block;
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 1.2rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin: 1rem 0;
}

.dark-mode .task-list:empty::before {
  color: #9ca3af;
  background: rgba(31, 41, 55, 0.5);
}

.dark-mode .toggle-group {
  background: rgba(31, 41, 55, 0.5);
}

.dark-mode .toggle-label:hover {
  background: rgba(99, 102, 241, 0.2);
}

.dark-mode .task-list:empty::before {
  color: #9ca3af;
  background: rgba(31, 41, 55, 0.5);
}

.dark-mode input[type="text"] {
  background: rgba(31, 41, 55, 0.8);
  color: #f3f4f6;
  border-color: #4b5563;
}

.dark-mode input[type="text"]::placeholder {
  color: #9ca3af;
}

.dark-mode .task-description {
  color: #f3f4f6;
}

.dark-mode .task-date {
  color: #9ca3af;
  background: rgba(75, 85, 99, 0.3);
}

.dark-mode li {
  background: rgba(31, 41, 55, 0.8);
  border-color: #4b5563;
}

.dark-mode .task-description.completed {
  color: #9ca3af;
}

.dark-mode input[type="checkbox"] {
  background: #374151;
  border-color: #6366f1;
}

.dark-mode .secondary-btn {
  background: linear-gradient(135deg, #374151, #4b5563) !important;
  color: #f3f4f6 !important;
}
</style> 