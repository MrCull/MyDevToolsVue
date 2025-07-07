<template>
    <div class="container">
        <h1 class="title">GUID Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="format">Min</label>
                    <input 
                        type="number"
                        id="min"
                        v-model="min"
                        class="input-field"
                        data-test-id="min-input"
                    />
                </div>

                <div class="form-group">
                    <label for="max">Max</label>
                    <input 
                        type="number"
                        id="max"
                        v-model="max"
                        class="input-field"
                        data-test-id="max-input"
                    />
                </div>

                <div class="form-group">
                    <label for="quantity">Number of numbers to Generate</label>
                    <input 
                        type="number" 
                        id="quantity"
                        v-model="quantity"
                        min="1"
                        max="100"
                        class="input-field"
                        data-test-id="quantity-input"
                    />
                </div>

                <div class="button-group">
                    <button 
                        @click="generateNumbers" 
                        class="primary-btn"
                        data-test-id="generate-btn"
                    >
                        Generate
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!numbers.length"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated Numbers</h2>
                <div v-if="numbers.length" class="numbers-list" data-test-id="numbers-output">
                    <div v-for="number in numbers" :key="number" class="number-item">
                        <span class="number-value" :class="{ 'copied': copiedNumbers.has(number) }">{{ number }}</span>
                        <button @click="copyToClipboard(number)" class="copy-btn" :class="{ 'copied': copiedNumbers.has(number) }" :data-test-id="'copy-btn-' + number">
                            {{ copiedNumbers.has(number) ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Generated numbers will appear here
                </div>
            </div>
        </div>
    </div>
</template>
              
<script setup lang="ts">
import { ref } from 'vue';

const min = ref(0);
const max = ref(100);
const quantity = ref(5);
const numbers = ref<number[]>([]);
const copiedNumbers = ref<Set<number>>(new Set());

const generateNumbers = () => {
    copiedNumbers.value.clear();
    numbers.value = Array.from({ length: quantity.value }, () => Math.floor(Math.random() * (max.value - min.value + 1)) + min.value);
};

const clearAll = () => {
    numbers.value = [];
    copiedNumbers.value.clear();
};

const copyToClipboard = async (number: number) => {
    try {
        await navigator.clipboard.writeText(number.toString());
        copiedNumbers.value.add(number);
        copiedNumbers.value = new Set(copiedNumbers.value);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};
</script>

<style scoped>
.container {
    width: 100%;
    max-width: 1000px;
    padding: 2rem;
    background: var(--container-bg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    margin: 2rem auto;
    border: 1px solid var(--border-color);
}

.title {
    font-size: 2.5rem;
    margin-bottom: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
}

.generator-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.output-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 500px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-field {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.75rem;
    background: var(--container-bg);
    color: var(--nav-text);
    transition: all 0.3s ease;
}

.input-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.input-field option {
    font-size: 0.75rem;
    padding: 0.5rem;
}

label {
    font-weight: 600;
    color: var(--nav-text);
    text-align: left;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.primary-btn, .secondary-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    flex: 1;
}

.primary-btn {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: white;
}

.primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.secondary-btn {
    background: var(--button-bg);
    color: var(--button-text);
}

.secondary-btn:hover:not(:disabled) {
    background: var(--button-hover);
}

.primary-btn:disabled, .secondary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--nav-text);
}

.numbers-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.number-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s ease;
    gap: 1rem;
}

.number-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
}       

.number-value {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--nav-text);
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    flex: 1;
    min-width: 0;
    padding: 0.25rem 0;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.number-value::-webkit-scrollbar {
    display: none;
}

.number-value.copied {
    text-decoration: line-through;
    opacity: 0.7;
}

.copy-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: var(--button-bg);
    color: var(--button-text);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    min-width: 70px;
    flex-shrink: 0;
}

.copy-btn.copied {
    background: #10B981;
    color: white;
}

.copy-btn:hover {
    background: var(--button-hover);
}

.copy-btn.copied:hover {
    background: #059669;
}

.placeholder-message {
    text-align: center;
    padding: 2rem;
    color: var(--nav-text);
    opacity: 0.5;
    font-style: italic;
    border: 2px dashed var(--border-color);
    border-radius: 8px;
}

@media (max-width: 768px) {
    .generator-content {
        grid-template-columns: 1fr;
    }

    .container {
        width: 95%;
        padding: 1.5rem;
    }

    .title {
        font-size: 2rem;
        margin-bottom: 2rem;
    }
}

.dark-mode .container-item {
    background: rgba(31, 41, 55, 0.3);
}
</style>