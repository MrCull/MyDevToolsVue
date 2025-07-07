<template>
    <div class="container">
        <h1 class="title">C# Formatter</h1>
        <div class="formatter">
            <div class="input-section">
                <textarea 
                    v-model="inputCode"
                    placeholder="Paste your C# code here..."
                    @input="handleInput"
                    @paste="handlePaste"
                    class="code-input"
                    data-test-id="csharp-input"
                ></textarea>
                <div class="button-group">
                    <button @click="formatCode" class="primary-btn" :disabled="!inputCode.trim()" data-test-id="format-btn">
                        Format
                    </button>
                    <button @click="clearInput" class="secondary-btn" :disabled="!inputCode.trim()" data-test-id="clear-btn">
                        Clear
                    </button>
                    <button @click="copyToClipboard" class="secondary-btn" :disabled="!formattedCode" data-test-id="copy-btn">
                        Copy
                    </button>
                </div>
            </div>
            
            <div class="output-section">
                <pre v-if="formattedCode" class="code-output" data-test-id="csharp-output"><code v-html="highlightedCode"></code></pre>
                <div v-if="error" class="error-message" data-test-id="error-message">{{ error }}</div>
                <div v-if="!formattedCode && !error" class="placeholder-message" data-test-id="placeholder-message">
                    Formatted C# code will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import 'highlight.js/styles/github-dark.css';

// Register C# language
hljs.registerLanguage('csharp', csharp);

const inputCode = ref('');
const formattedCode = ref('');
const error = ref('');

// Compute highlighted code
const highlightedCode = computed(() => {
    if (!formattedCode.value) return '';
    return hljs.highlight(formattedCode.value, { language: 'csharp' }).value;
});

const handleInput = () => {
    error.value = '';
};

const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pastedContent = event.clipboardData?.getData('text') || '';
    inputCode.value = pastedContent;
    formatCode();
};

const formatCode = () => {
    try {
        const lines = inputCode.value.split('\n');
        let indentLevel = 0;
        let inPropertyBlock = false;
        const formattedLines = lines.map(line => {
            const trimmedLine = line.trim();
            
            // Decrease indent before closing braces
            if (trimmedLine.includes('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Handle property blocks
            if (trimmedLine.includes('{') && (trimmedLine.includes('=') || trimmedLine.includes('get;'))) {
                inPropertyBlock = true;
            }
            
            // Add indentation
            const formattedLine = '    '.repeat(indentLevel) + trimmedLine;
            
            // Increase indent after opening braces
            if (trimmedLine.includes('{')) {
                indentLevel++;
            }
            
            // Handle property block closing
            if (inPropertyBlock && trimmedLine.includes('}')) {
                inPropertyBlock = false;
            }
            
            return formattedLine;
        });
        formattedCode.value = formattedLines.join('\n');
        error.value = '';
    } catch (err) {
        error.value = 'Error formatting code: Please check your input';
        formattedCode.value = '';
    }
};

const clearInput = () => {
    inputCode.value = '';
    formattedCode.value = '';
    error.value = '';
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(formattedCode.value);
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
    }
};
</script>

<style scoped>
.container {
    background: var(--container-bg);
    min-height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
}

.title {
    font-size: 2.5rem;
    padding: 2rem;
    margin: 0;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    border-bottom: 1px solid var(--border-color);
    text-align: center;
}

.formatter {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    text-align: left;
    padding: 2rem;
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    max-width: none;
}

.input-section, .output-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: calc(100vh - 12rem);
}

.code-input, .code-output {
    width: 100%;
    flex: 1;
    padding: 1rem;
    border-radius: 12px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background: var(--container-bg);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    resize: none;
    overflow: auto;
}

.code-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.code-output {
    white-space: pre;
    overflow-x: auto;
    margin: 0;
    background: var(--container-bg);
}

.code-output code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-primary);
}

/* Syntax highlighting customization */
.hljs-keyword {
    color: #569cd6; /* Keywords */
}

.hljs-string {
    color: #ce9178; /* Strings */
}

.hljs-number {
    color: #b5cea8; /* Numbers */
}

.hljs-comment {
    color: #6a9955; /* Comments */
}

.hljs-function {
    color: #dcdcaa; /* Functions */
}

.hljs-class {
    color: #4ec9b0; /* Classes */
}

.hljs-type {
    color: #4ec9b0; /* Types */
}

/* Dark mode adjustments */
.dark-mode .code-input,
.dark-mode .code-output {
    background: #1e1e1e;
    border-color: #4b5563;
}

.dark-mode .code-input {
    color: #d4d4d4;
}

.dark-mode .code-output code {
    color: #d4d4d4;
}

.dark-mode .code-input::placeholder {
    color: #6b7280;
}

.dark-mode .hljs-keyword {
    color: #569cd6;
}

.dark-mode .hljs-string {
    color: #ce9178;
}

.dark-mode .hljs-number {
    color: #b5cea8;
}

.dark-mode .hljs-comment {
    color: #6a9955;
}

.dark-mode .hljs-function {
    color: #dcdcaa;
}

.dark-mode .hljs-class {
    color: #4ec9b0;
}

.dark-mode .hljs-type {
    color: #4ec9b0;
}

.button-group {
    display: flex;
    gap: 1rem;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    min-width: 100px;
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

.error-message {
    color: #ef4444;
    font-weight: 500;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.1);
}

.placeholder-message {
    color: var(--text-primary);
    opacity: 0.5;
    text-align: center;
    padding: 2rem;
    font-style: italic;
}

@media (max-width: 768px) {
    .formatter {
        grid-template-columns: 1fr;
        padding: 1rem;
    }

    .input-section, .output-section {
        height: auto;
        min-height: 300px;
    }

    .code-input, .code-output {
        height: 300px;
        flex: none;
    }

    .button-group {
        justify-content: center;
    }
}
</style> 