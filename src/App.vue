<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const currentPage = ref('counter');
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
          <div class="nav-brand">First App</div>
          
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
          <!-- <button 
            @click="currentPage = 'counter'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'counter' }"
          >
            🔢 Counter
          </button> -->
          <button 
            @click="currentPage = 'todo'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'todo' }"
          >
            ✅ To Do List
          </button>
          <!-- <button 
            @click="currentPage = 'weather'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'weather' }"
          >
            🌤️ Weather
          </button> -->
          <button 
            @click="currentPage = 'json'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'json' }"
          >
            📋 JSON
          </button>
          <button 
            @click="currentPage = 'container'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'container' }"
          >
            📦 Container
          </button>
          <button 
            @click="currentPage = 'guid'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'guid' }"
          >
            🔑 GUID
          </button>
          <button 
            @click="currentPage = 'branch'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'branch' }"
          >
            🔀 Branch
          </button>
          <button 
            @click="currentPage = 'diff'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'diff' }"
          >
            🔄 Diff
          </button>
          <button 
            @click="currentPage = 'sql'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'sql' }"
          >
            🗄️ SQL
          </button>
          <button 
            @click="currentPage = 'password'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'password' }"
          >
            🔐 Password
          </button>
          <button 
            @click="currentPage = 'timezone'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'timezone' }"
          >
            🌍 Time Zone
          </button>
          <button 
            @click="currentPage = 'qrcode'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'qrcode' }"
          >
            📱 QR Code
          </button>
          <button 
            @click="currentPage = 'csharp'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'csharp' }"
          >
            💻 C# Formatter
          </button>
          <button 
            @click="currentPage = 'hash'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'hash' }"
          >
            🔒 Hash Generator
          </button>
          <button 
            @click="currentPage = 'numberbase'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'numberbase' }"
          >
            🔢 Number Base
          </button>
          <button 
            @click="currentPage = 'unit'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'unit' }"
          >
            📏 Unit Converter
          </button>
          <button 
            @click="currentPage = 'cron'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'cron' }"
          >
            ⏰ Cron Generator
          </button>
          <button 
            @click="currentPage = 'randomnumbers'; isMenuOpen = false" 
            class="nav-link"
            :class="{ active: currentPage === 'randomnumbers' }"
          >
          🎲 Random Nums
          </button>
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
      <!-- <Counter v-if="currentPage === 'counter'" /> -->
      <ToDoList v-if="currentPage === 'todo'" />
      <!-- <Weather v-if="currentPage === 'weather'" /> -->
      <JsonFormatter v-if="currentPage === 'json'" />
      <ContainerGenerator v-if="currentPage === 'container'" />
      <GuidGenerator v-if="currentPage === 'guid'" />
      <BranchFormatter v-if="currentPage === 'branch'" />
      <DiffTool v-if="currentPage === 'diff'" />
      <SqlFormatter v-if="currentPage === 'sql'" />
      <PasswordGenerator v-if="currentPage === 'password'" />
      <TimeZoneConverter v-if="currentPage === 'timezone'" />
      <QRCodeGenerator v-if="currentPage === 'qrcode'" />
      <CSharpFormatter v-if="currentPage === 'csharp'" />
      <HashGenerator v-if="currentPage === 'hash'" />
      <NumberBaseConverter v-if="currentPage === 'numberbase'" />
      <UnitConverter v-if="currentPage === 'unit'" />
      <CronGenerator v-if="currentPage === 'cron'" />
      <RandomNumbers v-if="currentPage === 'randomnumbers'" />
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
