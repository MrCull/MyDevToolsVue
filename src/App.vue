<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import Counter from './components/Counter.vue';
import ToDoList from './components/ToDoList.vue';
// import Weather from './components/Weather.vue';
import JsonFormatter from './components/JsonFormatter.vue';
import ContainerGenerator from './components/ContainerGenerator.vue';
import GuidGenerator from './components/GuidGenerator.vue';
import BranchFormatter from './components/BranchFormatter.vue';
import DiffTool from './components/DiffTool.vue';
import SqlFormatter from './components/SqlFormatter.vue';
import PasswordGenerator from './components/PasswordGenerator.vue';
import TimeZoneConverter from './components/TimeZoneConverter.vue';
import QRCodeGenerator from './components/QRCodeGenerator.vue';
import CSharpFormatter from './components/CSharpFormatter.vue';
import HashGenerator from './components/HashGenerator.vue';
import NumberBaseConverter from './components/NumberBaseConverter.vue';
import UnitConverter from './components/UnitConverter.vue';
import CronGenerator from './components/CronGenerator.vue';
import RandomNumbers from './components/RandomNumbers.vue';

const router = useRouter();
const isDarkMode = ref(false);
const isMenuOpen = ref(false);
const isMobile = ref(window.innerWidth < 768);

const updateDeviceType = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    isDarkMode.value = savedTheme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode.value);
    
    // Check device size on mount
    updateDeviceType();
    
    // Add resize listener
    window.addEventListener('resize', updateDeviceType);
});

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDarkMode.value);
};
</script>

<template>
  <div class="app app-diff-mode">
    <nav class="navbar" :class="{ 'navbar-mobile': isMobile }">
      <div class="nav-container">
        <div class="nav-header">
          <div class="nav-brand">MyDevTools</div>
          
          <!-- Hamburger menu button for mobile -->
          <button 
            @click="isMenuOpen = !isMenuOpen" 
            class="hamburger-btn"
            :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
            :class="{ 'is-open': isMenuOpen }"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <!-- Navigation links -->
        <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
          <router-link 
            to="/json" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            📋 JSON
          </router-link>
          <router-link 
            to="/sql" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🗄️ SQL
          </router-link>
          <router-link 
            to="/csharp" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            💻 C# Formatter
          </router-link>
          <router-link 
            to="/diff" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔄 Diff
          </router-link>
          <router-link 
            to="/branch" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔀 Branch
          </router-link>
          <router-link 
            to="/container" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            📦 Container
          </router-link>
          <router-link 
            to="/guid" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔑 GUID
          </router-link>
          <router-link 
            to="/password" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔐 Password
          </router-link>
          <router-link 
            to="/hash" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔒 Hash Generator
          </router-link>
          <router-link 
            to="/qrcode" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            📱 QR Code
          </router-link>
          <router-link 
            to="/timezone" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🌍 Time Zone
          </router-link>
          <router-link 
            to="/numberbase" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🔢 Number Base
          </router-link>
          <router-link 
            to="/unit" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            📏 Unit Converter
          </router-link>
          <router-link 
            to="/cron" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            ⏰ Cron Generator
          </router-link>
          <router-link 
            to="/randomnumbers" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            🎲 Random Nums
          </router-link>
          <router-link 
            to="/todo" 
            class="nav-link"
            @click="isMenuOpen = false"
          >
            ✅ To Do List
          </router-link>
          <a 
            href="https://www.blazor.mydevtools.org" 
            class="nav-link theme-toggle"
          >
            🔄 Blazor Version
          </a>
          <button 
            @click="toggleTheme" 
            class="nav-link theme-toggle"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            {{ isDarkMode ? '☀️ Light Mode' : '🌘 Dark Mode' }}
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content main-diff-mode">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  --nav-bg: rgba(255, 255, 255, 0.95);
  --nav-text: #2d3748;
  --nav-hover: #667eea;
  --nav-active: #5a67d8;
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --button-bg: #f3f4f6;
  --button-text: #374151;
  --button-hover: #e5e7eb;
  --border-color: #e5e7eb;
  --container-bg: #ffffff;
  --body-bg: #f3f4f6;
  --max-width: 1200px;
  --nav-width: 200px;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--body-bg);
  color: var(--nav-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

body.dark-mode {
  --nav-bg: rgba(31, 41, 55, 0.95);
  --nav-text: #f3f4f6;
  --nav-hover: #818cf8;
  --nav-active: #6366f1;
  --primary-color: #818cf8;
  --primary-hover: #6366f1;
  --button-bg: #374151;
  --button-text: #f3f4f6;
  --button-hover: #4b5563;
  --border-color: #4b5563;
  --container-bg: #1f2937;
  --body-bg: #111827;
}

.app {
  min-height: 100vh;
  min-width: 100%;
  display: flex;
  flex-direction: row;
  width: 100%;
}

/* Desktop Navigation (left sidebar) */
.navbar {
  background: var(--nav-bg);
  width: var(--nav-width);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.navbar-mobile {
  width: 100%;
  height: auto;
  position: sticky;
  top: 0;
  border-right: none;
  border-bottom: 1px solid var(--border-color);
}

.nav-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.nav-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--nav-text);
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-link {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: var(--nav-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-align: left;
  position: relative;
  opacity: 0.7;
  width: 100%;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  opacity: 1;
  background: rgba(99, 102, 241, 0.05);
}

.nav-link.active {
  opacity: 1;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--primary-color);
}

.theme-toggle {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
  padding-top: 1rem;
}

.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.hamburger-btn span {
  width: 100%;
  height: 2px;
  background: var(--nav-text);
  transition: all 0.3s ease;
}

.hamburger-btn.is-open span:first-child {
  transform: translateY(9px) rotate(45deg);
}

.hamburger-btn.is-open span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.is-open span:last-child {
  transform: translateY(-9px) rotate(-45deg);
}

.main-content {
  flex: 1;
  margin-left: var(--nav-width);
  width: calc(100% - var(--nav-width));
  background: var(--body-bg);
  padding: 0;
  display: flex;
  justify-content: center;
}

.app-diff-mode .main-content {
  padding: 0;
}

/* Container styles for different components */
.diff-container {
  width: 100%;
  max-width: 100%;
  border-radius: 0;
}

/* Mobile styles */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .navbar {
    width: 100%;
    height: auto;
    position: sticky;
  }
  
  .nav-container {
    flex-direction: column;
  }
  
  .nav-header {
    padding: 1rem;
  }
  
  .hamburger-btn {
    display: flex;
  }
  
  .nav-links {
    display: none;
    padding: 0;
  }
  
  .nav-links.is-open {
    display: flex;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }
  
  .nav-brand {
    font-size: 1.25rem;
  }
  
  .theme-toggle {
    margin-top: 0;
    border-top: none;
  }
}

@media (max-width: 480px) {
  .nav-header {
    padding: 0.75rem 1rem;
  }
}
</style>
