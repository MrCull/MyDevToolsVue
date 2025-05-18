  <template>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

    <div class="container">
      <h1 class="title">Counter</h1>
      <div class="counter-display">
        <span class="counter-label">Current Count:</span>
        <span class="counter-value">{{ count }}</span>
      </div>
      
      <div class="message-container">
        <p v-if="showMessage" class="success-message" @animationend="showMessage = false" role="status" aria-live="polite">{{ messageText }}</p>
      </div>
      
      <div class="input-group">
        <label for="increment-value" class="sr-only">Increment value</label>
        <input id="increment-value" type="number" v-model="incrementValue" placeholder="Enter increment value" min="1" step="1" @keyup.enter="increment" />
        <button @click="increment" class="btn btn-primary" aria-label="Add to counter">Add</button>
      </div>
      
      <button @click="reset" class="btn btn-secondary" aria-label="Reset counter to zero">Reset Counter</button>
      
      <div class="history-section" v-if="history.length > 0">
        <h2 class="history-title">Recent Operations</h2>
        <ul class="history-list">
          <li v-for="(item, index) in history" :key="index" class="history-item">
            {{ item.operation }} {{ item.value }} at {{ item.timestamp }} 
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  interface HistoryItem {
    operation: 'Added' | 'Reset from';
    value: number;
    timestamp: string;
  }
  
  const count = ref<number>(0);
  const incrementValue = ref<number>(1);
  const showMessage = ref<boolean>(false);
  const messageText = ref<string>('');
  const history = ref<HistoryItem[]>([]);
  
  const loadSavedData = (): void => {
    try {
      const savedCount = localStorage.getItem('count');
      const savedHistory = localStorage.getItem('history');
      
      if (savedCount !== null) {
        const parsedCount = parseInt(savedCount);
        count.value = isNaN(parsedCount) ? 0 : parsedCount;
      }
      
      if (savedHistory !== null) {
        history.value = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      count.value = 0;
      history.value = [];
    }
  };
  
  const addToHistory = (operation: HistoryItem['operation'], value: number): void => {
    const item: HistoryItem = {
      operation,
      value,
      timestamp: new Date().toLocaleTimeString()
    };
    history.value.unshift(item);
    if (history.value.length > 5) history.value.pop();
    
    try {
      localStorage.setItem('history', JSON.stringify(history.value));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const showSaveMessage = (message: string): void => {
    messageText.value = message;
    showMessage.value = true;
  };

  const increment = (): void => {
    const value = Number(incrementValue.value);
    
    if (isNaN(value) || value < 1) {
      showSaveMessage('Please enter a valid number greater than 0');
      return;
    }

    count.value += value;
    addToHistory('Added', value);
    
    try {
      localStorage.setItem('count', count.value.toString());
      showSaveMessage(`Added ${value} to counter`);
    } catch (error) {
      console.error('Error saving count to localStorage:', error);
      showSaveMessage('Error saving count. Please try again.');
    }
  };

  const reset = (): void => {
    if (count.value !== 0) {
      addToHistory('Reset from', count.value);
      count.value = 0;
      
      try {
        localStorage.setItem('count', '0');
        showSaveMessage('Counter reset to 0');
      } catch (error) {
        console.error('Error resetting count in localStorage:', error);
        showSaveMessage('Error resetting counter. Please try again.');
      }
    }
  };

  loadSavedData();
  </script>
  
  <style>
  .theme-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  .theme-btn:hover {
    transform: scale(1.1);
  }

  :root {
    --bg-gradient-start: #667eea;
    --bg-gradient-end: #764ba2;
    --container-bg: rgba(255, 255, 255, 0.95);
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --counter-bg: #f7fafc;
    --input-bg: #ffffff;
    --input-border: #e2e8f0;
    --input-focus-border: #667eea;
    --input-focus-shadow: rgba(102, 126, 234, 0.1);
    --btn-primary-bg: #667eea;
    --btn-primary-hover: #5a67d8;
    --btn-secondary-bg: #f3f4f6;
    --btn-secondary-text: #6b7280;
    --btn-secondary-border: #e5e7eb;
    --btn-secondary-hover: #e5e7eb;
    --success-color: #48bb78;
    --history-bg: #f7fafc;
    --history-border: #e2e8f0;
  }

  body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
  }

  .container {
    max-width: 400px;
    width: 90%;
    padding: 2rem;
    background: var(--container-bg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    margin: 2rem auto;
  }

  .dark-mode .container {
    background: rgba(31, 41, 55, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .title {
    color: var(--text-primary);
    font-size: 1.8rem;
    margin-bottom: 2rem;
    font-weight: 600;
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .counter-display {
    background: var(--counter-bg);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .counter-label {
    display: block;
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .counter-value {
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    justify-content: center;
  }

  input {
    width: 120px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid var(--input-border);
    border-radius: 8px;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
    background: var(--input-bg);
    color: var(--text-primary);
  }

  input:focus {
    outline: none;
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
  }

  .btn-primary {
    background: var(--btn-primary-bg);
    color: white;
    min-width: 100px;
  }

  .btn-primary:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border: 1px solid var(--btn-secondary-border);
  }

  .btn-secondary:hover {
    background: var(--btn-secondary-hover);
    transform: translateY(-1px);
  }

  .message-container {
    min-height: 2.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success-message {
    color: var(--success-color);
    font-weight: 500;
    animation: fadeInOut 2s ease-in-out;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .history-section {
    margin-top: 2rem;
    text-align: left;
    background: var(--history-bg);
    padding: 1rem;
    border-radius: 8px;
  }

  .history-title {
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .history-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--history-border);
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .dark-mode .history-section {
    background: rgba(31, 41, 55, 0.8);
  }

  .dark-mode .history-title {
    color: #f3f4f6;
  }

  .dark-mode .history-item {
    color: #e5e7eb;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  </style>
  