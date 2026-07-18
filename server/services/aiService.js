const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API Client
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
  }
}

/**
 * Helper to call Gemini model.
 * Falls back to mock responses if GEMINI_API_KEY is not defined.
 */
const generateContentHelper = async (prompt, systemInstruction = '', mockResponse = '') => {
  if (model) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
        },
      });
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini API call failed, using fallback mock response:', error);
      return mockResponse || `[AI Mock Response due to API Error]: ${error.message}`;
    }
  } else {
    // Return realistic mock response if API Key is not set yet
    return `${mockResponse}`;
  }
};

/**
 * 1. AI Navigation & Wayfinding + Translation Assistant
 * Translates and explains pathfinding step-by-step in the user's language.
 */
const generateWayfindingDirections = async (query, pathData, langPreference = 'en') => {
  // If pathData is null, let Gemini know we couldn't find a direct route
  if (!pathData) {
    const prompt = `
      The user is at a FIFA 2026 World Cup stadium and asked: "${query}".
      We ran our pathfinding graph and found NO direct route matching their request.
      
      Instructions:
      - Reply politely.
      - Detect the language of their query and respond in it.
      - Suggest they look for visual signage or locate a Venue Staff member in high-visibility jackets for assistance.
      - Keep it short, helpful, and under 80 words.
    `;
    const mock = `We're sorry, we couldn't calculate a direct route matching your query. Please look for stadium signposts or speak to the nearest Venue Staff member in a yellow jacket for assistance.`;
    return await generateContentHelper(prompt, '', mock);
  }

  const { path, directions, totalDistance, accessibleOnly } = pathData;
  const pathStepsStr = directions.map((d, i) => `${i + 1}. ${d.instruction} (takes approx. ${d.weight} seconds)`).join('\n');
  const accessibleModeStr = accessibleOnly ? "accessible (step-free, elevator/ramp only)" : "standard (may contain stairs)";

  const prompt = `
    You are StadiumPulse, the AI Concierge for the FIFA World Cup 2026.
    The fan is asking for directions at the stadium: "${query}".
    We have computed the shortest path using a graph pathfinding algorithm:
    - Path taken: ${path.join(' -> ')}
    - Route type: ${accessibleModeStr}
    - Total estimated walking duration: ${totalDistance} seconds
    - Step-by-step path details:
    ${pathStepsStr}

    Your tasks:
    1. Auto-detect the language of the fan's query (support English, Spanish, French, Arabic, etc.).
    2. Respond to the directions strictly in the fan's query language.
    3. Synthesize the raw steps into natural-sounding, descriptive navigation guidelines. Do not repeat raw node names if they sound robotic; make it pleasant.
    4. Highlight if the path is fully step-free, especially if they requested accessibility.
    5. Keep it friendly and concise (max 150 words).
  `;

  // Pre-translated realistic mock responses for local testing / fallbacks
  let mock = '';
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('donde') || lowerQuery.includes('baño') || lowerQuery.includes('puerta') || lowerQuery.includes('asiento')) {
    mock = `¡Bienvenido a StadiumPulse! Basándonos en tu ubicación actual, hemos calculado tu ruta paso a paso (${accessibleModeStr}):\n\n` +
           directions.map((d, i) => `${i + 1}. ${d.instruction.replace('Walk', 'Camina').replace('Take', 'Toma').replace('Go', 'Ve').replace('straight', 'recto')}`).join('\n') +
           `\n\nTiempo estimado de caminata: ${Math.round(totalDistance / 60)} minutos. ¡Disfruta el partido de la Copa Mundial!`;
  } else if (lowerQuery.includes('ou') || lowerQuery.includes('toilette') || lowerQuery.includes('porte') || lowerQuery.includes('siège')) {
    mock = `Bienvenue sur StadiumPulse ! Voici votre itinéraire (${accessibleModeStr}) :\n\n` +
           directions.map((d, i) => `${i + 1}. ${d.instruction.replace('Walk', 'Marchez').replace('Take', 'Prenez').replace('Go', 'Allez').replace('straight', 'tout droit')}`).join('\n') +
           `\n\nTemps de marche estimé : ${Math.round(totalDistance / 60)} minutes. Bon match !`;
  } else if (lowerQuery.includes('اين') || lowerQuery.includes('حمام') || lowerQuery.includes('بوابة') || lowerQuery.includes('مقعد')) {
    mock = `مرحباً بك في StadiumPulse! إليك اتجاهاتك المخصصة (${accessibleModeStr}):\n\n` +
           `1. ابدأ من ${path[0]} وسر باتجاه ${path[1]}.\n` +
           `2. واصل السير إلى وجهتك النهائية ${path[path.length - 1]}.\n\n` +
           `الوقت المقدر للوصول: ${Math.round(totalDistance / 60)} دقيقة. نتمنى لك وقتاً ممتعاً!`;
  } else {
    mock = `Welcome to StadiumPulse! Based on your location, here is your path (${accessibleModeStr}):\n\n` +
           directions.map((d, i) => `${i + 1}. ${d.instruction} (${d.weight}s)`).join('\n') +
           `\n\nTotal walking time: about ${Math.round(totalDistance / 60)} min. Enjoy the FIFA World Cup 2026!`;
  }

  return await generateContentHelper(prompt, '', mock);
};

/**
 * 2. Crowd Management & Predictive Alerts
 * Generates an operational bulletin and alerts based on zone densities.
 */
const generateCrowdSummary = async (zoneData) => {
  const zonesStr = zoneData.map(z => `- Zone: ${z.name}, Type: ${z.type}, Capacity: ${z.capacity}, Occupancy: ${z.currentOccupancy} (${z.density.toFixed(1)}% full)`).join('\n');

  const prompt = `
    You are the GenAI Operations Commander for FIFA 2026.
    Here is the simulated live crowd density feed for the stadium zones:
    ${zonesStr}

    Your tasks:
    1. Analyze which zones are at critical capacity (specifically any zone above 85% occupancy).
    2. Write a clear, concise operational bulletin (bullet points, max 120 words).
    3. Include specific actionable remediation steps (e.g. "Zone A is at 92% capacity - direct incoming fans to Gate 2 instead").
    4. Keep the tone professional, urgent, and focused.
  `;

  // Find heavy zones for mock fallback
  const hotZones = zoneData.filter(z => z.density >= 85);
  let mock = '';
  if (hotZones.length > 0) {
    mock = `⚠️ CROWD OPERATIONS BULLETIN:\n` +
           hotZones.map(hz => `- ${hz.name} (${hz.type}) is at ${hz.density.toFixed(1)}% capacity. Action: Recommend routing incoming queues to adjacent zones/gates immediately to prevent bottlenecks.`).join('\n') +
           `\n- Remaining stadium zones are operating within safe bounds (under 60% capacity). Maintain standard monitoring.`;
  } else {
    mock = `✅ CROWD OPERATIONS BULLETIN:\n- All zones currently operating within normal parameters (under 65% capacity).\n- Flow is steady at all entrance gates. No queue re-routing needed at this time.`;
  }

  return await generateContentHelper(prompt, '', mock);
};

/**
 * 3. Volunteer Operational Copilot (RAG)
 * Answers volunteer questions against a matched protocol document.
 */
const generateVolunteerProtocol = async (query, matchedProtocol) => {
  if (!matchedProtocol) {
    const prompt = `
      A volunteer at the FIFA 2026 stadium asked: "${query}".
      We found no matching guidelines in our database.
      
      Write a helpful response stating that this query is outside the standard protocol logs, and advice them to contact the Section Supervisor immediately via radio Channel 1.
    `;
    const mock = `I couldn't find a specific protocol for "${query}". Please contact the Section Supervisor immediately via radio Channel 1.`;
    return await generateContentHelper(prompt, '', mock);
  }

  const prompt = `
    You are the Volunteer Copilot for FIFA 2026.
    A volunteer asked: "${query}".
    We matched this query to the following official stadium protocol:
    - Topic: ${matchedProtocol.topic}
    - Role Scope: ${matchedProtocol.role}
    - Official Directives:
    ${matchedProtocol.description}

    Your tasks:
    1. Explain step-by-step how the volunteer should act based ONLY on the provided directives.
    2. Synthesize the advice so it is quick to read on a mobile phone (bullet points, max 120 words).
    3. Highlight critical safety tasks or contacts (like calling medical/security).
    4. Maintain a supportive and direct tone.
  `;

  const mock = `📋 PROTOCOL SUMMARY: **${matchedProtocol.topic}**\n\n` +
               matchedProtocol.description.split('\n').map(line => `• ${line}`).join('\n') +
               `\n\n*Emergency Contact: Dial 911 on stadium line or contact Supervisor on radio Channel 1.*`;

  return await generateContentHelper(prompt, '', mock);
};

/**
 * 4. Sustainability Insights
 * Generates energy/waste recommendations.
 */
const generateSustainabilitySummary = async (sustainabilityData) => {
  if (!sustainabilityData) {
    return "No sustainability logs available today.";
  }

  const prompt = `
    You are the Green Stadium Consultant for FIFA 2026.
    Here are the logs for today's environmental metrics:
    - Energy Consumed: ${sustainabilityData.energyUsageKwh} kWh
    - Water Consumed: ${sustainabilityData.waterUsageLitres} Litres
    - Trash/Waste Generated: ${sustainabilityData.wasteGeneratedKg} kg
    - Recycling Rate: ${sustainabilityData.recyclingRatePercent}%

    Write a 3-bullet insight checklist detailing:
    1. A summary of today's footprint.
    2. Actionable tips (e.g. "Encourage refill stations near Gate 2 to reduce plastic waste").
    3. Keep it optimistic and concise (max 100 words).
  `;

  const mock = `🌱 GREEN STADIUM INSIGHTS:\n` +
               `• Today's recycling rate is at ${sustainabilityData.recyclingRatePercent}%, with ${sustainabilityData.wasteGeneratedKg} kg of waste produced.\n` +
               `• Action: Promote eco-refill water stations in West Concourse to lower single-use plastic loads.\n` +
               `• Energy conservation tip: Implement smart lighting schedules in VIP lounges post-match to reduce idle load.`;

  return await generateContentHelper(prompt, '', mock);
};

module.exports = {
  generateWayfindingDirections,
  generateCrowdSummary,
  generateVolunteerProtocol,
  generateSustainabilitySummary
};
