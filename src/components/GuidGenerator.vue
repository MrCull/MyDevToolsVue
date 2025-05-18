<template>
    <div class="container">
        <h1 class="title">GUID Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="format">GUID Format</label>
                    <select 
                        id="format"
                        v-model="format"
                        class="input-field"
                    >
                        <option value="default">123E4567-E89B-12D3-A456-426614174000</option>    
                        <option value="lowercase">123e4567-e89b-12d3-a456-426614174000</option>
                        <option value="braces">{123e4567-e89b-12d3-a456-426614174000}</option>
                        <option value="parentheses">(123e4567-e89b-12d3-a456-426614174000)</option>
                        <option value="noHyphens">123e4567e89b12d3a456426614174000</option>

                    </select>
                </div>

                <div class="form-group">
                    <label for="quantity">Number of GUIDs to Generate</label>
                    <input 
                        type="number" 
                        id="quantity"
                        v-model="quantity"
                        min="1"
                        max="100"
                        class="input-field"
                    />
                </div>

                <div class="button-group">
                    <button 
                        @click="generateGuids" 
                        class="primary-btn"
                    >
                        Generate
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!guids.length"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated GUIDs</h2>
                <div v-if="guids.length" class="container-list">
                    <div v-for="guid in guids" :key="guid" class="container-item">
                        <span class="container-number" :class="{ 'copied': copiedIds.has(guid) }">{{ guid }}</span>
                        <button @click="copyToClipboard(guid)" class="copy-btn" :class="{ 'copied': copiedIds.has(guid) }">
                            {{ copiedIds.has(guid) ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message">
                    Generated GUIDs will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const format = ref('default');
const quantity = ref(5);
const guids = ref<string[]>([]);
const copiedIds = ref<Set<string>>(new Set());

const generateGuid = (): string => {
    const hexDigits = '0123456789abcdef';
    let guid = '';
    
    for (let i = 0; i < 32; i++) {
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            guid += '-';
        }
        guid += hexDigits[Math.floor(Math.random() * 16)];
    }
    
    // Ensure version 4 GUID by setting version bits
    guid = guid.substring(0, 14) + '4' + guid.substring(15, 19) + '8' + guid.substring(20);
    
    return formatGuid(guid);
};

const formatGuid = (guid: string): string => {
    switch (format.value) {
        case 'braces':
            return `{${guid}}`;
        case 'parentheses':
            return `(${guid})`;
        case 'noHyphens':
            return guid.replace(/-/g, '');
        case 'lowercase':
            return guid;;
        default:
            return guid.toUpperCase();
    }
};

const generateGuids = () => {
    const newGuids: string[] = [];
    for (let i = 0; i < quantity.value; i++) {
        newGuids.push(generateGuid());
    }
    guids.value = newGuids;
    copiedIds.value = new Set(); // Reset copied state when generating new GUIDs
};

const clearAll = () => {
    guids.value = [];
    quantity.value = 5;
    format.value = 'default';
    copiedIds.value = new Set();
};

const copyToClipboard = async (guid: string) => {
    try {
        await navigator.clipboard.writeText(guid);
        copiedIds.value.add(guid);
        // Force reactivity update
        copiedIds.value = new Set(copiedIds.value);
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
    max-width: 500px;;
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

.container-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.container-item {
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

.container-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
}

.container-number {
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
.container-number::-webkit-scrollbar {
    display: none;
}

.container-number.copied {
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

.dark-mode .container-item {
    background: rgba(31, 41, 55, 0.3);
}
</style> 