// Pressroom Conditions widget - OpenWeatherMap free API.
// 1) Create a free key at https://openweathermap.org/api
// 2) Paste it below (free-tier keys are visible in browser code; that is a known limitation on static hosting).
const OWM_KEY = "d7afed6edf13bf25eb462319e15c7c19";

function inkAdvice(temp, humidity) {
  if (humidity > 70) return "Damp air: ink dries slowly. Use drying racks with space between sheets.";
  if (humidity < 30) return "Very dry: paper may curl and ink skins fast. Re-roll the slab often.";
  if (temp > 32) return "Hot room: ink gets slack. Use a stiffer body or add less extender.";
  if (temp < 15) return "Cold room: ink turns stiff. Warm the slab and rollers first.";
  return "Ideal conditions for a clean pull.";
}

async function loadConditions(city) {
  const out = document.getElementById("pw-result");
  out.textContent = "Checking the pressroom air...";
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OWM_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status === 401 ? "Invalid API key" : "City not found");
    const d = await res.json();
    out.replaceChildren();
    const rows = [
      `${d.name}: ${Math.round(d.main.temp)}°C, ${d.weather[0].description}`,
      `Humidity: ${d.main.humidity}%`,
      inkAdvice(d.main.temp, d.main.humidity),
    ];
    for (const r of rows) { const p = document.createElement("p"); p.textContent = r; out.appendChild(p); }
  } catch (e) {
    out.textContent = "Could not load conditions: " + e.message;
  }
}

document.getElementById("pw-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  loadConditions(document.getElementById("pw-city").value.trim());
});
