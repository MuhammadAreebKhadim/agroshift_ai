import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "allam-2-7b",
];

const BASE_SYSTEM_PROMPT = `You are AgriAI Advisor, the precision agricultural AI assistant for AgroShift AI.
You are grounded in NASA POWER Earth Observations, FAO-56 crop irrigation standards, and Pakistan Agricultural Research Council (PARC) regional practices.

Guidelines:
1. Provide personalized, highly actionable agronomic guidance for ANY question the farmer asks.
2. If the farm has registered fields (e.g. Field 1, Field 2, Field 3), refer directly to the user's specific fields, acreages, crops, soil types, and pH levels.
3. Cover crop selection (13 crops: Wheat, Sugarcane, Cotton, Rice, Maize, Chickpea, Berseem, Lentils, Sorghum, Pearl Millet, Soybean, Mustard, Mung Bean), multi-season succession (2026 -> 2027 -> 2028), fertilizer rates (DAP basal, Urea splits), pest/disease prevention, weed management, and water budgeting.
4. Maintain a clear, professional, practical tone with bold headings and bullet points. Never be limited to predefined questions; answer open-ended queries directly.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.message || body.question || "";
    const farmContext = body.farm_context || body.context || {};
    const simContext = body.simulation_context || {};

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Build context summary
    const farm = farmContext.farm || farmContext;
    const farmName = farm.name || "Farm";
    const locName = farm.location_name || "Faisalabad, Punjab";
    const lat = farm.latitude || 31.4504;
    const lon = farm.longitude || 73.135;
    const totalArea = farm.area || 30.0;
    const soilType = farm.soil_type || "Loamy";
    const soilPh = farm.soil_ph || 7.5;
    const currentCrop = farm.current_crop || "Wheat";
    const irrig = farm.irrigation_type || "Canal / Groundwater";
    const priority = farm.priority || "Soil Health";

    let contextStr = `FARM OVERVIEW:\n• Farm: ${farmName}\n• Location: ${locName} (${Number(lat).toFixed(4)}°N, ${Number(lon).toFixed(4)}°E)\n• Total Area: ${totalArea} Acres\n• Base Crop: ${currentCrop} | Priority: ${priority}\n• Soil: ${soilType} (pH ${soilPh}) | Irrigation: ${irrig}\n`;

    const fields = farm.fields || farmContext.fields;
    if (fields && Array.isArray(fields) && fields.length > 0) {
      contextStr += `\nREGISTERED FIELD PARCELS:\n`;
      fields.forEach((f: any, idx: number) => {
        const fid = f.id || `Field ${idx + 1}`;
        const acres = f.acres || f.area || 10;
        const c = f.crop || f.y2026 || currentCrop;
        const s = f.soil || soilType;
        const ph = f.ph || soilPh;
        contextStr += `  - [${fid}]: ${acres} Acres | Crop: ${c} | Soil: ${s} (pH ${ph})\n`;
      });
    }

    const nasa = farmContext.nasa;
    if (nasa) {
      contextStr += `\nNASA POWER SATELLITE CLIMATOLOGY:\n• Mean Temp: ${nasa.temp_mean || 25.1}°C\n• Annual Rain: ${nasa.rain_annual || 422.7} mm\n• Solar: ${nasa.solar_mean || 17.5} MJ/m²/day\n• Max Dry Streak: ${nasa.dry_streak || 79} Days\n`;
    }

    if (simContext && Object.keys(simContext).length > 0) {
      contextStr += `\nCLIMATE SIMULATION RESULTS:\n${JSON.stringify(simContext, null, 2)}\n`;
    }

    const systemInstruction = `${BASE_SYSTEM_PROMPT}\n\nCURRENT FARM CONTEXT:\n${contextStr}`;

    // Call Groq API
    let answer = "";
    for (const model of GROQ_MODELS) {
      try {
        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 1000,
          }),
        });

        if (groqResp.ok) {
          const data = await groqResp.json();
          answer = data.choices?.[0]?.message?.content?.trim();
          if (answer) break;
        }
      } catch (e) {
        console.warn(`Groq model ${model} failed, trying fallback:`, e);
      }
    }

    // Dynamic agronomic fallback if Groq offline
    if (!answer) {
      const p = prompt.toLowerCase();
      let fieldMention = "";
      if (p.includes("field 1")) {
        fieldMention = `<strong>For Field 1 (10 Acres, Wheat, pH 7.5):</strong> Rotate with nitrogen-fixing Chickpea or Mung Bean in 2027 to rebuild residual nitrogen.<br><br>`;
      } else if (p.includes("field 2")) {
        fieldMention = `<strong>For Field 2 (10 Acres, Cotton):</strong> Follow cotton harvest with Rabi Wheat or Berseem Clover to break bollworm cycles.<br><br>`;
      } else if (p.includes("field 3")) {
        fieldMention = `<strong>For Field 3 (10 Acres, Sugarcane):</strong> Sugarcane is a heavy nitrogen and water consumer; follow ratoon crop with Berseem clover green manure.<br><br>`;
      }

      if (p.includes("fertilizer") || p.includes("dap") || p.includes("urea")) {
        answer = `${fieldMention}<strong>Fertilizer Schedule (PARC/FAO-56 Standard):</strong><br>• <strong>Basal DAP:</strong> 1.5 bags DAP/acre applied at seed drill depth during sowing.<br>• <strong>Split Urea:</strong> 2.0 bags Urea/acre split into 1st irrigation (CRI stage) and 2nd irrigation (tillering).<br>• <strong>Legume Credit:</strong> Deduct 25% urea after chickpea or berseem harvest.`;
      } else if (p.includes("sugarcane")) {
        answer = `${fieldMention}<strong>Sugarcane Water & Agronomic Viability:</strong><br>• Sugarcane demands 1,400–1,800 mm water. Under limited canal water, consider furrow irrigation with trash mulching to save 20–25% water. Rotate after 2 ratoons with Berseem to restore soil organic matter.`;
      } else {
        answer = `${fieldMention}<strong>AgriAI Agronomic Assessment:</strong><br>• <strong>Crop Succession:</strong> Based on your farm's location (${locName}) and annual rainfall, alternating cereal crops (Wheat, Maize) with taproot pulses (Chickpea, Mung Bean) maximizes water-use efficiency (WUE) and avoids monoculture soil exhaustion.`;
      }
    }

    return NextResponse.json({
      prompt: prompt,
      response: answer,
      reply: answer,
      provider: "AgriAI Advisor",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Assistant error" }, { status: 500 });
  }
}
