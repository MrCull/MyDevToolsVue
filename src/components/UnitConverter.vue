<template>
    <div class="container">
        <h1 class="title">Unit Converter</h1>
        <div class="converter-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="category">Category</label>
                    <select 
                        id="category"
                        v-model="selectedCategory"
                        class="input-field"
                        @change="handleCategoryChange"
                        data-test-id="category-select"
                    >
                        <option v-for="(units, category) in unitCategories" 
                                :key="category" 
                                :value="category">
                            {{ formatCategoryName(category) }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="fromUnit">From Unit</label>
                    <div class="unit-select-container">
                        <select 
                            id="fromUnit"
                            v-model="fromUnit"
                            class="input-field"
                            @change="convert"
                            data-test-id="from-unit-select"
                        >
                            <option v-for="unit in availableUnits" 
                                    :key="unit.value" 
                                    :value="unit.value">
                                {{ unit.label }}
                            </option>
                        </select>
                        <button 
                            class="info-btn"
                            @mouseenter="showTooltip = true"
                            @mouseleave="showTooltip = false"
                            :title="getUnitInfo(fromUnit)"
                        >
                            ℹ️
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label for="inputValue">Value</label>
                    <input 
                        id="inputValue"
                        v-model.number="inputValue"
                        type="number"
                        step="any"
                        class="input-field"
                        placeholder="Enter value to convert..."
                        @input="convert"
                        data-test-id="value-input"
                    />
                </div>

                <div class="form-group">
                    <label for="toUnit">To Unit</label>
                    <div class="unit-select-container">
                        <select 
                            id="toUnit"
                            v-model="toUnit"
                            class="input-field"
                            @change="convert"
                            data-test-id="to-unit-select"
                        >
                            <option v-for="unit in availableUnits" 
                                    :key="unit.value" 
                                    :value="unit.value">
                                {{ unit.label }}
                            </option>
                        </select>
                        <button 
                            class="info-btn"
                            @mouseenter="showTooltip = true"
                            @mouseleave="showTooltip = false"
                            :title="getUnitInfo(toUnit)"
                        >
                            ℹ️
                        </button>
                    </div>
                </div>

                <div class="button-group">
                    <button 
                        @click="swapUnits" 
                        class="secondary-btn"
                        data-test-id="swap-btn"
                    >
                        🔄 Swap Units
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!inputValue"
                        data-test-id="clear-btn"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Converted Value</h2>
                <div v-if="convertedValue !== null" class="result" data-test-id="unit-output">
                    <div class="result-display">
                        <span class="result-text">{{ formatResult(convertedValue) }}</span>
                        <button @click="copyToClipboard" class="copy-btn" :class="{ 'copied': isCopied }" data-test-id="copy-btn">
                            {{ isCopied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                    <div class="reverse-conversion" v-if="reverseConversion !== null">
                        {{ formatReverseConversion() }}
                    </div>
                </div>
                <div v-else class="placeholder-message" data-test-id="placeholder-message">
                    Converted value will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

// Unit categories and their units
const unitCategories = {
    length: [
        { value: 'ft', label: 'Feet (ft)', conversion: 0.3048 },
        { value: 'm', label: 'Meters (m)', conversion: 1 },
        { value: 'in', label: 'Inches (in)', conversion: 0.0254 },
        { value: 'cm', label: 'Centimeters (cm)', conversion: 0.01 },
        { value: 'mm', label: 'Millimeters (mm)', conversion: 0.001 }
    ],
    weight: [
        { value: 'lbs', label: 'Pounds (lbs)', conversion: 0.453592 },
        { value: 'kg', label: 'Kilograms (kg)', conversion: 1 },
        { value: 'tons', label: 'US Tons (tons)', conversion: 907.185 },
        { value: 'mt', label: 'Metric Tons (mt)', conversion: 1000 }
    ],
    volume: [
        { value: 'cft', label: 'Cubic Feet (cft)', conversion: 0.0283168 },
        { value: 'cbm', label: 'Cubic Meters (cbm)', conversion: 1 },
        { value: 'l', label: 'Liters (l)', conversion: 0.001 },
        { value: 'gal', label: 'Gallons (gal)', conversion: 0.00378541 }
    ],
    time: [
        { value: 'ms', label: 'Milliseconds (ms)', conversion: 0.001 },
        { value: 's', label: 'Seconds (s)', conversion: 1 },
        { value: 'min', label: 'Minutes (min)', conversion: 60 },
        { value: 'hr', label: 'Hours (hr)', conversion: 3600 },
        { value: 'day', label: 'Days (day)', conversion: 86400 },
        { value: 'week', label: 'Weeks (week)', conversion: 604800 },
        { value: 'month', label: 'Months (month)', conversion: 2629746 }, // Average month (30.44 days)
        { value: 'year', label: 'Years (year)', conversion: 31556952 }    // Average year (365.2425 days)
    ]
};

const selectedCategory = ref('length');
const fromUnit = ref('ft');
const toUnit = ref('m');
const inputValue = ref<number | null>(null);
const convertedValue = ref<number | null>(null);
const reverseConversion = ref<number | null>(null);
const isCopied = ref(false);
const showTooltip = ref(false);

// Computed property for available units based on selected category
const availableUnits = computed(() => unitCategories[selectedCategory.value as keyof typeof unitCategories]);

// Format category names for display
const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
};

// Get unit information for tooltips
const getUnitInfo = (unit: string): string => {
    const unitInfo: { [key: string]: string } = {
        'mt': 'Metric Ton - 1000 kilograms',
        'tons': 'US Ton - 2000 pounds',
        'ms': 'Millisecond - 1/1000 of a second',
        's': 'Second - base unit of time',
        'min': 'Minute - 60 seconds',
        'hr': 'Hour - 3600 seconds',
        'day': 'Day - 86400 seconds',
        'week': 'Week - 604800 seconds',
        'month': 'Month - average of 30.44 days',
        'year': 'Year - average of 365.2425 days'
    };
    return unitInfo[unit] || '';
};

// Handle category change
const handleCategoryChange = () => {
    // Reset units to first available options in new category
    fromUnit.value = availableUnits.value[0].value;
    toUnit.value = availableUnits.value[1].value;
    
    inputValue.value = null;
    convertedValue.value = null;
    reverseConversion.value = null;
};

// Convert value between units
const convert = () => {
    if (inputValue.value === null) {
        convertedValue.value = null;
        return;
    }

    const fromUnitData = availableUnits.value.find((u: { value: string; conversion: number }) => u.value === fromUnit.value);
    const toUnitData = availableUnits.value.find((u: { value: string; conversion: number }) => u.value === toUnit.value);

    if (fromUnitData && toUnitData) {
        // Convert to base unit (meters, kilograms, etc.) first
        const baseValue = inputValue.value * fromUnitData.conversion;
        // Then convert to target unit
        convertedValue.value = baseValue / toUnitData.conversion;
        
        // Calculate reverse conversion
        reverseConversion.value = convertedValue.value * toUnitData.conversion / fromUnitData.conversion;
    }
};

// Swap units
const swapUnits = () => {
    const temp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = temp;
    
    // Swap the input and converted values
    if (inputValue.value !== null && convertedValue.value !== null) {
        const tempValue = inputValue.value;
        inputValue.value = convertedValue.value;
        convertedValue.value = tempValue;
    }
};

// Clear all values
const clearAll = () => {
    inputValue.value = null;
    convertedValue.value = null;
    reverseConversion.value = null;
    isCopied.value = false;
};

// Format result with appropriate decimal places
const formatResult = (value: number): string => {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    });
};

// Format reverse conversion display
const formatReverseConversion = (): string => {
    if (reverseConversion.value === null) return '';
    return `Reverse: ${formatResult(reverseConversion.value)} ${fromUnit.value}`;
};

// Copy to clipboard
const copyToClipboard = async () => {
    if (convertedValue.value === null) return;
    
    try {
        await navigator.clipboard.writeText(formatResult(convertedValue.value));
        isCopied.value = true;
        setTimeout(() => {
            isCopied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};

// Load saved preferences
onMounted(() => {
    const savedCategory = localStorage.getItem('unitConverterCategory');
    const savedFromUnit = localStorage.getItem('unitConverterFromUnit');
    const savedToUnit = localStorage.getItem('unitConverterToUnit');

    if (savedCategory && savedFromUnit && savedToUnit) {
        selectedCategory.value = savedCategory;
        fromUnit.value = savedFromUnit;
        toUnit.value = savedToUnit;
    }
});

// Save preferences when they change
watch([selectedCategory, fromUnit, toUnit], ([category, from, to]: [string, string, string]) => {
    localStorage.setItem('unitConverterCategory', category);
    localStorage.setItem('unitConverterFromUnit', from);
    localStorage.setItem('unitConverterToUnit', to);
});
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
    grid-template-columns: 400px 1fr;
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

.unit-select-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
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
}

.info-btn {
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.info-btn:hover {
    opacity: 1;
}

.input-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.input-field option {
    font-size: 1rem;
    padding: 0.5rem;
}

label {
    font-weight: 600;
    color: var(--nav-text);
    font-size: 1.1rem;
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
    font-size: 1rem;
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
    font-size: 1.5rem;
    color: var(--nav-text);
    word-break: break-all;
    flex: 1;
}

.reverse-conversion {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--nav-text);
    opacity: 0.8;
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