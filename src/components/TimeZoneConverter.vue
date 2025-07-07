<template>
  <div class="timezone-converter">
    <div class="timezone-header">
      <h2>Time Zone Converter</h2>
      <p class="subtitle">Add time zones to compare current times</p>
    </div>

    <div class="timezone-controls">
      <div class="timezone-selector">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by timezone, country, or capital city..."
            @input="filterTimeZones"
            @focus="isSearchFocused = true"
            @blur="handleBlur"
            data-test-id="timezone-search-input"
          />
          <div 
            v-if="searchQuery && filteredTimeZones.length > 0 && isSearchFocused" 
            class="search-results"
            data-test-id="timezone-search-results"
          >
            <div
              v-for="zone in filteredTimeZones"
              :key="zone.value"
              class="search-result-item"
              @mousedown="selectTimeZone(zone.value)"
              :data-test-id="'timezone-search-result-' + zone.value"
            >
              <div class="result-name">{{ zone.label }}</div>
              <div class="result-details">{{ zone.details }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="timezone-grid">
      <div v-for="zone in sortedTimeZones" :key="zone" class="timezone-card" :data-test-id="'timezone-card-' + zone">
        <div class="timezone-info">
          <h3>{{ formatTimeZoneName(zone) }}</h3>
          <div class="time">{{ getCurrentTime(zone) }}</div>
          <div class="offset">UTC {{ getTimeZoneOffset(zone) }}</div>
        </div>
        <button @click="removeTimeZone(zone)" class="remove-button" :data-test-id="'remove-btn-' + zone">×</button>
      </div>
    </div>

    <div v-if="savedTimeZones.length > 0" class="actions">
      <button @click="clearTimeZones" class="clear-button" data-test-id="clear-all-btn">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const savedTimeZones = ref<string[]>([]);
const availableTimeZones = ref<string[]>([]);
const searchQuery = ref('');
const filteredTimeZones = ref<Array<{ value: string; label: string; details: string }>>([]);
const isSearchFocused = ref(false);

// Time zone data mapping - simplified to focus on capital cities
const timeZoneData = {
  // Africa
  'Africa/Kabul': { country: 'Afghanistan', capital: 'Kabul', abbreviation: 'AFT' },
  'Europe/Tirane': { country: 'Albania', capital: 'Tirana', abbreviation: 'CET/CEST' },
  'Africa/Algiers': { country: 'Algeria', capital: 'Algiers', abbreviation: 'CET' },
  'Europe/Andorra': { country: 'Andorra', capital: 'Andorra la Vella', abbreviation: 'CET/CEST' },
  'Africa/Luanda': { country: 'Angola', capital: 'Luanda', abbreviation: 'WAT' },
  'America/Antigua': { country: 'Antigua and Barbuda', capital: 'Saint John\'s', abbreviation: 'AST' },
  'America/Buenos_Aires': { country: 'Argentina', capital: 'Buenos Aires', abbreviation: 'ART' },
  'Asia/Yerevan': { country: 'Armenia', capital: 'Yerevan', abbreviation: 'AMT' },
  'Australia/Sydney': { country: 'Australia', capital: 'Canberra', abbreviation: 'AEST/AEDT' },
  'Europe/Vienna': { country: 'Austria', capital: 'Vienna', abbreviation: 'CET/CEST' },
  'Asia/Baku': { country: 'Azerbaijan', capital: 'Baku', abbreviation: 'AZT' },
  
  // B
  'America/Nassau': { country: 'The Bahamas', capital: 'Nassau', abbreviation: 'EST/EDT' },
  'Asia/Bahrain': { country: 'Bahrain', capital: 'Manama', abbreviation: 'AST' },
  'Asia/Dhaka': { country: 'Bangladesh', capital: 'Dhaka', abbreviation: 'BST' },
  'America/Barbados': { country: 'Barbados', capital: 'Bridgetown', abbreviation: 'AST' },
  'Europe/Minsk': { country: 'Belarus', capital: 'Minsk', abbreviation: 'MSK' },
  'Europe/Brussels': { country: 'Belgium', capital: 'Brussels', abbreviation: 'CET/CEST' },
  'America/Belize': { country: 'Belize', capital: 'Belmopan', abbreviation: 'CST' },
  'Africa/Porto-Novo': { country: 'Benin', capital: 'Porto-Novo', abbreviation: 'WAT' },
  'Asia/Thimphu': { country: 'Bhutan', capital: 'Thimphu', abbreviation: 'BTT' },
  'America/La_Paz': { country: 'Bolivia', capital: 'La Paz', abbreviation: 'BOT' },
  'Europe/Sarajevo': { country: 'Bosnia and Herzegovina', capital: 'Sarajevo', abbreviation: 'CET/CEST' },
  'Africa/Gaborone': { country: 'Botswana', capital: 'Gaborone', abbreviation: 'CAT' },
  'Asia/Brunei': { country: 'Brunei', capital: 'Bandar Seri Begawan', abbreviation: 'BNT' },
  'Europe/Sofia': { country: 'Bulgaria', capital: 'Sofia', abbreviation: 'EET/EEST' },
  'Africa/Ouagadougou': { country: 'Burkina Faso', capital: 'Ouagadougou', abbreviation: 'GMT' },
  'Africa/Bujumbura': { country: 'Burundi', capital: 'Gitega', abbreviation: 'CAT' },
  
  // C
  'Atlantic/Cape_Verde': { country: 'Cabo Verde', capital: 'Praia', abbreviation: 'CVT' },
  'Asia/Phnom_Penh': { country: 'Cambodia', capital: 'Phnom Penh', abbreviation: 'ICT' },
  'Africa/Douala': { country: 'Cameroon', capital: 'Yaoundé', abbreviation: 'WAT' },
  'America/Toronto': { country: 'Canada', capital: 'Ottawa', abbreviation: 'EST/EDT' },
  'Africa/Bangui': { country: 'Central African Republic', capital: 'Bangui', abbreviation: 'WAT' },
  'Africa/Ndjamena': { country: 'Chad', capital: 'N\'Djamena', abbreviation: 'WAT' },
  'America/Santiago': { country: 'Chile', capital: 'Santiago', abbreviation: 'CLT' },
  'Asia/Shanghai': { country: 'China', capital: 'Beijing', abbreviation: 'CST' },
  'America/Bogota': { country: 'Colombia', capital: 'Bogotá', abbreviation: 'COT' },
  'Indian/Comoro': { country: 'Comoros', capital: 'Moroni', abbreviation: 'EAT' },
  'Africa/Kinshasa': { country: 'Congo, Democratic Republic of the', capital: 'Kinshasa', abbreviation: 'WAT' },
  'Africa/Brazzaville': { country: 'Congo, Republic of the', capital: 'Brazzaville', abbreviation: 'WAT' },
  'America/San_Jose': { country: 'Costa Rica', capital: 'San José', abbreviation: 'CST' },
  'Africa/Abidjan': { country: 'Côte d\'Ivoire', capital: 'Yamoussoukro', abbreviation: 'GMT' },
  'Europe/Zagreb': { country: 'Croatia', capital: 'Zagreb', abbreviation: 'CET/CEST' },
  'America/Havana': { country: 'Cuba', capital: 'Havana', abbreviation: 'CST/CDT' },
  'Asia/Nicosia': { country: 'Cyprus', capital: 'Nicosia', abbreviation: 'EET/EEST' },
  'Europe/Prague': { country: 'Czech Republic', capital: 'Prague', abbreviation: 'CET/CEST' },
  
  // D
  'Europe/Copenhagen': { country: 'Denmark', capital: 'Copenhagen', abbreviation: 'CET/CEST' },
  'Africa/Djibouti': { country: 'Djibouti', capital: 'Djibouti', abbreviation: 'EAT' },
  'America/Dominica': { country: 'Dominica', capital: 'Roseau', abbreviation: 'AST' },
  'America/Santo_Domingo': { country: 'Dominican Republic', capital: 'Santo Domingo', abbreviation: 'AST' },
  
  // E
  'Asia/Dili': { country: 'East Timor (Timor-Leste)', capital: 'Dili', abbreviation: 'TLT' },
  'America/Guayaquil': { country: 'Ecuador', capital: 'Quito', abbreviation: 'ECT' },
  'Africa/Cairo': { country: 'Egypt', capital: 'Cairo', abbreviation: 'EET' },
  'America/El_Salvador': { country: 'El Salvador', capital: 'San Salvador', abbreviation: 'CST' },
  'Africa/Malabo': { country: 'Equatorial Guinea', capital: 'Malabo', abbreviation: 'WAT' },
  'Africa/Asmara': { country: 'Eritrea', capital: 'Asmara', abbreviation: 'EAT' },
  'Europe/Tallinn': { country: 'Estonia', capital: 'Tallinn', abbreviation: 'EET/EEST' },
  'Africa/Mbabane': { country: 'Eswatini', capital: 'Mbabane', abbreviation: 'SAST' },
  'Africa/Addis_Ababa': { country: 'Ethiopia', capital: 'Addis Ababa', abbreviation: 'EAT' },
  
  // F
  'Pacific/Fiji': { country: 'Fiji', capital: 'Suva', abbreviation: 'FJT' },
  'Europe/Helsinki': { country: 'Finland', capital: 'Helsinki', abbreviation: 'EET/EEST' },
  'Europe/Paris': { country: 'France', capital: 'Paris', abbreviation: 'CET/CEST' },
  
  // G
  'Africa/Libreville': { country: 'Gabon', capital: 'Libreville', abbreviation: 'WAT' },
  'Africa/Banjul': { country: 'The Gambia', capital: 'Banjul', abbreviation: 'GMT' },
  'Asia/Tbilisi': { country: 'Georgia', capital: 'Tbilisi', abbreviation: 'GET' },
  'Europe/Berlin': { country: 'Germany', capital: 'Berlin', abbreviation: 'CET/CEST' },
  'Africa/Accra': { country: 'Ghana', capital: 'Accra', abbreviation: 'GMT' },
  'Europe/Athens': { country: 'Greece', capital: 'Athens', abbreviation: 'EET/EEST' },
  'America/Grenada': { country: 'Grenada', capital: 'Saint George\'s', abbreviation: 'AST' },
  'America/Guatemala': { country: 'Guatemala', capital: 'Guatemala City', abbreviation: 'CST' },
  'Africa/Conakry': { country: 'Guinea', capital: 'Conakry', abbreviation: 'GMT' },
  'Africa/Bissau': { country: 'Guinea-Bissau', capital: 'Bissau', abbreviation: 'GMT' },
  'America/Georgetown': { country: 'Guyana', capital: 'Georgetown', abbreviation: 'GYT' },
  
  // H
  'America/Port-au-Prince': { country: 'Haiti', capital: 'Port-au-Prince', abbreviation: 'EST/EDT' },
  'America/Tegucigalpa': { country: 'Honduras', capital: 'Tegucigalpa', abbreviation: 'CST' },
  'Europe/Budapest': { country: 'Hungary', capital: 'Budapest', abbreviation: 'CET/CEST' },
  
  // I
  'Atlantic/Reykjavik': { country: 'Iceland', capital: 'Reykjavík', abbreviation: 'GMT' },
  'Asia/Kolkata': { country: 'India', capital: 'New Delhi', abbreviation: 'IST' },
  'Asia/Jakarta': { country: 'Indonesia', capital: 'Jakarta', abbreviation: 'WIB' },
  'Asia/Tehran': { country: 'Iran', capital: 'Tehran', abbreviation: 'IRST' },
  'Asia/Baghdad': { country: 'Iraq', capital: 'Baghdad', abbreviation: 'AST' },
  'Europe/Dublin': { country: 'Ireland', capital: 'Dublin', abbreviation: 'GMT/IST' },
  'Asia/Jerusalem': { country: 'Israel', capital: 'Jerusalem', abbreviation: 'IST' },
  'Europe/Rome': { country: 'Italy', capital: 'Rome', abbreviation: 'CET/CEST' },
  
  // J
  'America/Jamaica': { country: 'Jamaica', capital: 'Kingston', abbreviation: 'EST' },
  'Asia/Tokyo': { country: 'Japan', capital: 'Tokyo', abbreviation: 'JST' },
  'Asia/Amman': { country: 'Jordan', capital: 'Amman', abbreviation: 'EET/EEST' },
  
  // K
  'Asia/Almaty': { country: 'Kazakhstan', capital: 'Nur-Sultan', abbreviation: 'ALMT' },
  'Africa/Nairobi': { country: 'Kenya', capital: 'Nairobi', abbreviation: 'EAT' },
  'Pacific/Tarawa': { country: 'Kiribati', capital: 'South Tarawa', abbreviation: 'GILT' },
  'Asia/Pyongyang': { country: 'Korea, North', capital: 'Pyongyang', abbreviation: 'KST' },
  'Asia/Seoul': { country: 'Korea, South', capital: 'Seoul', abbreviation: 'KST' },
  'Europe/Pristina': { country: 'Kosovo', capital: 'Pristina', abbreviation: 'CET/CEST' },
  'Asia/Kuwait': { country: 'Kuwait', capital: 'Kuwait City', abbreviation: 'AST' },
  'Asia/Bishkek': { country: 'Kyrgyzstan', capital: 'Bishkek', abbreviation: 'KGT' },
  
  // L
  'Asia/Vientiane': { country: 'Laos', capital: 'Vientiane', abbreviation: 'ICT' },
  'Europe/Riga': { country: 'Latvia', capital: 'Riga', abbreviation: 'EET/EEST' },
  'Asia/Beirut': { country: 'Lebanon', capital: 'Beirut', abbreviation: 'EET/EEST' },
  'Africa/Maseru': { country: 'Lesotho', capital: 'Maseru', abbreviation: 'SAST' },
  'Africa/Monrovia': { country: 'Liberia', capital: 'Monrovia', abbreviation: 'GMT' },
  'Africa/Tripoli': { country: 'Libya', capital: 'Tripoli', abbreviation: 'EET' },
  'Europe/Vaduz': { country: 'Liechtenstein', capital: 'Vaduz', abbreviation: 'CET/CEST' },
  'Europe/Vilnius': { country: 'Lithuania', capital: 'Vilnius', abbreviation: 'EET/EEST' },
  'Europe/Luxembourg': { country: 'Luxembourg', capital: 'Luxembourg City', abbreviation: 'CET/CEST' },
  
  // M
  'Indian/Antananarivo': { country: 'Madagascar', capital: 'Antananarivo', abbreviation: 'EAT' },
  'Africa/Blantyre': { country: 'Malawi', capital: 'Lilongwe', abbreviation: 'CAT' },
  'Asia/Kuala_Lumpur': { country: 'Malaysia', capital: 'Kuala Lumpur', abbreviation: 'MYT' },
  'Indian/Maldives': { country: 'Maldives', capital: 'Malé', abbreviation: 'MVT' },
  'Africa/Bamako': { country: 'Mali', capital: 'Bamako', abbreviation: 'GMT' },
  'Europe/Malta': { country: 'Malta', capital: 'Valletta', abbreviation: 'CET/CEST' },
  'Pacific/Majuro': { country: 'Marshall Islands', capital: 'Majuro', abbreviation: 'MHT' },
  'Africa/Nouakchott': { country: 'Mauritania', capital: 'Nouakchott', abbreviation: 'GMT' },
  'Indian/Mauritius': { country: 'Mauritius', capital: 'Port Louis', abbreviation: 'MUT' },
  'America/Mexico_City': { country: 'Mexico', capital: 'Mexico City', abbreviation: 'CST/CDT' },
  'Pacific/Pohnpei': { country: 'Micronesia, Federated States of', capital: 'Palikir', abbreviation: 'CHUT' },
  'Europe/Chisinau': { country: 'Moldova', capital: 'Chișinău', abbreviation: 'EET/EEST' },
  'Europe/Monaco': { country: 'Monaco', capital: 'Monaco', abbreviation: 'CET/CEST' },
  'Asia/Ulaanbaatar': { country: 'Mongolia', capital: 'Ulaanbaatar', abbreviation: 'ULAT' },
  'Europe/Podgorica': { country: 'Montenegro', capital: 'Podgorica', abbreviation: 'CET/CEST' },
  'Africa/Casablanca': { country: 'Morocco', capital: 'Rabat', abbreviation: 'WAT' },
  'Africa/Maputo': { country: 'Mozambique', capital: 'Maputo', abbreviation: 'CAT' },
  'Asia/Yangon': { country: 'Myanmar (Burma)', capital: 'Naypyidaw', abbreviation: 'MMT' },
  
  // N
  'Africa/Windhoek': { country: 'Namibia', capital: 'Windhoek', abbreviation: 'CAT' },
  'Pacific/Nauru': { country: 'Nauru', capital: 'Yaren', abbreviation: 'NRT' },
  'Asia/Kathmandu': { country: 'Nepal', capital: 'Kathmandu', abbreviation: 'NPT' },
  'Europe/Amsterdam': { country: 'Netherlands', capital: 'Amsterdam', abbreviation: 'CET/CEST' },
  'Pacific/Auckland': { country: 'New Zealand', capital: 'Wellington', abbreviation: 'NZST/NZDT' },
  'America/Managua': { country: 'Nicaragua', capital: 'Managua', abbreviation: 'CST' },
  'Africa/Niamey': { country: 'Niger', capital: 'Niamey', abbreviation: 'WAT' },
  'Africa/Lagos': { country: 'Nigeria', capital: 'Abuja', abbreviation: 'WAT' },
  'Europe/Skopje': { country: 'North Macedonia', capital: 'Skopje', abbreviation: 'CET/CEST' },
  'Europe/Oslo': { country: 'Norway', capital: 'Oslo', abbreviation: 'CET/CEST' },
  
  // O
  'Asia/Muscat': { country: 'Oman', capital: 'Muscat', abbreviation: 'GST' },
  
  // P
  'Asia/Karachi': { country: 'Pakistan', capital: 'Islamabad', abbreviation: 'PKT' },
  'Pacific/Palau': { country: 'Palau', capital: 'Ngerulmud', abbreviation: 'PWT' },
  'America/Panama': { country: 'Panama', capital: 'Panama City', abbreviation: 'EST' },
  'Pacific/Port_Moresby': { country: 'Papua New Guinea', capital: 'Port Moresby', abbreviation: 'PGT' },
  'America/Asuncion': { country: 'Paraguay', capital: 'Asunción', abbreviation: 'PYT' },
  'America/Lima': { country: 'Peru', capital: 'Lima', abbreviation: 'PET' },
  'Asia/Manila': { country: 'Philippines', capital: 'Manila', abbreviation: 'PHT' },
  'Europe/Warsaw': { country: 'Poland', capital: 'Warsaw', abbreviation: 'CET/CEST' },
  'Europe/Lisbon': { country: 'Portugal', capital: 'Lisbon', abbreviation: 'WET/WEST' },
  
  // Q
  'Asia/Qatar': { country: 'Qatar', capital: 'Doha', abbreviation: 'AST' },
  
  // R
  'Europe/Bucharest': { country: 'Romania', capital: 'Bucharest', abbreviation: 'EET/EEST' },
  'Europe/Moscow': { country: 'Russia', capital: 'Moscow', abbreviation: 'MSK' },
  'Africa/Kigali': { country: 'Rwanda', capital: 'Kigali', abbreviation: 'CAT' },
  
  // S
  'America/St_Kitts': { country: 'Saint Kitts and Nevis', capital: 'Basseterre', abbreviation: 'AST' },
  'America/St_Lucia': { country: 'Saint Lucia', capital: 'Castries', abbreviation: 'AST' },
  'America/St_Vincent': { country: 'Saint Vincent and the Grenadines', capital: 'Kingstown', abbreviation: 'AST' },
  'Pacific/Apia': { country: 'Samoa', capital: 'Apia', abbreviation: 'WST' },
  'Europe/San_Marino': { country: 'San Marino', capital: 'San Marino', abbreviation: 'CET/CEST' },
  'Africa/Sao_Tome': { country: 'Sao Tome and Principe', capital: 'São Tomé', abbreviation: 'GMT' },
  'Asia/Riyadh': { country: 'Saudi Arabia', capital: 'Riyadh', abbreviation: 'AST' },
  'Africa/Dakar': { country: 'Senegal', capital: 'Dakar', abbreviation: 'GMT' },
  'Europe/Belgrade': { country: 'Serbia', capital: 'Belgrade', abbreviation: 'CET/CEST' },
  'Indian/Mahe': { country: 'Seychelles', capital: 'Victoria', abbreviation: 'SCT' },
  'Africa/Freetown': { country: 'Sierra Leone', capital: 'Freetown', abbreviation: 'GMT' },
  'Asia/Singapore': { country: 'Singapore', capital: 'Singapore', abbreviation: 'SGT' },
  'Europe/Bratislava': { country: 'Slovakia', capital: 'Bratislava', abbreviation: 'CET/CEST' },
  'Europe/Ljubljana': { country: 'Slovenia', capital: 'Ljubljana', abbreviation: 'CET/CEST' },
  'Pacific/Guadalcanal': { country: 'Solomon Islands', capital: 'Honiara', abbreviation: 'SBT' },
  'Africa/Mogadishu': { country: 'Somalia', capital: 'Mogadishu', abbreviation: 'EAT' },
  'Africa/Johannesburg': { country: 'South Africa', capital: 'Pretoria', abbreviation: 'SAST' },
  'Europe/Madrid': { country: 'Spain', capital: 'Madrid', abbreviation: 'CET/CEST' },
  'Asia/Colombo': { country: 'Sri Lanka', capital: 'Colombo', abbreviation: 'SLST' },
  'Africa/Khartoum': { country: 'Sudan', capital: 'Khartoum', abbreviation: 'CAT' },
  'Africa/Juba': { country: 'Sudan, South', capital: 'Juba', abbreviation: 'CAT' },
  'America/Paramaribo': { country: 'Suriname', capital: 'Paramaribo', abbreviation: 'SRT' },
  'Europe/Stockholm': { country: 'Sweden', capital: 'Stockholm', abbreviation: 'CET/CEST' },
  'Europe/Zurich': { country: 'Switzerland', capital: 'Bern', abbreviation: 'CET/CEST' },
  'Asia/Damascus': { country: 'Syria', capital: 'Damascus', abbreviation: 'EET/EEST' },
  
  // T
  'Asia/Taipei': { country: 'Taiwan', capital: 'Taipei', abbreviation: 'CST' },
  'Asia/Dushanbe': { country: 'Tajikistan', capital: 'Dushanbe', abbreviation: 'TJT' },
  'Africa/Dar_es_Salaam': { country: 'Tanzania', capital: 'Dodoma', abbreviation: 'EAT' },
  'Asia/Bangkok': { country: 'Thailand', capital: 'Bangkok', abbreviation: 'ICT' },
  'Africa/Lome': { country: 'Togo', capital: 'Lomé', abbreviation: 'GMT' },
  'Pacific/Tongatapu': { country: 'Tonga', capital: 'Nukualofa', abbreviation: 'TOT' },
  'America/Port_of_Spain': { country: 'Trinidad and Tobago', capital: 'Port of Spain', abbreviation: 'AST' },
  'Africa/Tunis': { country: 'Tunisia', capital: 'Tunis', abbreviation: 'CET' },
  'Europe/Istanbul': { country: 'Turkey', capital: 'Ankara', abbreviation: 'TRT' },
  'Asia/Ashgabat': { country: 'Turkmenistan', capital: 'Ashgabat', abbreviation: 'TMT' },
  'Pacific/Funafuti': { country: 'Tuvalu', capital: 'Funafuti', abbreviation: 'TVT' },
  
  // U
  'Africa/Kampala': { country: 'Uganda', capital: 'Kampala', abbreviation: 'EAT' },
  'Europe/Kiev': { country: 'Ukraine', capital: 'Kyiv', abbreviation: 'EET/EEST' },
  'Asia/Dubai': { country: 'United Arab Emirates', capital: 'Abu Dhabi', abbreviation: 'GST' },
  'Europe/London': { country: 'United Kingdom', capital: 'London', abbreviation: 'GMT/BST' },
  'America/WashingtonDC': { country: 'United States', capital: 'Washington, D.C.', abbreviation: 'EST/EDT' },
  'America/Montevideo': { country: 'Uruguay', capital: 'Montevideo', abbreviation: 'UYT' },
  'Asia/Tashkent': { country: 'Uzbekistan', capital: 'Tashkent', abbreviation: 'UZT' },
  
  // V
  'Pacific/Efate': { country: 'Vanuatu', capital: 'Port Vila', abbreviation: 'VUT' },
  'Europe/Vatican': { country: 'Vatican City', capital: 'Vatican City', abbreviation: 'CET/CEST' },
  'America/Caracas': { country: 'Venezuela', capital: 'Caracas', abbreviation: 'VET' },
  'Asia/Hanoi': { country: 'Vietnam', capital: 'Hanoi', abbreviation: 'ICT' },
    
  // Y
  'Asia/Aden': { country: 'Yemen', capital: 'Sanaa', abbreviation: 'AST' },
  
  // Z
  'Africa/Lusaka': { country: 'Zambia', capital: 'Lusaka', abbreviation: 'CAT' },
  'Africa/Harare': { country: 'Zimbabwe', capital: 'Harare', abbreviation: 'CAT' }
};

// Load saved time zones from localStorage
onMounted(() => {
  const saved = localStorage.getItem('savedTimeZones');
  if (saved) {
    savedTimeZones.value = JSON.parse(saved);
  }
  
  // Get all available time zones
  try {
    // @ts-ignore - supportedValuesOf is a newer API
    availableTimeZones.value = Intl.supportedValuesOf('timeZone');
  } catch (error) {
    console.error('Error loading time zones:', error);
  }
});

// Filter time zones based on search query
const filterTimeZones = () => {
  if (!searchQuery.value) {
    filteredTimeZones.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase().trim();
  const results: Array<{ value: string; label: string; details: string }> = [];

  availableTimeZones.value.forEach(zone => {
    const zoneData = timeZoneData[zone as keyof typeof timeZoneData];
    if (!zoneData) return;
    
    const matchesCapital = zoneData.capital.toLowerCase().includes(query);
    const matchesCountry = zoneData.country.toLowerCase().includes(query);
    const matchesAbbreviation = zoneData.abbreviation.toLowerCase().includes(query);
    
    if (matchesCapital || matchesCountry || matchesAbbreviation) {
      results.push({
        value: zone,
        label: `${zoneData.country} - ${zoneData.capital} (${zoneData.abbreviation})`,
        details: `${zoneData.country}`
      });
    }
  });

  filteredTimeZones.value = results.slice(0, 10); // Limit to 10 results
};

// Select a time zone from search results
const selectTimeZone = (zone: string) => {
  if (!savedTimeZones.value.includes(zone)) {
    savedTimeZones.value.push(zone);
    saveTimeZones();
  }
  searchQuery.value = '';
  filteredTimeZones.value = [];
  isSearchFocused.value = false;
};

// Save time zones to localStorage whenever they change
const saveTimeZones = () => {
  localStorage.setItem('savedTimeZones', JSON.stringify(savedTimeZones.value));
};

// Remove a time zone
const removeTimeZone = (zone: string) => {
  savedTimeZones.value = savedTimeZones.value.filter(z => z !== zone);
  saveTimeZones();
};

// Clear all time zones
const clearTimeZones = () => {
  savedTimeZones.value = [];
  saveTimeZones();
};

// Format time zone name for display
const formatTimeZoneName = (zone: string): string => {
  try {
    const zoneData = timeZoneData[zone as keyof typeof timeZoneData];
    if (!zoneData) return zone;
    return `${zoneData.country} - ${zoneData.capital} (${zoneData.abbreviation})`;
  } catch {
    return zone;
  }
};

// Get current time in the specified time zone
const getCurrentTime = (zone: string): string => {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: zone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid time zone';
  }
};

// Get time in minutes for sorting
const getTimeInMinutes = (zone: string): number => {
  try {
    const time = new Date().toLocaleTimeString('en-US', {
      timeZone: zone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

// Sort time zones by current time
const sortedTimeZones = computed(() => {
  return [...savedTimeZones.value].sort((a, b) => {
    return getTimeInMinutes(a) - getTimeInMinutes(b);
  });
});

// Get UTC offset for the time zone
const getTimeZoneOffset = (zone: string): string => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(date);
    const offset = parts.find(part => part.type === 'timeZoneName')?.value || '';
    return offset.replace('GMT', '');
  } catch {
    return 'N/A';
  }
};

// Update times every second
let timer: number;
onMounted(() => {
  timer = window.setInterval(() => {
    // Force a re-render to update times
    savedTimeZones.value = [...savedTimeZones.value];
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// Handle blur event with a small delay to allow click events
const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
};
</script>

<style scoped>
.timezone-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
}

.timezone-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #a0aec0;
  margin-top: 0.5rem;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.timezone-controls {
  margin-bottom: 2rem;
}

.timezone-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.timezone-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.add-button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  min-width: 120px;
}

.add-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.add-button:disabled {
  background: var(--disabled-color);
  cursor: not-allowed;
  transform: none;
}

.warning {
  color: #ffa500;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.timezone-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.timezone-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  flex: 1;
  max-width: 300px;
}

.timezone-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.time {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.offset {
  font-size: 0.9rem;
  color: #a0aec0;
  opacity: 0.9;
}

.remove-button {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.remove-button:hover {
  color: #ff4444;
}

.actions {
  display: flex;
  justify-content: center;
}

.clear-button {
  padding: 0.5rem 1rem;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background: var(--error-hover-color);
}

.search-container {
  position: relative;
  flex: 1;
}

.search-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.search-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.search-tab:hover {
  background: var(--button-hover);
  color: var(--text-primary);
}

.search-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
}

.search-result-item:hover {
  background: var(--button-hover);
}

.result-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.result-details {
  font-size: 0.85rem;
  color: var(--text-primary);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .timezone-converter {
    padding: 1rem;
  }

  .timezone-selector {
    flex-direction: column;
  }

  .search-container {
    width: 100%;
    margin-bottom: 1rem;
  }

  .add-button {
    width: 100%;
  }

  .search-tabs {
    flex-wrap: wrap;
  }
  
  .search-tab {
    flex: 1;
    text-align: center;
  }
}
</style> 