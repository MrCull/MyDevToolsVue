<template>
    <div class="branch-container">
        <h1 class="title">Branch Name Formatter</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="input">Branch Name Input</label>
                    <input
                        id="input"
                        v-model="input"
                        class="input-field"
                        placeholder="e.g. Story 121579: Delete any load containers"
                    />
                </div>

                <div class="button-group">
                    <button
                        @click="formatName"
                        class="primary-btn"
                        :disabled="!input.trim()"
                    >
                        Format
                    </button>
                    <button
                        @click="clearAll"
                        class="secondary-btn"
                        :disabled="!formattedName"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Formatted Branch Name</h2>
                <div v-if="formattedName" class="branch-list">
                    <div class="branch-item">
                        <span class="branch-name" :class="{ 'copied': isCopied }">{{ formattedName }}</span>
                        <button @click="copyToClipboard(formattedName)" class="copy-btn" :class="{ 'copied': isCopied }">
                            {{ isCopied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message">
                    Formatted branch name will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const input = ref('123456 Story: Replace this with your work item');
const formattedName = ref('');
const isCopied = ref(false);

// Format branch name on component mount
onMounted(() => {
    formatName();
});

const formatBranchName = (input: string): string => {
    // Extract number and description
    const match = input.match(/(?:\w+\s?)*?(\d+):\s*(.+)/);
    if (!match) return input;

    const [, number, description] = match;

    // Clean up the description
    const cleanDesc = description
        // Replace spaces with underscores
        .replace(/\s+/g, '_')
        // Replace periods with underscores
        .replace(/\./g, '_')
        // Remove special characters except underscores and hyphens
        .replace(/[^a-zA-Z0-9_-]/g, '')
        // Replace multiple underscores with single underscore
        .replace(/_+/g, '_')
        // Remove leading/trailing underscores
        .replace(/^_+|_+$/g, '')
        // Remove _-
        .replace(/_-/g, '_')
        // Replace multiple underscores with single underscore
        .replace(/_+/g, '_');

    return `${number}_${cleanDesc}`;
};

const formatName = () => {
    formattedName.value = formatBranchName(input.value.trim());
    isCopied.value = false;
};

const clearAll = () => {
    input.value = '';
    formattedName.value = '';
    isCopied.value = false;
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        isCopied.value = true;
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};
</script>

<style scoped>
.branch-container {
    max-width: 1200px;
    width: 90%;
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
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.input-section, .output-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.input-field {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--container-bg);
    color: var(--nav-text);
    transition: all 0.3s ease;
    width: 100%;
    min-width: 400px;
}

.input-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
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

.branch-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.branch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.branch-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
}

.branch-name {
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: 100;
    color: var(--nav-text);
    letter-spacing: 0ch;
    transition: all 0.3s ease;
}

.branch-name.copied {
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
    .branch-container {
        width: 95%;
        padding: 1.5rem;
    }

    .title {
        font-size: 2rem;
        margin-bottom: 2rem;
    }
}

.dark-mode .branch-item {
    background: rgba(31, 41, 55, 0.3);
}
</style>
