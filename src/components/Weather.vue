<template>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

    <div class="container">
      <h1 class="title">Weather</h1>
      <div class="weather-display">
        <div class="weather-info">
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="city" class="city-message">📍 {{ city }}</p>
            <template v-if="weatherData">
                <p class="weather-message">
                    {{ getWeatherEmoji(weatherData.current_weather.weathercode) }} 
                    {{ getWeatherDescription(weatherData.current_weather.weathercode) }}
                </p>
                <p class="temperature">{{ weatherData.current_weather.temperature }}°C</p>
            </template>
        </div>
        <div class="manual_refresh">
            <button @click="getCoordinates" class="refresh-btn">Refresh</button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    const coordinates = ref<{ latitude: number, longitude: number }>({
        latitude: 0,
        longitude: 0
    });

    const city = ref<string>('');

    const weatherData = ref<any>(null);
    const error = ref<string | null>(null);
    
    const getWeather = async () => {
        if (!coordinates.value) {
        error.value = 'Need coordinates to fetch weather data';
        return;
        }

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates.value.latitude}&longitude=${coordinates.value.longitude}&current_weather=true`);
            const data = await response.json();
            weatherData.value = data;
        } catch (err) {
        error.value = 'Failed to fetch weather data';
        }
    };

    const getCoordinates = async () => {
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                
                coordinates.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                // Only fetch weather and city data after we have coordinates
                await Promise.all([getWeather(), getCity()]);
            } catch (err) {
                console.error('Geolocation error:', err);
                error.value = 'Failed to get your location. Please check your browser settings.';
            }
        } else {
            error.value = 'Geolocation is not supported in your browser';
        }
    };

    const getCity = async () => {
        if (!coordinates.value || (coordinates.value.latitude === 0 && coordinates.value.longitude === 0)) {
            error.value = 'Need valid coordinates to fetch city data';
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.value.latitude}&lon=${coordinates.value.longitude}&format=json`,
                {
                    headers: {
                        'Accept': 'application/json',
                        // Adding a User-Agent header as per Nominatim's usage policy
                        'User-Agent': 'WeatherApp/1.0'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.address) {
                const address = data.address;
                // Construct location string with city and country
                let location = address.city || address.town || address.village || address.suburb || 'Unknown city';
                if (address.country) {
                    location += `, ${address.country}`;
                }
                city.value = location;
            } else {
                city.value = 'Location not found';
            }
        } catch (err) {
            console.error('City fetch error:', err);
            error.value = 'Failed to fetch city data';
            city.value = 'Unknown location';
        }
    };

    const getWeatherEmoji = (code: number): string => {
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        const weatherEmojis: { [key: number]: string } = {
            0: '☀️',  // Clear sky
            1: '🌤️', // Mainly clear
            2: '⛅', // Partly cloudy
            3: '☁️',  // Overcast
            45: '🌫️', // Foggy
            48: '🌫️', // Depositing rime fog
            51: '🌧️', // Light drizzle
            53: '🌧️', // Moderate drizzle
            55: '🌧️', // Dense drizzle
            56: '🌧️', // Light freezing drizzle
            57: '🌧️', // Dense freezing drizzle
            61: '🌧️', // Slight rain
            63: '🌧️', // Moderate rain
            65: '🌧️', // Heavy rain
            66: '🌧️', // Light freezing rain
            67: '🌧️', // Heavy freezing rain
            71: '🌨️', // Slight snow fall
            73: '🌨️', // Moderate snow fall
            75: '🌨️', // Heavy snow fall
            77: '❄️',  // Snow grains
            80: '🌧️', // Slight rain showers
            81: '🌧️', // Moderate rain showers
            82: '🌧️', // Violent rain showers
            85: '🌨️', // Slight snow showers
            86: '🌨️', // Heavy snow showers
            95: '⛈️', // Thunderstorm
            96: '⛈️', // Thunderstorm with slight hail
            99: '⛈️'  // Thunderstorm with heavy hail
        };
        return weatherEmojis[code] || '❓';
    };

    const getWeatherDescription = (code: number): string => {
        const descriptions: { [key: number]: string } = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return descriptions[code] || 'Unknown weather';
    };

    getCoordinates();

</script>

<style scoped>
.container {
    max-width: 400px;
    width: 90%;
    padding: 2rem;
    background: var(--container-bg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    margin: 2rem auto;
}

.title {
    font-size: 2.5rem;
    margin-bottom: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.weather-display {
    padding: 1.5rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
}

.weather-info {
    margin-bottom: 2rem;
}

.weather-info p {
    margin: 1rem 0;
    font-size: 1.2rem;
}

.city-message {
    font-weight: 600;
    color: var(--text-primary);
}

.weather-message {
    font-size: 1.5rem !important;
    margin: 1.5rem 0 !important;
}

.temperature {
    font-size: 2.5rem !important;
    font-weight: 700;
    color: var(--text-primary);
}

.error-message {
    color: #ef4444;
    font-weight: 500;
}

.refresh-btn {
    background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.refresh-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.dark-mode .weather-display {
    background: rgba(0, 0, 0, 0.2);
}

.dark-mode .city-message,
.dark-mode .temperature {
    color: var(--text-primary);
}
</style>
