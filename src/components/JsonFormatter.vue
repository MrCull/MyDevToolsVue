<template>
    <div class="container">
        <h1 class="title">JSON Formatter</h1>
        <div class="formatter">
            <div class="input-section">
                <textarea 
                    v-model="inputJson"
                    placeholder="Paste your JSON here..."
                    @input="handleInput"
                    @paste="handlePaste"
                    class="json-input"
                ></textarea>
                <div class="button-group">
                    <button @click="formatJson" class="primary-btn" :disabled="!inputJson.trim()">
                        Format
                    </button>
                    <button @click="clearInput" class="secondary-btn" :disabled="!inputJson.trim()">
                        Clear
                    </button>
                    <button @click="copyToClipboard" class="secondary-btn" :disabled="!formattedJson">
                        Copy
                    </button>
                </div>
            </div>
            
            <div class="output-section">
                <pre v-if="formattedJson" class="json-output"><code v-html="highlightedJson"></code></pre>
                <div v-if="error" class="error-message">{{ error }}</div>
                <div v-if="!formattedJson && !error" class="placeholder-message">
                    Formatted JSON will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// Import highlight.js core library for syntax highlighting - used in highlightedJson computed property
import hljs from 'highlight.js/lib/core';
// Import JSON language definition for highlight.js - used with hljs.registerLanguage
import json from 'highlight.js/lib/languages/json';
// Import the GitHub Dark theme CSS for syntax highlighting - provides base styles for code highlighting
// Used classes: .hljs-attr (keys), .hljs-string (string values), .hljs-number (numbers), .hljs-literal (true/false/null)
import 'highlight.js/styles/github-dark.css';

// Register JSON language
hljs.registerLanguage('json', json);

const inputJson = ref('');
const formattedJson = ref('');
const error = ref('');

// Compute highlighted JSON
const highlightedJson = computed(() => {
    if (!formattedJson.value) return '';
    return hljs.highlight(formattedJson.value, { language: 'json' }).value;
});

const handleInput = () => {
    // Only clear error on manual input
    error.value = '';
};

const handlePaste = (event: ClipboardEvent) => {
    // Prevent default to handle paste manually
    event.preventDefault();
    
    // Get pasted content
    const pastedContent = event.clipboardData?.getData('text') || '';
    
    // Update input with pasted content
    inputJson.value = pastedContent;
    
    // Try to format immediately
    try {
        const parsed = JSON.parse(pastedContent);
        formattedJson.value = JSON.stringify(parsed, null, 2);
        error.value = '';
    } catch (err) {
        error.value = 'Invalid JSON: Please check your input';
        formattedJson.value = '';
    }
};

const formatJson = () => {
    try {
        // Parse the input to validate it's valid JSON
        const parsed = JSON.parse(inputJson.value);
        // Format with 2 spaces indentation
        formattedJson.value = JSON.stringify(parsed, null, 2);
        error.value = '';
    } catch (err) {
        error.value = 'Invalid JSON: Please check your input';
        formattedJson.value = '';
    }
};

const clearInput = () => {
    inputJson.value = '';
    formattedJson.value = '';
    error.value = '';
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(formattedJson.value);
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

.json-input, .json-output {
    width: 100%;
    flex: 1;
    padding: 1rem;
    border-radius: 12px;
    font-family: monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--nav-text);
    resize: none;
    overflow: auto;
}

.json-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.json-output {
    white-space: pre;
    overflow-x: auto;
    margin: 0;
    background: var(--container-bg);
}

.json-output code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* Syntax highlighting customization */
.hljs-attr {
    color: #5a67d8; /* Keys */
}

.hljs-string {
    color: #059669; /* String values */
}

.hljs-number {
    color: #f59e0b; /* Numbers */
}

.hljs-literal {
    color: #7c3aed; /* true/false/null */
}

/* Dark mode adjustments */
.dark-mode .json-output {
    background: rgba(31, 41, 55, 0.8);
}

.dark-mode .hljs-attr {
    color: #818cf8;
}

.dark-mode .hljs-string {
    color: #34d399;
}

.dark-mode .hljs-number {
    color: #fbbf24;
}

.dark-mode .hljs-literal {
    color: #a78bfa;
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
    color: var(--nav-text);
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

    .json-input, .json-output {
        height: 300px;
        flex: none;
    }

    .button-group {
        justify-content: center;
    }
}

.dark-mode .json-input,
.dark-mode .json-output {
    background: rgba(31, 41, 55, 0.8);
    border-color: #4b5563;
}

.dark-mode .placeholder-message {
    color: var(--nav-text);
}
</style> 