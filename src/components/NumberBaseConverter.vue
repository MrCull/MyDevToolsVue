<template>
    <div class="container">
        <h1 class="title">Number Base Converter</h1>
        <div class="converter-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="input">Input Number</label>
                    <input 
                        id="input"
                        v-model="inputNumber"
                        class="input-field"
                        placeholder="Enter number to convert..."
                        @input="convertNumber"
                        data-test-id="number-input"
                    />
                </div>

                <div class="form-group">
                    <label for="fromBase">From Base</label>
                    <select 
                        id="fromBase"
                        v-model="fromBase"
                        class="input-field"
                        @change="convertNumber"
                        data-test-id="from-base-select"
                    >
                        <option value="2">Binary (Base 2)</option>
                        <option value="8">Octal (Base 8)</option>
                        <option value="10" selected>Decimal (Base 10)</option>
                        <option value="16">Hexadecimal (Base 16)</option>
                        <option value="32">Base 32</option>
                        <option value="36">Base 36</option>
                        <option value="58">Base 58</option>
                        <option value="64">Base 64</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="toBase">To Base</label>
                    <select 
                        id="toBase"
                        v-model="toBase"
                        class="input-field"
                        @change="convertNumber"
                        data-test-id="to-base-select"
                    >
                        <option value="2">Binary (Base 2)</option>
                        <option value="8">Octal (Base 8)</option>
                        <option value="10">Decimal (Base 10)</option>
                        <option value="16" selected>Hexadecimal (Base 16)</option>
                        <option value="32">Base 32</option>
                        <option value="36">Base 36</option>
                        <option value="58">Base 58</option>
                        <option value="64">Base 64</option>
                    </select>
                </div>

                <div class="button-group">
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!convertedNumber"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Converted Number</h2>
                <div v-if="convertedNumber" class="result" data-test-id="number-output">
                    <div class="result-display">
                        <span class="result-text">{{ convertedNumber }}</span>
                        <button @click="copyToClipboard" class="copy-btn" :class="{ 'copied': isCopied }" data-test-id="copy-btn">
                            {{ isCopied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Converted number will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputNumber = ref('123');
const fromBase = ref('10');
const toBase = ref('16');
const convertedNumber = ref('');
const isCopied = ref(false);

const convertNumber = () => {
    try {
        if (!inputNumber.value.trim()) {
            convertedNumber.value = '';
            return;
        }

        // Convert input to decimal first
        const decimal = parseInt(inputNumber.value, parseInt(fromBase.value));
        if (isNaN(decimal)) {
            convertedNumber.value = 'Invalid input for selected base';
            return;
        }

        // Convert decimal to target base
        if (toBase.value === '64') {
            // Special handling for Base64
            convertedNumber.value = btoa(decimal.toString());
        } else {
            convertedNumber.value = decimal.toString(parseInt(toBase.value)).toUpperCase();
        }
        
        isCopied.value = false;
    } catch (error) {
        console.error('Error converting number:', error);
        convertedNumber.value = 'Error converting number';
    }
};

const clearAll = () => {
    inputNumber.value = '';
    convertedNumber.value = '';
    isCopied.value = false;
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(convertedNumber.value);
        isCopied.value = true;
        setTimeout(() => {
            isCopied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};

convertNumber();

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

.converter-content {
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
    width: 100%;
    max-width: 400px;
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
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.secondary-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    flex: 1;
    background: var(--button-bg);
    color: var(--button-text);
}

.secondary-btn:hover:not(:disabled) {
    background: var(--button-hover);
}

.secondary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--nav-text);
    margin-bottom: 1rem;
}

.result {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
}

.result-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.result-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 1.1rem;
    color: var(--nav-text);
    word-break: break-all;
    flex: 1;
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
    .converter-content {
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

.dark-mode .result {
    background: rgba(31, 41, 55, 0.3);
}
</style> 