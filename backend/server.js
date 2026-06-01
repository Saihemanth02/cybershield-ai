import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { academyLimiter, validatePlanInput, validateChatInput } from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Security and parser configuration
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "https://*"],
      "img-src": ["'self'", "data:", "https://*"],
    }
  }
}));

app.use(cors());
app.use(express.json());

// Serve static frontend assets with cache disabled headers
const staticOptions = {
  setHeaders: (res, filepath) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};
app.use(express.static(path.join(__dirname, '../frontend'), staticOptions));
app.use('/frontend', express.static(path.join(__dirname, '../frontend'), staticOptions));


// Load RAG Knowledge Base
const kbPath = path.join(__dirname, 'data', 'knowledge_base.json');
let knowledgeBase = { lab_topologies: [], networking_baselines: [], security_tools: [], owasp_top_10: [] };

try {
  if (fs.existsSync(kbPath)) {
    const rawData = fs.readFileSync(kbPath, 'utf8');
    knowledgeBase = JSON.parse(rawData);
    console.log("RAG Knowledge Base initialized successfully.");
  } else {
    console.warn("RAG Knowledge Base file not found at:", kbPath);
  }
} catch (error) {
  console.error("Failed to load knowledge base:", error);
}

// Dynamic Gemini API client initialization
function getGenAI(req) {
  let apiKey = req ? (req.headers['x-gemini-api-key'] || req.headers['x-api-key']) : null;
  if (!apiKey || apiKey.trim() === '') {
    apiKey = process.env.GEMINI_API_KEY;
  }
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
    throw new Error("GEMINI_API_KEY is not configured. Please configure your API key.");
  }
  return new GoogleGenerativeAI(apiKey);
}

// Simple English Stop Words to filter search tokens
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'isnt', 'it', 'its', 'itself', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Deterministic RAG Context Extraction (Keyword Matcher)
function retrieveContext(queryText) {
  if (!queryText) return "No specific context query provided.";

  // Tokenize & sanitize the query
  const tokens = queryText.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) {
    return "CyberShield Academy Standard Guidelines:\n- Keep testing strictly isolated.\n- Implement firewalls between testing segments.";
  }

  const matches = [];

  // 1. Search lab topologies
  knowledgeBase.lab_topologies.forEach(lab => {
    let score = 0;
    const firewallRulesStr = lab.firewall_rules ? lab.firewall_rules.join(' ') : '';
    const textToSearch = `${lab.name} ${lab.description} ${JSON.stringify(lab.network_modes)} ${firewallRulesStr}`.toLowerCase();
    tokens.forEach(token => {
      if (textToSearch.includes(token)) score += 2;
    });
    if (score > 0) {
      const formattedRules = lab.firewall_rules ? lab.firewall_rules.join('\n- ') : 'None configured';
      matches.push({
        score,
        category: "Lab Topology Setup",
        content: `Lab Target System Environment: [${lab.name}]\nDescription: ${lab.description}\nVirtualization Modes: ${JSON.stringify(lab.network_modes)}\nMandatory Firewall Rules:\n- ${formattedRules}`
      });
    }
  });

  // 2. Search networking baselines
  knowledgeBase.networking_baselines.forEach(net => {
    let score = 0;
    const concernsStr = net.security_concerns ? net.security_concerns.join(' ') : '';
    const mitigationsStr = net.mitigations ? net.mitigations.join(' ') : '';
    const practicesStr = net.best_practices ? net.best_practices.join(' ') : '';
    const textToSearch = `${net.protocol} ${net.description} ${concernsStr} ${mitigationsStr} ${practicesStr}`.toLowerCase();
    tokens.forEach(token => {
      if (textToSearch.includes(token)) score += 2.5;
    });
    if (score > 0) {
      const formattedConcerns = net.security_concerns ? net.security_concerns.join(', ') : 'None documented';
      const formattedMitigations = net.mitigations ? net.mitigations.join(', ') : 'None documented';
      const formattedPractices = net.best_practices ? net.best_practices.join('\n- ') : 'None documented';
      matches.push({
        score,
        category: "Network Protocols & Foundations",
        content: `Protocol Baseline: [${net.protocol}]\nDescription: ${net.description}\nSecurity Vectors: ${formattedConcerns}\nMitigations/Defense: ${formattedMitigations}\nBest Practices:\n- ${formattedPractices}`
      });
    }
  });

  // 3. Search security tools
  knowledgeBase.security_tools.forEach(tool => {
    let score = 0;
    const commandStrings = tool.commands ? tool.commands.map(c => `${c.syntax} ${c.explanation}`).join(' ') : "";
    const textToSearch = `${tool.name} ${tool.category} ${tool.description} ${commandStrings}`.toLowerCase();
    tokens.forEach(token => {
      if (textToSearch.includes(token)) score += 3;
    });
    if (score > 0) {
      const commandDetails = tool.commands ? tool.commands.map(c => `  Syntax: ${c.syntax}\n  Explanations: ${c.explanation}`).join('\n') : "";
      matches.push({
        score,
        category: "Tools & Scripting Syntax",
        content: `Security Utility: [${tool.name}] (${tool.category})\nDescription: ${tool.description}\nKey Practical Commands:\n${commandDetails}`
      });
    }
  });

  // 4. Search OWASP top 10
  knowledgeBase.owasp_top_10.forEach(vuln => {
    let score = 0;
    const mappingStrings = vuln.mitre_attack_mappings ? vuln.mitre_attack_mappings.map(m => `${m.id} ${m.tactic} ${m.technique}`).join(' ') : "";
    const textToSearch = `${vuln.id} ${vuln.name} ${vuln.description} ${mappingStrings} ${vuln.mitigations.join(' ')}`.toLowerCase();
    tokens.forEach(token => {
      if (textToSearch.includes(token)) score += 3.5;
    });
    if (score > 0) {
      const mitigations = vuln.mitigations.join('\n- ');
      const mappings = vuln.mitre_attack_mappings ? vuln.mitre_attack_mappings.map(m => `  - MITRE ID: ${m.id} (Tactic: ${m.tactic}, Technique: ${m.technique})`).join('\n') : "";
      matches.push({
        score,
        category: "OWASP Vulnerabilities & MITRE ATT&CK Maps",
        content: `Vulnerability Segment: [${vuln.id}: ${vuln.name}]\nDescription: ${vuln.description}\nATT&CK Mappings:\n${mappings}\nRemediation Strategy:\n- ${mitigations}`
      });
    }
  });

  // Sort matched entries by relevance score
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return "CyberShield Academy Standard Guidelines:\n- Keep testing strictly isolated using host-only setups.\n- Limit external DNS and package traversal.\n- Use parameterized interfaces and input whitelists.";
  }

  // Compile top 3 matches into a structured block
  return matches.slice(0, 3).map(m => `[${m.category}] Context:\n${m.content}`).join('\n\n========================\n\n');
}

// Helper for API Call Retries in case of transient/quota errors (500, 503, 429, etc.)
async function generateContentWithRetry(model, prompt, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      const errMsg = error.message || '';
      const isTransient = errMsg.includes('503') || errMsg.includes('500') || errMsg.includes('Service Unavailable') || errMsg.includes('Overloaded') || errMsg.includes('exhausted') || errMsg.includes('429');
      if (isTransient && i < retries) {
        console.warn(`Transient Gemini API error encountered (${errMsg.substring(0, 150)}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
}

async function sendMessageWithRetry(chat, message, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await chat.sendMessage(message);
      return result;
    } catch (error) {
      const errMsg = error.message || '';
      const isTransient = errMsg.includes('503') || errMsg.includes('500') || errMsg.includes('Service Unavailable') || errMsg.includes('Overloaded') || errMsg.includes('exhausted') || errMsg.includes('429');
      if (isTransient && i < retries) {
        console.warn(`Transient Gemini API error encountered (${errMsg.substring(0, 150)}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
}

// ROUTE 1: Dynamic Syllabus Generator (RAG-Driven)
app.post('/api/generate-plan', academyLimiter, validatePlanInput, async (req, res) => {
  const { name, level, goal, hours, struggle } = req.sanitizedBody;
  const ragContext = retrieveContext(`${goal} ${struggle}`);

  try {
    const systemPrompt = `You are a Principal AI Systems Architect and Elite Cybersecurity Syllabus Planner at CyberShield AI (Brand: S.S.Hemanth Kumar).
Your job is to generate a highly detailed, professional study roadmap for:
- Student Name: ${name}
- Current Skill Level: ${level}
- Target Cyber Objective: ${goal}
- Study Commitment: ${hours} hours/week
- Current Struggle: ${struggle}

Relevant context extracted from the local knowledge base (integrate details below where appropriate):
${ragContext}

System Instructions & Output Requirements:
1. You MUST output the response in raw, clean, sanitized HTML semantic blocks ONLY.
2. The HTML must ONLY contain the following tag signatures: <h3>, <p>, <ul>, <li>, <strong>, <code>, <em>.
3. Absolutely NO markdown block formatting is allowed (e.g., do NOT start with \`\`\`html or end with \`\`\`).
4. Keep the instruction quality elite. Ensure exact network parameters, command executions, VM specifications, and subnets are listed in <code> wrappers.
5. Create sections covering:
   - <h3>Overview of Custom Roadmap</h3>: Summarize the path name and skill profile.
   - <h3>Target Isolated Lab Design</h3>: Design concrete network architectures (VirtualBox setups, pfSense dual-NIC details, subnet mappings) based on the local knowledge base specs.
   - <h3>Weekly Structured Milestones</h3>: Weekly targets dividing study hours into theory, labs, and tools.
   - <h3>Tool Practice Exercises</h3>: Practical execution scripts (e.g., Nmap parameters, Burp configuration, Metasploit parameters) matching the skill level.
   - <h3>MITRE ATT&CK Mitigation Matrix</h3>: Mitigation mappings to defend against the vulnerabilities mentioned in the goals.`;

    const ai = getGenAI(req);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await generateContentWithRetry(model, systemPrompt);
    let planHtml = result.response.text().trim();

    // Secondary sanitization to strip any markdown code block wrappers if generated
    if (planHtml.startsWith('```html')) {
      planHtml = planHtml.substring(7);
    } else if (planHtml.startsWith('```')) {
      planHtml = planHtml.substring(3);
    }
    if (planHtml.endsWith('```')) {
      planHtml = planHtml.substring(0, planHtml.length - 3);
    }
    planHtml = planHtml.trim();

    res.json({
      success: true,
      name,
      level,
      goal,
      html: planHtml,
      isFallback: false
    });

  } catch (error) {
    console.warn("Failing over to dynamic RAG mock generation due to Gemini API issue:", error.message);
    
    // Generate beautiful mock plan locally based on the actual inputs and RAG context
    const cleanRagContext = ragContext
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const fallbackHtml = `
      <div style="background: rgba(240, 180, 0, 0.1); border: 1px solid #f0b400; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9em; color: #f0b400; font-family: sans-serif;">
        <strong>⚠️ DEMO FALLBACK MODE ACTIVE:</strong> Your Google Gemini API Key is missing, incorrect, or has exceeded its rate limit quota. We have compiled your curriculum locally using the Academy RAG Database context instead.
      </div>
      <h3>Overview of Custom Roadmap</h3>
      <p>Welcome, <strong>${name}</strong>. Here is your customized study matrix to achieve your objective of becoming a <strong>${goal}</strong> starting from your current level (<em>${level}</em>). Study commitment: <strong>${hours}</strong> per week.</p>
      
      <h3>Target Isolated Lab Design</h3>
      <p>Configure a dual-NIC network topology in VirtualBox to practice safety audits locally:</p>
      <ul>
        <li>Host-Only Interface: Name it <code>vboxnet0</code>, static IPv4 <code>192.168.56.1</code>, subnet mask <code>255.255.255.0</code>. Ensure DHCP server is disabled.</li>
        <li>Kali Linux VM: Configure Adapter 1 as NAT, and Adapter 2 as Host-Only.</li>
        <li>Metasploitable/Juice Shop VM: Bind interface strictly to Host-Only adapter at <code>192.168.56.10</code>.</li>
      </ul>

      <h3>Weekly Structured Milestones</h3>
      <p>Following your <strong>${hours}</strong> weekly plan, divide your sessions:</p>
      <ul>
        <li><strong>Milestone 1 (40% time):</strong> Rehearse passive and active scanning with <code>nmap</code>, filtering live host-only assets.</li>
        <li><strong>Milestone 2 (30% time):</strong> Configure local intercept rules via Burp Suite and capture parameter requests.</li>
        <li><strong>Milestone 3 (30% time):</strong> Secure ssh key exchange mechanics and deploy host firewalls.</li>
      </ul>

      <h3>Tool Practice Exercises</h3>
      <p>Audit and execute these commands inside your isolated lab vector:</p>
      <ul>
        <li>Stealth Recon: <code>nmap -sS -sV -p 21,22,80,3000 192.168.56.0/24</code></li>
        <li>Juice Shop Target URL: <code>http://192.168.56.10:3000</code></li>
        <li>Verify Kali Interfaces: <code>ip addr show eth1</code></li>
      </ul>

      <h3>RAG Database Details Injected</h3>
      <p>The local knowledge base returned these details for your objective:</p>
      <pre style="background: rgba(2, 4, 8, 0.5); border: 1px solid var(--border); padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.85em; overflow-x: auto; white-space: pre-wrap; margin-top: 10px; color: var(--text);">${cleanRagContext}</pre>
    `;

    res.json({
      success: true,
      name,
      level,
      goal,
      html: fallbackHtml,
      isFallback: true
    });
  }
});

// ROUTE 2: Stateless Conversational Assistant (RAG-Driven Chat)
app.post('/api/chat', academyLimiter, validateChatInput, async (req, res) => {
  const { message, history } = req.sanitizedBody;
  const ragContext = retrieveContext(message);

  try {
    const geminiHistory = history.map(h => ({
      role: h.role === 'ai' ? 'model' : h.role, // normalize AI role names if any
      parts: [{ text: h.message }]
    }));

    const systemInstruction = `You are the CyberShield AI Academy Security Mentor (Brand: S.S.Hemanth Kumar) — a world-class Principal Security Consultant, Elite Penetration Tester, and security researcher.
You are instructing a student inside our local practice lab console.

Academy Knowledge Base context references:
${ragContext}

Instructions:
1. Act strictly as a world-class security consultant and mentor. Keep responses professional, authoritative, and helpful.
2. Keep feedback highly concise, precise, practical, and heavily oriented around structural technical facts (including exact command-line syntax and explicit config parameters).
3. Do NOT mention that you are an AI, Gemini, or a large language model.
4. If the retrieved context references are relevant, prioritize incorporating them into your answers (like exact nmap syntaxes, subnet designs, or vulnerability mitigations).
5. Always wrap commands, paths, and config directives in HTML <code> tags.`;

    const ai = getGenAI(req);
    const chatModel = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const chat = chatModel.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 800,
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    });

    const result = await sendMessageWithRetry(chat, message);
    const replyText = result.response.text().trim();

    res.json({
      success: true,
      reply: replyText,
      isFallback: false
    });

  } catch (error) {
    console.warn("Failing over to local RAG mock chatbot response due to Gemini API issue:", error.message);

    let reply = `⚠️ [DEMO FALLBACK ACTIVE - GEMINI API RATE-LIMITED]\n\nMy secure connection to the live Gemini AI engine is currently unavailable or has exceeded its daily free quota.\n\nHere is information retrieved from the local Academy database matching your request:\n\n`;
    
    if (ragContext && !ragContext.includes("CyberShield Academy Standard Guidelines")) {
      // Clean and format RAG context
      const formattedRag = ragContext
        .replace(/\[/g, '`[')
        .replace(/\]/g, ']`')
        .replace(/Syntax: /g, 'Syntax: `')
        .replace(/\n  Explanations:/g, '`\n  Explanation:')
        .replace(/Protocol Baseline:/g, '\nProtocol Baseline:')
        .replace(/Security Utility:/g, '\nSecurity Utility:')
        .replace(/Vulnerability Segment:/g, '\nVulnerability Segment:');
      
      reply += formattedRag;
    } else {
      reply += `Please configure a valid <code>GEMINI_API_KEY</code> in the backend <code>.env</code> file or wait for the quota window to reset.\n\nIn the meantime, feel free to ask about standard VirtualBox host-only setups, Kali Linux integrations, or Nmap syntax.`;
    }

    res.json({
      success: true,
      reply: reply,
      isFallback: true
    });
  }
});

// Fallback serving index.html for single page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Express Listener
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`CyberShield AI [Platform Security Console] Online                `);
    console.log(`Brand Authority: S.S.Hemanth Kumar                             `);
    console.log(`Port Allocation: ${PORT}                                       `);
    console.log(`API Gateways: http://localhost:${PORT}                          `);
    console.log(`================================================================`);
  });
}

export default app;
