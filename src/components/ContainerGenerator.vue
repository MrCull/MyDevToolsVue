<template>
    <div class="container">
        <h1 class="title">Container Number Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="ownerCode">Owner Code (3 letters or leave blank for random)</label>
                    <input 
                        type="text" 
                        id="ownerCode"
                        v-model="ownerCode"
                        maxlength="3"
                        @input="validateOwnerCode"
                        placeholder="e.g. MSC (or blank)"
                        class="input-field"
                        data-test-id="owner-code-input"
                    />
                    <span class="hint">Must be 3 capital letters or blank for random top owner</span>
                </div>

                <div class="form-group">
                    <label for="categoryId">Equipment Category</label>
                    <select 
                        id="categoryId"
                        v-model="categoryId"
                        class="input-field"
                        data-test-id="category-select"
                    >
                        <option value="U">U (Freight Container)</option>
                        <option value="J">J (Detachable Equipment)</option>
                        <option value="Z">Z (Trailer/Chassis)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="quantity">Number of IDs to Generate</label>
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
                        :disabled="!isValidOwnerCode || !categoryId"
                        data-test-id="generate-btn"
                    >
                        Generate
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!containerNumbers.length"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated Container Numbers</h2>
                <div v-if="containerNumbers.length" class="container-list" data-test-id="container-output">
                    <div v-for="number in containerNumbers" :key="number" class="container-item">
                        <span class="container-number" :class="{ 'copied': copiedIds.has(number) }">{{ number }}</span>
                        <button @click="copyToClipboard(number)" class="copy-btn" :class="{ 'copied': copiedIds.has(number) }" :data-test-id="'copy-btn-' + number">
                            {{ copiedIds.has(number) ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Generated container numbers will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Top 10 container owners by fleet size
const COMMON_OWNERS = [
    'MSC',  // Mediterranean Shipping Company
    'CMA',  // CMA CGM
    'COC',  // COSCO Shipping
    'EMC',  // Evergreen Marine
    'HLC',  // Hapag-Lloyd
    'ONE',  // Ocean Network Express
    'MRK',  // Maersk
    'YML',  // Yang Ming
    'HMM',  // HMM Co Ltd
    'PIL'   // Pacific International Lines
];

const ownerCode = ref('');
const categoryId = ref('U');
const quantity = ref(5);
const containerNumbers = ref<string[]>([]);
const copiedIds = ref<Set<string>>(new Set());

const isValidOwnerCode = computed(() => {
    // Allow empty (for random) or valid 3-letter code
    return ownerCode.value === '' || /^[A-Z]{3}$/.test(ownerCode.value);
});

const validateOwnerCode = () => {
    ownerCode.value = ownerCode.value.toUpperCase().replace(/[^A-Z]/g, '');
};

const getRandomOwner = (): string => {
    const randomIndex = Math.floor(Math.random() * COMMON_OWNERS.length);
    return COMMON_OWNERS[randomIndex];
};

const calculateCheckDigit = (code: string): number => {
    const values: { [key: string]: number } = {
        'A': 10, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18, 'I': 19,
        'J': 20, 'K': 21, 'L': 23, 'M': 24, 'N': 25, 'O': 26, 'P': 27, 'Q': 28, 'R': 29,
        'S': 30, 'T': 31, 'U': 32, 'V': 34, 'W': 35, 'X': 36, 'Y': 37, 'Z': 38,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };

    let sum = 0;
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const value = values[char];
        sum += value * Math.pow(2, i);
    }
    
    return (sum % 11) % 10;
};

const generateNumbers = () => {
    const newNumbers: string[] = [];
    const usedSerials = new Set<number>();
    
    for (let i = 0; i < quantity.value; i++) {
        // Use provided owner code or get a random one
        const owner = ownerCode.value || getRandomOwner();
        
        let serial: number;
        do {
            serial = Math.floor(Math.random() * 1000000);
        } while (usedSerials.has(serial));
        
        usedSerials.add(serial);
        const serialStr = serial.toString().padStart(6, '0');
        const baseNumber = `${owner}${categoryId.value}${serialStr}`;
        const checkDigit = calculateCheckDigit(baseNumber);
        newNumbers.push(`${baseNumber}${checkDigit}`);
    }
    
    containerNumbers.value = newNumbers;
    copiedIds.value = new Set(); // Reset copied state when generating new numbers
};

const clearAll = () => {
    containerNumbers.value = [];
    ownerCode.value = '';
    categoryId.value = 'U';
    quantity.value = 1;
    copiedIds.value = new Set();
};

const copyToClipboard = async (number: string) => {
    try {
        await navigator.clipboard.writeText(number);
        copiedIds.value.add(number);
        // Force reactivity update
        copiedIds.value = new Set(copiedIds.value);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};
</script>

<style scoped>
.container {
    max-width: 800px;
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
    display: grid;
    grid-template-columns: 1fr 1fr;
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
}

.input-field {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--container-bg);
    color: var(--nav-text);
    transition: all 0.3s ease;
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

.hint {
    font-size: 0.875rem;
    color: var(--nav-text);
    opacity: 0.7;
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
}

.container-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
}

.container-number {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--nav-text);
    letter-spacing: 1px;
    transition: all 0.3s ease;
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