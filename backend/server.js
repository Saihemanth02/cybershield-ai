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

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Lazy Gemini API client initialization
let genAI = null;
function getGenAI() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
    throw new Error("GEMINI_API_KEY is not configured or is using default placeholder. Please configure .env with a valid Google Gemini API key.");
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
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

// ROUTE 1: Dynamic Syllabus Generator (RAG-Driven)
app.post('/api/generate-plan', academyLimiter, validatePlanInput, async (req, res) => {
  try {
    const { name, level, goal, hours, struggle } = req.sanitizedBody;

    // Execute semantic retrieval mapping against knowledge base
    const ragContext = retrieveContext(`${goal} ${struggle}`);

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

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(systemPrompt);
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
      html: planHtml
    });

  } catch (error) {
    console.error("Failed to generate cybersecurity plan:", error);
    res.status(500).json({
      error: "Syllabus Generation Failed",
      message: error.message || "An internal database or API issue occurred. Please check system configurations."
    });
  }
});

// ROUTE 2: Stateless Conversational Assistant (RAG-Driven Chat)
app.post('/api/chat', academyLimiter, validateChatInput, async (req, res) => {
  try {
    const { message, history } = req.sanitizedBody;

    // Extract RAG snippets matching the incoming message context
    const ragContext = retrieveContext(message);

    // Format historical messages for Gemini context
    // The history parameter is an array of { role, message }
    // We map them to the format Gemini expects: { role, parts: [{ text }] }
    // Note: Gemini roles are 'user' and 'model'
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

    const ai = getGenAI();
    // Start a chat session using the history
    const chatModel = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // We prepend the system instructions as a system prompt. In the Gemini SDK, we can pass systemInstruction in configuration
    const chat = chatModel.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 800,
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    });

    const result = await chat.sendMessage(message);
    const replyText = result.response.text().trim();

    res.json({
      success: true,
      reply: replyText
    });

  } catch (error) {
    console.error("Security chatbot session error:", error);
    res.status(500).json({
      error: "Mentor Terminal Failed",
      message: error.message || "An internal routing error disrupted the secure link to the Gemini API."
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
