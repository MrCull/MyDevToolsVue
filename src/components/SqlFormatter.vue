<template>
    <div class="container">
        <h1 class="title">SQL Formatter</h1>
        <div class="formatter">
            <div class="input-section">
                <textarea 
                    v-model="inputSql"
                    placeholder="Paste your SQL here..."
                    @input="handleInput"
                    @paste="handlePaste"
                    class="sql-input"
                ></textarea>
                <div class="button-group">
                    <button @click="formatSql" class="primary-btn" :disabled="!inputSql.trim()">
                        Format
                    </button>
                    <button @click="clearInput" class="secondary-btn" :disabled="!inputSql.trim()">
                        Clear
                    </button>
                    <button @click="copyToClipboard" class="secondary-btn" :disabled="!formattedSql">
                        Copy
                    </button>
                </div>
            </div>
            
            <div class="output-section">
                <pre v-if="formattedSql" class="sql-output"><code v-html="highlightedSql"></code></pre>
                <div v-if="error" class="error-message">{{ error }}</div>
                <div v-if="!formattedSql && !error" class="placeholder-message">
                    Formatted SQL will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// Import SQL formatter library for formatting SQL code - used in formatSql function
import { format } from 'sql-formatter';
// Import highlight.js core library for syntax highlighting - used in highlightedSql computed property
import hljs from 'highlight.js/lib/core';
// Import SQL language definition for highlight.js - used with hljs.registerLanguage
import sql from 'highlight.js/lib/languages/sql';
// Import the GitHub Dark theme CSS for syntax highlighting - provides base styles for code highlighting
// Used classes: .hljs-keyword (keywords), .hljs-string (strings), .hljs-number (numbers), .hljs-function (functions), .hljs-operator (operators), .hljs-comment (comments)
import 'highlight.js/styles/github-dark.css';

// Register SQL language
hljs.registerLanguage('sql', sql);

const inputSql = ref('');
const formattedSql = ref('');
const error = ref('');

// Compute highlighted SQL
const highlightedSql = computed(() => {
    if (!formattedSql.value) return '';
    return hljs.highlight(formattedSql.value, { language: 'sql' }).value;
});

const handleInput = () => {
    error.value = '';
};

const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pastedContent = event.clipboardData?.getData('text') || '';
    inputSql.value = pastedContent;
    formatSql();
};

const formatSql = () => {
    try {
        formattedSql.value = format(inputSql.value, {
            language: 'sql',
            keywordCase: 'upper',
            dataTypeCase: 'upper',
            functionCase: 'upper',
            linesBetweenQueries: 1,
            indentStyle: 'standard'
        });
        error.value = '';
    } catch (err) {
        error.value = 'Error formatting SQL: Please check your input';
        formattedSql.value = '';
    }
};

const clearInput = () => {
    inputSql.value = '';
    formattedSql.value = '';
    error.value = '';
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(formattedSql.value);
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

.sql-input, .sql-output {
    width: 100%;
    flex: 1;
    padding: 1rem;
    border-radius: 12px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--nav-text);
    resize: none;
    overflow: auto;
}

.sql-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.sql-output {
    white-space: pre;
    overflow-x: auto;
    margin: 0;
    background: var(--container-bg);
}

.sql-output code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* SQL Syntax highlighting customization */
.hljs-keyword {
    color: #5a67d8; /* Keywords */
}

.hljs-string {
    color: #059669; /* Strings */
}

.hljs-number {
    color: #f59e0b; /* Numbers */
}

.hljs-function {
    color: #7c3aed; /* Functions */
}

.hljs-operator {
    color: #e11d48; /* Operators */
}

.hljs-comment {
    color: #6b7280; /* Comments */
}

/* Dark mode adjustments */
.dark-mode .sql-output {
    background: rgba(31, 41, 55, 0.8);
}

.dark-mode .hljs-keyword {
    color: #818cf8;
}

.dark-mode .hljs-string {
    color: #34d399;
}

.dark-mode .hljs-number {
    color: #fbbf24;
}

.dark-mode .hljs-function {
    color: #a78bfa;
}

.dark-mode .hljs-operator {
    color: #f87171;
}

.dark-mode .hljs-comment {
    color: #9ca3af;
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

    .sql-input, .sql-output {
        height: 300px;
        flex: none;
    }

    .button-group {
        justify-content: center;
    }
}

.dark-mode .sql-input,
.dark-mode .sql-output {
    background: rgba(31, 41, 55, 0.8);
    border-color: #4b5563;
}

.dark-mode .placeholder-message {
    color: var(--nav-text);
}
</style> 