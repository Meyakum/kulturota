// wttr.in — ücretsiz hava durumu API (key gerekmez)
export interface WeatherData {
  temp: string;
  desc: string;
  emoji: string;
}

const WEATHER_CODE_MAP: Record<string, string> = {
  '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️',
  '143': '🌫️', '176': '🌦️', '179': '🌨️', '182': '🌧️',
  '185': '🌧️', '200': '⛈️', '227': '🌨️', '230': '❄️',
  '248': '🌫️', '260': '🌫️', '263': '🌦️', '266': '🌧️',
  '281': '🌧️', '284': '🌧️', '293': '🌧️', '296': '🌧️',
  '299': '🌧️', '302': '🌧️', '305': '🌧️', '308': '🌧️',
  '311': '🌧️', '314': '🌧️', '317': '🌨️', '320': '🌨️',
  '323': '🌨️', '326': '🌨️', '329': '❄️', '332': '❄️',
  '335': '❄️', '338': '❄️', '350': '🌨️', '353': '🌦️',
  '356': '🌧️', '359': '🌧️', '362': '🌨️', '365': '🌨️',
  '368': '🌨️', '371': '❄️', '374': '🌨️', '377': '🌨️',
  '386': '⛈️', '389': '⛈️', '392': '⛈️', '395': '❄️',
};

export async function getIstanbulWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch('https://wttr.in/Istanbul?format=j1', {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const current = data.current_condition?.[0];
    if (!current) return null;

    const code = current.weatherCode;
    const descTr = current.lang_tr?.[0]?.value || current.weatherDesc?.[0]?.value || '';

    return {
      temp: `${current.temp_C}°C`,
      desc: descTr,
      emoji: WEATHER_CODE_MAP[code] ?? '🌡️',
    };
  } catch {
    return null;
  }
}
