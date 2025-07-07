<template>
    <div class="diff-container">
        <div class="header-section">
            <h1 class="title">Diff Tool</h1>
            <p class="subtitle">Compare two pieces of text and see the differences highlighted</p>
        </div>
        
        <div class="generator-content">
            <div class="input-panel">
                <div class="input-header">
                    <label for="original">Original Text</label>
                    <button @click="clearOriginal" class="clear-btn" :disabled="!original" data-test-id="clear-original-btn">Clear</button>
                </div>
                <textarea 
                    id="original"
                    v-model="original"
                    class="input-field"
                    placeholder="Enter original text"
                    rows="10"
                    data-test-id="original-input"
                ></textarea>
            </div>
            
            <div class="input-panel">
                <div class="input-header">
                    <label for="modified">Modified Text</label>
                    <button @click="clearModified" class="clear-btn" :disabled="!modified" data-test-id="clear-modified-btn">Clear</button>
                </div>
                <textarea 
                    id="modified"
                    v-model="modified"
                    class="input-field"
                    placeholder="Enter modified text"
                    rows="10"
                    data-test-id="modified-input"
                ></textarea>
            </div>
        </div>
        
        <div class="controls">
            <button 
                @click="compareDiff" 
                class="primary-btn"
                :disabled="!original.trim() || !modified.trim()"
                data-test-id="compare-btn"
            >
                Compare
            </button>
            <button 
                @click="clearAll" 
                class="secondary-btn"
                :disabled="!original && !modified"
                data-test-id="clear-all-btn"
            >
                Clear All
            </button>
        </div>
        
        <div v-if="diffResult.length" class="diff-result" data-test-id="diff-result">
            <div class="split-view">
                <div class="diff-panel original-panel">
                    <div class="panel-header">Original</div>
                    <div class="line-numbers">
                        <div v-for="(line, i) in diffResult" :key="`olno-${i}`" class="line-number">
                            {{ line.type !== 'add' ? i + 1 : ' ' }}
                        </div>
                    </div>
                    <div class="content">
                        <div 
                            v-for="(line, i) in diffResult" 
                            :key="`ol-${i}`" 
                            :class="['line', line.type]"
                            v-show="line.type !== 'add'"
                        >
                            <template v-if="line.type === 'modify'">
                                <span 
                                    v-for="(part, j) in line.originalParts" 
                                    :key="`olp-${i}-${j}`"
                                    :class="{ 'char-delete': part.removed, 'char-equal': !part.removed }"
                                >{{ part.value }}</span>
                            </template>
                            <template v-else>
                                {{ line.original }}
                            </template>
                        </div>
                    </div>
                </div>
                
                <div class="diff-panel modified-panel">
                    <div class="panel-header">Modified</div>
                    <div class="line-numbers">
                        <div v-for="(line, i) in diffResult" :key="`mlno-${i}`" class="line-number">
                            {{ line.type !== 'delete' ? i + 1 : ' ' }}
                        </div>
                    </div>
                    <div class="content">
                        <div 
                            v-for="(line, i) in diffResult" 
                            :key="`ml-${i}`" 
                            :class="['line', line.type]"
                            v-show="line.type !== 'delete'"
                        >
                            <template v-if="line.type === 'modify'">
                                <span 
                                    v-for="(part, j) in line.modifiedParts" 
                                    :key="`mlp-${i}-${j}`"
                                    :class="{ 'char-add': part.added, 'char-equal': !part.added }"
                                >{{ part.value }}</span>
                            </template>
                            <template v-else>
                                {{ line.modified }}
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as Diff from 'diff';

interface DiffPart {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
}

interface DiffLine {
    type: 'equal' | 'add' | 'delete' | 'modify';
    original: string;
    modified: string;
    originalParts?: DiffPart[];
    modifiedParts?: DiffPart[];
}

interface DiffChange {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
}

const original = ref('');
const modified = ref('');
const diffResult = ref<DiffLine[]>([]);

// Helper function to get character-level diff
const getCharDiff = (text1: string, text2: string): [DiffPart[], DiffPart[]] => {
    // Split into words but preserve whitespace
    const parts1 = text1.split(/(\s+)/);
    const parts2 = text2.split(/(\s+)/);
    
    const origParts: DiffPart[] = [];
    const modParts: DiffPart[] = [];
    
    let i = 0, j = 0;
    while (i < parts1.length && j < parts2.length) {
        if (parts1[i] === parts2[j]) {
            // Exact match, keep as is
            origParts.push({ value: parts1[i] });
            modParts.push({ value: parts2[j] });
            i++;
            j++;
        } else if (parts1[i].trim() === '' || parts2[j].trim() === '') {
            // Handle whitespace differences
            if (parts1[i].trim() === '') {
                origParts.push({ value: parts1[i] });
                i++;
            }
            if (parts2[j].trim() === '') {
                modParts.push({ value: parts2[j] });
                j++;
            }
        } else {
            // Words differ - do character-level diff
            const charDiff = Diff.diffChars(parts1[i], parts2[j]);
            let hasChange = false;
            
            // Check if there's an actual difference
            charDiff.forEach(part => {
                if (part.added || part.removed) hasChange = true;
            });
            
            if (hasChange) {
                // Process character differences
                charDiff.forEach(part => {
                    if (part.added) {
                        modParts.push({ value: part.value, added: true });
                    } else if (part.removed) {
                        origParts.push({ value: part.value, removed: true });
                    } else {
                        origParts.push({ value: part.value });
                        modParts.push({ value: part.value });
                    }
                });
            } else {
                // No actual change detected
                origParts.push({ value: parts1[i] });
                modParts.push({ value: parts2[j] });
            }
            i++;
            j++;
        }
    }
    
    // Handle remaining parts
    while (i < parts1.length) {
        origParts.push({ value: parts1[i], removed: true });
        i++;
    }
    while (j < parts2.length) {
        modParts.push({ value: parts2[j], added: true });
        j++;
    }
    
    return [origParts, modParts];
};

const compareDiff = () => {
    if (!original.value.trim() || !modified.value.trim()) return;
    
    // Normalize line endings
    const normalizedOriginal = original.value.replace(/\r\n/g, '\n');
    const normalizedModified = modified.value.replace(/\r\n/g, '\n');
    
    // Split into lines and compare
    const origLines = normalizedOriginal.split('\n');
    const modLines = normalizedModified.split('\n');
    
    const result: DiffLine[] = [];
    let i = 0, j = 0;
    
    while (i < origLines.length && j < modLines.length) {
        if (origLines[i] === modLines[j]) {
            // Lines are identical
            result.push({
                type: 'equal',
                original: origLines[i],
                modified: modLines[j]
            });
            i++;
            j++;
        } else {
            // Lines differ - check if it's a modification or addition/deletion
            const similarity = calculateSimilarity(origLines[i], modLines[j]);
            if (similarity > 0.5) {
                // Lines are similar enough to be a modification
                const [origParts, modParts] = getCharDiff(origLines[i], modLines[j]);
                result.push({
                    type: 'modify',
                    original: origLines[i],
                    modified: modLines[j],
                    originalParts: origParts,
                    modifiedParts: modParts
                });
                i++;
                j++;
            } else {
                // Lines are different enough to be treated as separate add/remove
                if (i + 1 < origLines.length && origLines[i + 1] === modLines[j]) {
                    // Next original line matches current modified - this is a deletion
                    result.push({
                        type: 'delete',
                        original: origLines[i],
                        modified: ''
                    });
                    i++;
                } else if (j + 1 < modLines.length && origLines[i] === modLines[j + 1]) {
                    // Next modified line matches current original - this is an addition
                    result.push({
                        type: 'add',
                        original: '',
                        modified: modLines[j]
                    });
                    j++;
                } else {
                    // No clear match found - treat as modification
                    const [origParts, modParts] = getCharDiff(origLines[i], modLines[j]);
                    result.push({
                        type: 'modify',
                        original: origLines[i],
                        modified: modLines[j],
                        originalParts: origParts,
                        modifiedParts: modParts
                    });
                    i++;
                    j++;
                }
            }
        }
    }
    
    // Handle remaining lines
    while (i < origLines.length) {
        result.push({
            type: 'delete',
            original: origLines[i],
            modified: ''
        });
        i++;
    }
    while (j < modLines.length) {
        result.push({
            type: 'add',
            original: '',
            modified: modLines[j]
        });
        j++;
    }
    
    diffResult.value = result;
};

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    if (maxLen === 0) return 1;
    
    let matches = 0;
    const range = Math.floor(maxLen / 2) - 1;
    const map = new Map<string, number>();
    
    // Count characters in first string
    for (let i = 0; i < len1; i++) {
        const char = str1[i];
        map.set(char, (map.get(char) || 0) + 1);
    }
    
    // Count matching characters in second string
    for (let i = 0; i < len2; i++) {
        const char = str2[i];
        const count = map.get(char);
        if (count && count > 0) {
            matches++;
            map.set(char, count - 1);
        }
    }
    
    return matches / maxLen;
};

const clearOriginal = () => {
    original.value = '';
    diffResult.value = [];
};

const clearModified = () => {
    modified.value = '';
    diffResult.value = [];
};

const clearAll = () => {
    original.value = '';
    modified.value = '';
    diffResult.value = [];
};
</script>

<style scoped>
.diff-container {
    width: 100%;
    max-width: 100%;
    padding: 1rem;
    background: var(--container-bg);
    box-shadow: none;
    margin: 0;
    border: none;
    box-sizing: border-box;
    height: calc(100vh - 1rem);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header-section {
    margin-bottom: 1rem;
    flex-shrink: 0;
}

.title {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
}

.subtitle {
    text-align: center;
    margin-bottom: 0.5rem;
    color: var(--nav-text);
    opacity: 0.7;
    font-size: 0.9rem;
}

.generator-content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
    width: 100%;
    flex-shrink: 0;
}

.input-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.input-field {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Courier New', Courier, monospace;
    background: var(--container-bg);
    color: var(--nav-text);
    transition: all 0.3s ease;
    resize: vertical;
    height: 120px;
    width: 100%;
    box-sizing: border-box;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-shrink: 0;
}

.primary-btn, .secondary-btn, .clear-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}

.diff-result {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0.5rem;
}

.split-view {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    overflow: hidden;
    width: 100%;
    height: 100%;
}

.diff-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.original-panel {
    border-right: 1px solid var(--border-color);
}

.panel-header {
    padding: 0.75rem 1rem;
    font-weight: 600;
    background: var(--button-bg);
    border-bottom: 1px solid var(--border-color);
    text-align: center;
}

.line-numbers {
    position: absolute;
    left: 0;
    top: 2.5rem;
    bottom: 0;
    width: 2.5rem;
    background: rgba(0, 0, 0, 0.02);
    border-right: 1px solid var(--border-color);
    user-select: none;
    text-align: right;
    padding: 0 0.25rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.line-number {
    height: 1.5rem;
    line-height: 1.5rem;
    font-size: 0.8rem;
    color: var(--nav-text);
    opacity: 0.5;
}

.content {
    padding-left: 2.75rem;
    overflow: auto;
    min-width: 0;
    width: 100%;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
}

.line {
    min-height: 1.5rem;
    line-height: 1.5rem;
    white-space: pre;
    padding: 0 0.25rem;
    overflow-x: visible;
}

.line.equal {
    background: transparent;
}

.line.add {
    background: rgba(5, 150, 105, 0.05);
}

.line.delete {
    background: rgba(224, 36, 36, 0.05);
}

.line.modify {
    background: rgba(59, 130, 246, 0.05);
}

.char-equal {
    color: var(--nav-text);
}

.char-add {
    background-color: rgba(5, 150, 105, 0.1);
    color: #059669;
    font-weight: bold;
    text-decoration: underline;
}

.char-delete {
    background-color: rgba(220, 38, 38, 0.1);
    color: #dc2626;
    font-weight: bold;
    text-decoration: line-through;
}

@media (max-width: 768px) {
    .diff-container {
        height: calc(100vh - 50px);
    }
    
    .generator-content {
        grid-template-columns: 1fr;
    }
    
    .split-view {
        grid-template-columns: 1fr;
    }
    
    .original-panel {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }
}
</style> 