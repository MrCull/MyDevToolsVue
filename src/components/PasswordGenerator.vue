<template>
    <div class="container">
        <h1 class="title">Password Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="length">Password Length</label>
                    <div class="length-control">
                        <input 
                            type="range" 
                            id="length"
                            v-model="length"
                            min="8"
                            max="64"
                            class="range-input"
                            data-test-id="length-range"
                        />
                        <span class="length-value" data-test-id="length-value">{{ length }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Character Types</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                v-model="options.uppercase"
                                data-test-id="uppercase-checkbox"
                            />
                            Uppercase (A-Z)
                        </label>
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                v-model="options.lowercase"
                                data-test-id="lowercase-checkbox"
                            />
                            Lowercase (a-z)
                        </label>
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                v-model="options.numbers"
                                data-test-id="numbers-checkbox"
                            />
                            Numbers (0-9)
                        </label>
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                v-model="options.symbols"
                                data-test-id="symbols-checkbox"
                            />
                            Symbols (!@#$%^&*)
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="quantity">Number of Passwords</label>
                    <input 
                        type="number" 
                        id="quantity"
                        v-model="quantity"
                        min="1"
                        max="10"
                        class="input-field"
                        data-test-id="quantity-input"
                    />
                </div>

                <div class="button-group">
                    <button 
                        @click="generatePasswords" 
                        class="primary-btn"
                        :disabled="!isValidOptions"
                        data-test-id="generate-btn"
                    >
                        Generate
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!passwords.length"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated Passwords</h2>
                <div v-if="passwords.length" class="password-list" data-test-id="password-output">
                    <div v-for="(password, index) in passwords" :key="index" class="password-item">
                        <span class="password-text" :class="{ 'copied': copiedPasswords.has(password) }">{{ password }}</span>
                        <button @click="copyToClipboard(password)" class="copy-btn" :class="{ 'copied': copiedPasswords.has(password) }" :data-test-id="'copy-btn-' + index">
                            {{ copiedPasswords.has(password) ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Generated passwords will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const length = ref(16);
const quantity = ref(1);
const passwords = ref<string[]>([]);
const copiedPasswords = ref<Set<string>>(new Set());

const options = ref({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
});

const isValidOptions = computed(() => {
    return options.value.uppercase || 
           options.value.lowercase || 
           options.value.numbers || 
           options.value.symbols;
});

const generatePassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = '';
    if (options.value.uppercase) chars += uppercase;
    if (options.value.lowercase) chars += lowercase;
    if (options.value.numbers) chars += numbers;
    if (options.value.symbols) chars += symbols;
    
    if (!chars) return '';
    
    let password = '';
    for (let i = 0; i < length.value; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    return password;
};

const generatePasswords = () => {
    if (!isValidOptions.value) return;
    
    const newPasswords: string[] = [];
    for (let i = 0; i < quantity.value; i++) {
        newPasswords.push(generatePassword());
    }
    passwords.value = newPasswords;
    copiedPasswords.value = new Set();
};

const clearAll = () => {
    passwords.value = [];
    options.value = {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    };
    copiedPasswords.value = new Set();
};

const copyToClipboard = async (password: string) => {
    try {
        await navigator.clipboard.writeText(password);
        copiedPasswords.value.add(password);
        // Force reactivity update
        copiedPasswords.value = new Set(copiedPasswords.value);
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

.length-control {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.range-input {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    background: var(--border-color);
    border-radius: 3px;
    outline: none;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.range-input::-webkit-slider-thumb:hover {
    transform: scale(1.1);
}

.length-value {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
    color: var(--nav-text);
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
}

.checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
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
    font-weight: 600;
    color: var(--nav-text);
    margin-bottom: 1rem;
}

.password-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.password-item {
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

.password-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
}

.password-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--nav-text);
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
    min-width: 0;
    padding: 0.25rem 0;
}

.password-text::-webkit-scrollbar {
    display: none;
}

.password-text.copied {
    text-decoration: line-through;
    opacity: 0.7;
}

.copy-btn {
    padding: 0.25rem 0.75rem;
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

.dark-mode .password-item {
    background: rgba(31, 41, 55, 0.3);
}
</style> 