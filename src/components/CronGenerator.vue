<template>
    <div class="container">
        <h1 class="title">Cron Expression Generator</h1>
        <div class="generator-content">
            <div class="input-section">
                <div class="form-group">
                    <label for="minute">Minute</label>
                    <select 
                        id="minute"
                        v-model="minute"
                        class="input-field"
                    >
                        <option value="*">Every minute (*)</option>
                        <option value="*/5">Every 5 minutes</option>
                        <option value="*/15">Every 15 minutes</option>
                        <option value="*/30">Every 30 minutes</option>
                        <option value="0">At minute 0</option>
                        <option value="15">At minute 15</option>
                        <option value="30">At minute 30</option>
                        <option value="45">At minute 45</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="hour">Hour</label>
                    <select 
                        id="hour"
                        v-model="hour"
                        class="input-field"
                    >
                        <option value="*">Every hour (*)</option>
                        <option value="0">At 12 AM</option>
                        <option value="6">At 6 AM</option>
                        <option value="12">At 12 PM</option>
                        <option value="18">At 6 PM</option>
                        <option value="*/2">Every 2 hours</option>
                        <option value="*/4">Every 4 hours</option>
                        <option value="*/6">Every 6 hours</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="day">Day of Month</label>
                    <select 
                        id="day"
                        v-model="day"
                        class="input-field"
                    >
                        <option value="*">Every day (*)</option>
                        <option value="1">On the 1st</option>
                        <option value="15">On the 15th</option>
                        <option value="*/2">Every 2 days</option>
                        <option value="*/5">Every 5 days</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="month">Month</label>
                    <select 
                        id="month"
                        v-model="month"
                        class="input-field"
                    >
                        <option value="*">Every month (*)</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="weekday">Day of Week</label>
                    <select 
                        id="weekday"
                        v-model="weekday"
                        class="input-field"
                    >
                        <option value="*">Every day (*)</option>
                        <option value="0">Sunday</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="1-5">Weekdays (Mon-Fri)</option>
                        <option value="0,6">Weekends (Sat-Sun)</option>
                    </select>
                </div>

                <div class="button-group">
                    <button 
                        @click="generateCron" 
                        class="primary-btn"
                    >
                        Generate Cron
                    </button>
                    <button 
                        @click="clearAll" 
                        class="secondary-btn"
                        :disabled="!cronExpression"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div class="output-section">
                <h2 class="section-title">Generated Cron Expression</h2>
                <div v-if="cronExpression" class="cron-result">
                    <div class="cron-display">
                        <span class="cron-text">{{ cronExpression }}</span>
                        <button @click="copyToClipboard" class="copy-btn" :class="{ 'copied': isCopied }">
                            {{ isCopied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                    <div class="cron-description">
                        {{ cronDescription }}
                    </div>
                </div>
                <div v-else class="placeholder-message">
                    Generated cron expression will appear here
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const minute = ref('*');
const hour = ref('*');
const day = ref('*');
const month = ref('*');
const weekday = ref('*');
const isCopied = ref(false);

const cronExpression = computed(() => {
    return `${minute.value} ${hour.value} ${day.value} ${month.value} ${weekday.value}`;
});

const cronDescription = computed(() => {
    let desc = 'Runs ';
    
    if (minute.value === '*') desc += 'every minute';
    else if (minute.value.startsWith('*/')) desc += `every ${minute.value.slice(2)} minutes`;
    else desc += `at minute ${minute.value}`;

    if (hour.value === '*') desc += ', every hour';
    else if (hour.value.startsWith('*/')) desc += `, every ${hour.value.slice(2)} hours`;
    else desc += `, at ${parseInt(hour.value) % 12 || 12} ${parseInt(hour.value) < 12 ? 'AM' : 'PM'}`;

    if (day.value === '*') desc += ', every day';
    else if (day.value.startsWith('*/')) desc += `, every ${day.value.slice(2)} days`;
    else desc += `, on day ${day.value}`;

    if (month.value !== '*') {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        desc += `, in ${months[parseInt(month.value) - 1]}`;
    }

    if (weekday.value !== '*') {
        if (weekday.value === '1-5') desc += ', on weekdays';
        else if (weekday.value === '0,6') desc += ', on weekends';
        else {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            desc += `, on ${days[parseInt(weekday.value)]}`;
        }
    }

    return desc;
});

const generateCron = () => {
    // The cron expression is automatically generated through the computed property
    isCopied.value = false;
};

const clearAll = () => {
    minute.value = '*';
    hour.value = '*';
    day.value = '*';
    month.value = '*';
    weekday.value = '*';
    isCopied.value = false;
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(cronExpression.value);
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

.cron-result {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
}

.cron-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.cron-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    color: var(--nav-text);
    word-break: break-all;
    flex: 1;
}

.cron-description {
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

.dark-mode .cron-result {
    background: rgba(31, 41, 55, 0.3);
}
</style> 