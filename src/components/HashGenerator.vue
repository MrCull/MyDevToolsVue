<template>
    <div class="container">
        <h1 class="title">Hash Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="input">Input Text</label>
                    <textarea 
                        id="input"
                        v-model="inputText"
                        class="input-field"
                        placeholder="Enter text to generate hash..."
                        rows="4"
                        data-test-id="hash-input"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="hashType">Hash Type</label>
                    <select 
                        id="hashType"
                        v-model="selectedHash"
                        class="input-field"
                        data-test-id="hash-type-select"
                    >
                        <option value="sha1">SHA-1</option>
                        <option value="sha256">SHA-256</option>
                        <option value="sha384">SHA-384</option>
                        <option value="sha512">SHA-512</option>
                    </select>
                </div>

                <div class="button-group">
                    <button 
                        @click="generateHash" 
                        class="primary-btn"
                        :disabled="!inputText.trim()"
                        data-test-id="generate-btn"
                    >
                        Generate Hash
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!hashResult"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated Hash</h2>
                <div v-if="hashResult" class="hash-result" data-test-id="hash-output">
                    <div class="hash-display">
                        <span class="hash-text">{{ hashResult }}</span>
                        <button @click="copyToClipboard" class="copy-btn" :class="{ 'copied': isCopied }" data-test-id="copy-btn">
                            {{ isCopied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Generated hash will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputText = ref('');
const selectedHash = ref('sha256');
const hashResult = ref('');
const isCopied = ref(false);

const generateHash = async () => {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputText.value);
        
        // Map our hash types to Web Crypto API algorithm names
        const algorithmMap: { [key: string]: string } = {
            'sha1': 'SHA-1',
            'sha256': 'SHA-256',
            'sha384': 'SHA-384',
            'sha512': 'SHA-512'
        };

        const hashBuffer = await crypto.subtle.digest(algorithmMap[selectedHash.value], data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashResult.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        isCopied.value = false;
    } catch (error) {
        console.error('Error generating hash:', error);
        hashResult.value = 'Error generating hash';
    }
};

const clearAll = () => {
    inputText.value = '';
    hashResult.value = '';
    isCopied.value = false;
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(hashResult.value);
        isCopied.value = true;
        setTimeout(() => {
            isCopied.value = false;
        }, 2000);
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
    resize: vertical;
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

.hash-result {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
}

.hash-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.hash-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
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

.dark-mode .hash-result {
    background: rgba(31, 41, 55, 0.3);
}
</style> 