export const COUNTRY_LIST = [
  { name: "United States", timezone: "UTC-5 to UTC-10", flag: "🇺🇸" },
  { name: "France", timezone: "UTC+1", flag: "🇫🇷" },
  { name: "Spain", timezone: "UTC+1", flag: "🇪🇸" },
  { name: "Italy", timezone: "UTC+1", flag: "🇮🇹" },
  { name: "United Kingdom", timezone: "UTC+0", flag: "🇬🇧" },
  { name: "China", timezone: "UTC+8", flag: "🇨🇳" },
  { name: "Japan", timezone: "UTC+9", flag: "🇯🇵" },
  { name: "Germany", timezone: "UTC+1", flag: "🇩🇪" },
  { name: "Australia", timezone: "UTC+8 to UTC+10", flag: "🇦🇺" },
  { name: "Canada", timezone: "UTC-3.5 to UTC-8", flag: "🇨🇦" },
  { name: "Mexico", timezone: "UTC-8 to UTC-5", flag: "🇲🇽" },
  { name: "India", timezone: "UTC+5:30", flag: "🇮🇳" },
  { name: "Thailand", timezone: "UTC+7", flag: "🇹🇭" },
  { name: "Greece", timezone: "UTC+2", flag: "🇬🇷" },
  { name: "Netherlands", timezone: "UTC+1", flag: "🇳🇱" },
  { name: "Switzerland", timezone: "UTC+1", flag: "🇨🇭" },
  { name: "Austria", timezone: "UTC+1", flag: "🇦🇹" },
  { name: "Egypt", timezone: "UTC+2", flag: "🇪🇬" },
  { name: "Turkey", timezone: "UTC+3", flag: "🇹🇷" },
  { name: "Brazil", timezone: "UTC-5 to UTC-2", flag: "🇧🇷" },
  { name: "Argentina", timezone: "UTC-3", flag: "🇦🇷" },
  { name: "South Africa", timezone: "UTC+2", flag: "🇿🇦" },
  { name: "Morocco", timezone: "UTC+0", flag: "🇲🇦" },
  { name: "Portugal", timezone: "UTC+0", flag: "🇵🇹" },
  { name: "Russia", timezone: "UTC+3 to UTC+12", flag: "🇷🇺" },
  { name: "Norway", timezone: "UTC+1", flag: "🇳🇴" },
  { name: "Sweden", timezone: "UTC+1", flag: "🇸🇪" },
  { name: "Denmark", timezone: "UTC+1", flag: "🇩🇰" },
  { name: "New Zealand", timezone: "UTC+12 to UTC+13", flag: "🇳🇿" },
  { name: "Iceland", timezone: "UTC+0", flag: "🇮🇸" },
  { name: "Ireland", timezone: "UTC+0", flag: "🇮🇪" },
  { name: "South Korea", timezone: "UTC+9", flag: "🇰🇷" },
  { name: "Singapore", timezone: "UTC+8", flag: "🇸🇬" },
  { name: "UAE", timezone: "UTC+4", flag: "🇦🇪" },
  { name: "Israel", timezone: "UTC+2", flag: "🇮🇱" },
  { name: "Peru", timezone: "UTC-5", flag: "🇵🇪" },
  { name: "Chile", timezone: "UTC-6 to UTC-3", flag: "🇨🇱" },
  { name: "Costa Rica", timezone: "UTC-6", flag: "🇨🇷" },
  { name: "Indonesia", timezone: "UTC+7 to UTC+9", flag: "🇮🇩" },
  { name: "Malaysia", timezone: "UTC+8", flag: "🇲🇾" },
  { name: "Vietnam", timezone: "UTC+7", flag: "🇻🇳" },
  { name: "Philippines", timezone: "UTC+8", flag: "🇵🇭" },
  { name: "Croatia", timezone: "UTC+1", flag: "🇭🇷" },
  { name: "Czech Republic", timezone: "UTC+1", flag: "🇨🇿" },
];

// Countries currently supported by the conversation inbox. Keep this map small
// until the API starts returning a consistent ISO country code for every session.
export const COUNTRY_MAP = {
  bangladesh: { name: "Bangladesh", code: "BD", flag: "🇧🇩" },
  "united states": { name: "United States", code: "US", flag: "🇺🇸" },
  "united kingdom": { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  canada: { name: "Canada", code: "CA", flag: "🇨🇦" },
  india: { name: "India", code: "IN", flag: "🇮🇳" },
  australia: { name: "Australia", code: "AU", flag: "🇦🇺" },
  germany: { name: "Germany", code: "DE", flag: "🇩🇪" },
  france: { name: "France", code: "FR", flag: "🇫🇷" },
  "united arab emirates": {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
  },
  singapore: { name: "Singapore", code: "SG", flag: "🇸🇬" },
};

const COUNTRY_ALIASES = {
  bd: "bangladesh",
  us: "united states",
  usa: "united states",
  gb: "united kingdom",
  uk: "united kingdom",
  ca: "canada",
  in: "india",
  au: "australia",
  de: "germany",
  fr: "france",
  ae: "united arab emirates",
  uae: "united arab emirates",
  sg: "singapore",
};

export function getCountryMeta(country) {
  const normalizedCountry = String(country || "").trim().toLowerCase();
  const countryKey = COUNTRY_ALIASES[normalizedCountry] || normalizedCountry;
  return COUNTRY_MAP[countryKey] || null;
}
