import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

const MODEL = 'gemini-2.0-flash';

// Chatbot: mekan listesiyle birlikte soru yanıtla
export async function askChatBot(message: string, placesContext: string): Promise<string> {
  if (!API_KEY) return 'Gemini API anahtarı tanımlı değil. Lütfen .env dosyasına GEMINI_API_KEY ekleyin.';

  const prompt = `Sen KültürRota'nın AI asistanısın. İstanbul'daki müze ve kütüphaneler hakkında rehberlik yapıyorsun.

Mevcut mekan veritabanı (CSV formatında):
${placesContext}

Kullanıcı sorusu: "${message}"

Kurallar:
- Kısa ve yardımcı Türkçe cevap ver (max 3 paragraf)
- Mekan öneri yapıyorsan adres ve saatleri dahil et
- Veri tabanında olmayan mekanlar hakkında tahmin yürütme
- Samimi ve enerjik bir dil kullan`;

  try {
    const result = await getAI().models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.text ?? 'Cevap alınamadı.';
  } catch (err: any) {
    return `Hata: ${err?.message ?? 'Bilinmeyen hata'}`;
  }
}

// Belirli bir mekan hakkında AI özeti
export async function getPlaceSummary(placeName: string, details: string): Promise<string> {
  if (!API_KEY) return 'Gemini API anahtarı tanımlı değil.';

  const prompt = `"${placeName}" hakkında kısa ama büyüleyici bir Türkçe tanıtım yaz.
Bilinen detaylar: ${details}

3-4 cümle yaz. Tarihi, mimari özelliği veya ilginç bir bilgi dahil et. Ziyaretçiyi heyecanlandır.`;

  try {
    const result = await getAI().models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.text ?? 'Özet alınamadı.';
  } catch {
    return 'AI özeti şu an kullanılamıyor.';
  }
}

// Rota planlayıcı
export async function planRoute(mekanlar: string[], placesContext: string): Promise<string> {
  if (!API_KEY) return 'Gemini API anahtarı tanımlı değil.';

  const prompt = `İstanbul kültür rehberi olarak şu mekanları içeren optimal bir günlük rota planla:
${mekanlar.join(', ')}

Mekan bilgileri:
${placesContext}

Kurallar:
- Coğrafi yakınlığa göre sırala
- Her mekan için tahmini ziyaret süresi ver
- İlçeden ilçeye geçişi minimize et
- Öğle molası için uygun bir zaman öner
- Formatı madde madde yaz`;

  try {
    const result = await getAI().models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.text ?? 'Rota oluşturulamadı.';
  } catch {
    return 'Rota planlayıcı şu an kullanılamıyor.';
  }
}
