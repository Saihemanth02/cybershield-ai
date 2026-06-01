
/* ============================================================
   API GATEWAY & CORS CONFIGURATION
   ============================================================ */
const API_BASE = (window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000'))
  ? 'http://localhost:3000'
  : '';

/* ============================================================
   CONTROL CENTER & FALLBACK OPERATION TRACKING
   ============================================================ */
let customApiKey = localStorage.getItem('custom_gemini_api_key') || '';
let lastSyllabusParams = null;
let lastChatParams = null;
let syllabusIsFallback = false;
let chatIsFallback = false;

/* ============================================================
   MATRIX RAIN CANVAS ENGINE
============================================================ */
const matrixCanvas = document.getElementById('matrix-canvas');
const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;

if (matrixCanvas && matrixCtx) {
  // Set dimensions
  const resizeMatrix = () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  };
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix);

  // Matrix characters
  const matrixChars = "0101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&🛡️⚙️⚡".split("");
  const fontSize = 16;
  const columns = Math.floor(matrixCanvas.width / fontSize);

  // Drops positioning
  const drops = Array(columns).fill(1);

  const drawMatrix = () => {
    matrixCtx.fillStyle = 'rgba(2, 4, 8, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    matrixCtx.fillStyle = '#00f0b4';
    matrixCtx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      matrixCtx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };
  setInterval(drawMatrix, 40);
}

/* ============================================================
   PARTICLE ENGINE (FLOATING SECURITY DEBRIS)
============================================================ */
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  const maxParticles = 40;
  for (let i = 0; i < maxParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random sizes, coordinates, and floats
    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * -10;
    const dx = (Math.random() * 120 - 60) + 'px';

    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = startX + '%';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';
    particle.style.setProperty('--dx', dx);

    particlesContainer.appendChild(particle);
  }
}

/* ============================================================
   TOAST SYSTEM
============================================================ */
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMsg = document.getElementById('toast-msg');
let toastTimeout = null;

function showToast(message, icon = '🛡️') {
  if (!toast) return;
  toastIcon.textContent = icon;
  toastMsg.textContent = message;

  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Initial toast on secure loading
window.addEventListener('load', () => {
  setTimeout(() => {
    showToast("CyberShield AI Sandbox Console Online", "🛡️");

    if (window.location.protocol === 'file:') {
      const banner = document.createElement('div');
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.width = '100%';
      banner.style.background = 'rgba(235, 87, 87, 0.95)';
      banner.style.color = '#ffffff';
      banner.style.padding = '12px 24px';
      banner.style.textAlign = 'center';
      banner.style.zIndex = '99999';
      banner.style.fontSize = '14px';
      banner.style.fontWeight = 'bold';
      banner.style.fontFamily = 'sans-serif';
      banner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      banner.innerHTML = '⚠️ CORS SECURITY BLOCK: Browser security blocks local files from sending messages. Please open <a href="http://localhost:3000" style="color: #00ffff; text-decoration: underline; font-weight: bold;">http://localhost:3000</a> in your browser to run the app.';
      
      document.body.appendChild(banner);
      document.body.style.paddingTop = '45px';

      setTimeout(() => {
        showToast("Warning: Local file protocol detected. Please open http://localhost:3000 to avoid API blocks.", "⚠️");
      }, 1500);
    }
  }, 1000);
});

/* ============================================================
   MOBILE INTERACTION NAVIGATION & SCROLL HANDLERS
============================================================ */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.querySelector('.nav-links');
if (hamburger && navLinksContainer) {
  hamburger.addEventListener('click', () => {
    const isActive = navLinksContainer.style.display === 'flex';
    if (isActive) {
      navLinksContainer.style.display = 'none';
    } else {
      navLinksContainer.style.display = 'flex';
      navLinksContainer.style.flexDirection = 'column';
      navLinksContainer.style.position = 'absolute';
      navLinksContainer.style.top = '72px';
      navLinksContainer.style.left = '0';
      navLinksContainer.style.right = '0';
      navLinksContainer.style.background = 'rgba(2, 4, 8, 0.95)';
      navLinksContainer.style.borderBottom = '1px solid var(--border)';
      navLinksContainer.style.padding = '20px 0';
      navLinksContainer.style.gap = '20px';
    }
  });

  // Reset menu layout on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinksContainer.style.display = 'flex';
      navLinksContainer.style.position = 'static';
      navLinksContainer.style.background = 'transparent';
      navLinksContainer.style.borderBottom = 'none';
      navLinksContainer.style.padding = '0';
      navLinksContainer.style.gap = '36px';
    } else {
      navLinksContainer.style.display = 'none';
    }
  });
}

// Reveal elements on scroll
const reveals = document.querySelectorAll('.reveal');
function revealScroll() {
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add('visible');
    }
  }
}
window.addEventListener('scroll', revealScroll);
window.addEventListener('load', revealScroll);

/* ============================================================
   HERO TERMINAL SIMULATOR TYPING EFFECT
============================================================ */
const terminalLines = document.querySelectorAll('#hero-terminal-body .t-line');
if (terminalLines.length > 0) {
  let lineIndex = 0;

  function typeTerminalLines() {
    if (lineIndex < terminalLines.length) {
      const line = terminalLines[lineIndex];
      // Set opacity to 1 through styling since keyframe handles slide-in
      line.style.opacity = '1';
      lineIndex++;
      setTimeout(typeTerminalLines, 800);
    }
  }

  // Trigger sequence delay after loading screen finishes
  setTimeout(typeTerminalLines, 1500);
}

/* ============================================================
   TABS SYSTEMS
============================================================ */
// 1. Academy Syllabus Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const modulePanels = document.querySelectorAll('.module-panel');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    modulePanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-target');
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) targetPanel.classList.add('active');
  });
});

// 2. Setup Target Labs Tabs
const labTabs = document.querySelectorAll('.lab-tab');
const labContents = document.querySelectorAll('.lab-content');
labTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    labTabs.forEach(t => t.classList.remove('active'));
    labContents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    if (targetContent) targetContent.classList.add('active');
  });
});

// Copy CLI Code Utility
function copyCode(button) {
  const codeBlock = button.parentElement;
  // Get text content, filtering out button label
  const lines = Array.from(codeBlock.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BUTTON'))
    .map(node => node.textContent)
    .join('')
    .trim();

  navigator.clipboard.writeText(lines).then(() => {
    button.textContent = "Copied!";
    showToast("Command copied to clipboard buffer.", "✅");
    setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  }).catch(err => {
    console.error("Copy failed:", err);
    showToast("Failed to copy command buffer.", "❌");
  });
}

// CTF Launcher Mock
function startCTF(scenarioName) {
  showToast(`Deploying isolated network for ${scenarioName}...`, "⚙️");
  setTimeout(() => {
    showToast(`Target VM spun up! Sandbox interface live on 192.168.56.25`, "🚀");
  }, 2500);
}

/* ============================================================
   AI CUSTOM SKILLS FORM HOURS SINGLE-SELECTOR
   ============================================================ */
const hourBtns = document.querySelectorAll('.hour-btn');
const hoursInput = document.getElementById('student-hours');

hourBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Single-select behavior: deactivate all other buttons
    hourBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    if (hoursInput) {
      hoursInput.value = btn.getAttribute('data-value');
    }
  });
});

/* ============================================================
   RAG SYLLABUS GENERATOR PIPELINE (POST /api/generate-plan)
============================================================ */
async function generatePlan(params = null) {
  const nameEl = document.getElementById('student-name');
  const levelEl = document.getElementById('student-level');
  const goalEl = document.getElementById('student-goal');
  const hoursEl = document.getElementById('student-hours');
  const struggleEl = document.getElementById('student-struggle');

  if (params) {
    if (nameEl) nameEl.value = params.name;
    if (levelEl) levelEl.value = params.level;
    if (goalEl) goalEl.value = params.goal;
    if (hoursEl) {
      hoursEl.value = params.hours;
      const hourBtns = document.querySelectorAll('.hour-btn');
      hourBtns.forEach(btn => {
        if (btn.getAttribute('data-value') === params.hours) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }
    if (struggleEl) struggleEl.value = params.struggle;
  }

  const errorPanel = document.getElementById('form-error-panel');
  const placeholderState = document.getElementById('placeholder-state');
  const loadingState = document.getElementById('loading-state');
  const resultState = document.getElementById('result-state');
  const resultBody = document.getElementById('result-body');
  const generateSubmitBtn = document.getElementById('generate-submit-btn');

  if (errorPanel) errorPanel.classList.remove('show');

  if (!nameEl || !levelEl || !goalEl || !hoursEl) {
    console.error("Required plan inputs are missing from DOM!");
    if (errorPanel) {
      errorPanel.textContent = "Configuration Error: Required form fields are missing from the document.";
      errorPanel.classList.add('show');
    }
    showToast("Form configuration error.", "❌");
    return;
  }

  const name = nameEl.value.trim();
  const level = levelEl.value.trim();
  const goal = goalEl.value.trim();
  const hours = hoursEl.value.trim();
  const struggle = struggleEl ? struggleEl.value.trim() : '';

  // Client side validation check (struggle is optional)
  if (!name || !level || !goal || !hours) {
    if (errorPanel) {
      errorPanel.textContent = "Validation Failure: Please specify name, skill tier, goal, and study hours commitment.";
      errorPanel.classList.add('show');
    }
    showToast("Form payload is incomplete.", "❌");
    return;
  }

  // Save params for retry capability
  lastSyllabusParams = { name, level, goal, hours, struggle };

  // Orchestrate active state transitions
  if (placeholderState) placeholderState.style.display = 'none';
  if (resultState) resultState.classList.remove('show');
  if (loadingState) loadingState.classList.add('show');
  if (generateSubmitBtn) {
    generateSubmitBtn.disabled = true;
    generateSubmitBtn.innerHTML = "🛡️ Deploying Matrix...";
  }

  try {
    const response = await fetch(`${API_BASE}/api/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
      },
      body: JSON.stringify({ name, level, goal, hours, struggle })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Server returned status HTTP ${response.status}`);
    }

    // Populate response HTML output safely
    if (resultBody) {
      resultBody.innerHTML = data.html;
      
      // If output is fallback, append a retry button
      if (data.isFallback) {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'retry-inline-btn';
        retryBtn.innerHTML = '🔄 Retry with Live AI';
        retryBtn.onclick = () => {
          generatePlan(lastSyllabusParams);
        };
        resultBody.appendChild(retryBtn);
      }
    }

    syllabusIsFallback = !!data.isFallback;
    updateFallbackUI();

    if (loadingState) loadingState.classList.remove('show');
    if (resultState) resultState.classList.add('show');
    
    if (syllabusIsFallback) {
      showToast("Curriculum loaded in Fallback RAG mode.", "⚠️");
    } else {
      showToast("Curriculum compiled successfully via RAG engine.", "✅");
    }

  } catch (error) {
    console.error("AI Syllabus generation error:", error);
    if (loadingState) loadingState.classList.remove('show');
    if (placeholderState) placeholderState.style.display = 'flex';

    if (errorPanel) {
      errorPanel.textContent = `Transmission Error: ${error.message}`;
      errorPanel.classList.add('show');
    }
    showToast("Syllabus generation pipeline failed.", "❌");
    syllabusIsFallback = true;
    updateFallbackUI();
  } finally {
    if (generateSubmitBtn) {
      generateSubmitBtn.disabled = false;
      generateSubmitBtn.innerHTML = "🛡️ Generate My Learning Plan";
    }
  }
}

// Bind form submit event listener
const syllabusForm = document.getElementById('syllabus-form');
if (syllabusForm) {
  syllabusForm.addEventListener('submit', (event) => {
    event.preventDefault();
    generatePlan();
  });
}

// Bind chat event listeners
const chatSendBtn = document.getElementById('chat-send-btn');
if (chatSendBtn) {
  chatSendBtn.addEventListener('click', (event) => {
    event.preventDefault();
    sendChat();
  });
}

const chatInputField = document.getElementById('chat-input-field');
if (chatInputField) {
  chatInputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendChat();
    }
  });
}


/* ============================================================
   CONVERSATIONAL AI CONSOLE (POST /api/chat)
============================================================ */
const activeHistory = []; // Local queue structure for memory buffers

async function sendChat(params = null) {
  try {
    const inputEl = document.getElementById('chat-input-field');
    const containerEl = document.getElementById('chat-messages-container');
    const btnEl = document.getElementById('chat-send-btn');

    if (!inputEl || !containerEl) {
      alert("CyberShield Error: Missing DOM elements. inputEl=" + !!inputEl + ", containerEl=" + !!containerEl);
      return;
    }

    const userMessage = params ? params.message : inputEl.value.trim();
    if (userMessage.length === 0) return;

    // If retrying, remove the last AI message if it was a fallback
    if (params) {
      const messages = containerEl.querySelectorAll('.msg.ai');
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.classList.contains('fallback-bubble')) {
          lastMsg.remove();
        }
      }
    } else {
      // Render User Message bubble
      appendChatBubble('user', userMessage);
      inputEl.value = '';
    }

    lastChatParams = { message: userMessage };

    // Append Typing Indicator node
    const typingIndicator = appendTypingIndicator();
    if (typingIndicator) {
      containerEl.scrollTop = containerEl.scrollHeight;
    }

    // Toggle button state
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = "...";
    }

    try {
      // Send request including memory history buffer
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
        },
        body: JSON.stringify({
          message: userMessage,
          history: activeHistory
        })
      });

      const data = await response.json();

      // Remove typing indicator before appending response
      if (typingIndicator) {
        removeTypingIndicator(typingIndicator);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server returned status HTTP ${response.status}`);
      }

      // Render AI Response bubble
      appendChatBubble('ai', data.reply, data.isFallback);

      chatIsFallback = !!data.isFallback;
      updateFallbackUI();

      if (!chatIsFallback) {
        // Save state transaction inside memory buffers
        activeHistory.push({ role: 'user', message: userMessage });
        activeHistory.push({ role: 'ai', message: data.reply });

        // Limit memory size in client context (keep last 10 messages)
        if (activeHistory.length > 20) {
          activeHistory.splice(0, 2);
        }
      }

    } catch (error) {
      console.error("Mentor Terminal Chat session failed:", error);
      if (typingIndicator) {
        removeTypingIndicator(typingIndicator);
      }

      appendChatBubble('ai', `CONNECTION TERMINATED: ${error.message}. Verify network adapter statuses or configure server local API keys.`, true);
      showToast("Terminal message transmission failed.", "❌");
      chatIsFallback = true;
      updateFallbackUI();
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = "Transmit";
      }
      containerEl.scrollTop = containerEl.scrollHeight;
    }
  } catch (err) {
    alert("sendChat runtime exception: " + err.message + "\nStack: " + err.stack);
    console.error("sendChat crashed:", err);
  }
}

// Chat Helper: Append standard bubbles
function appendChatBubble(role, text, isFallback = false) {
  const containerEl = document.getElementById('chat-messages-container');
  if (!containerEl) {
    console.error("Mentor Terminal Error: 'chat-messages-container' not found.");
    return;
  }

  const bubble = document.createElement('div');
  bubble.className = `msg ${role}`;
  if (role === 'ai' && isFallback) {
    bubble.classList.add('fallback-bubble');
  }

  const label = document.createElement('div');
  label.className = 'msg-label';
  label.textContent = role === 'user' ? 'STUDENT_ADMIN_CONSOLE' : 'SHIELD_MENTOR_DAEMON';

  const bodyText = document.createElement('span');

  // Format basic paragraphs and code markers safely in conversational messages
  if (role === 'ai') {
    // Basic regex conversion for code tags and spacing
    let formattedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
    bodyText.innerHTML = formattedText;
  } else {
    bodyText.textContent = text;
  }

  bubble.appendChild(label);
  bubble.appendChild(bodyText);

  // If fallback AI, append a retry button
  if (role === 'ai' && isFallback) {
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'retry-inline-btn';
    retryBtn.style.display = 'block';
    retryBtn.innerHTML = '🔄 Retry with Live AI';
    retryBtn.onclick = () => {
      sendChat(lastChatParams);
    };
    bubble.appendChild(retryBtn);
  }

  containerEl.appendChild(bubble);
}

// Chat Helper: Append typing animation
function appendTypingIndicator() {
  const containerEl = document.getElementById('chat-messages-container');
  if (!containerEl) {
    console.error("Mentor Terminal Error: 'chat-messages-container' not found.");
    return null;
  }

  const indicator = document.createElement('div');
  indicator.className = 'msg ai typing-wrapper-element';

  const label = document.createElement('div');
  label.className = 'msg-label';
  label.textContent = 'SHIELD_MENTOR_DAEMON';

  const flow = document.createElement('div');
  flow.className = 'typing-indicator';
  flow.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  indicator.appendChild(label);
  indicator.appendChild(flow);
  containerEl.appendChild(indicator);
  return indicator;
}

// Chat Helper: Remove typing animation
function removeTypingIndicator(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/* ============================================================
   CONTROL CENTER SETTINGS & RETRY BINDINGS
============================================================ */
// DOM Elements
const settingsModal = document.getElementById('settings-modal');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const apiKeyInput = document.getElementById('custom-api-key');
const toggleKeyVisibility = document.getElementById('toggle-key-visibility');
const saveKeyBtn = document.getElementById('save-key-btn');
const clearKeyBtn = document.getElementById('clear-key-btn');
const keyStatusIndicator = document.getElementById('key-status-indicator');
const syllabusFallbackStatus = document.getElementById('syllabus-fallback-status');
const chatFallbackStatus = document.getElementById('chat-fallback-status');
const retryAllBtn = document.getElementById('retry-all-btn');

// Init values
if (apiKeyInput) {
  apiKeyInput.value = customApiKey;
}
updateKeyStatusUI();
updateFallbackUI();

// Event Listeners
if (settingsToggleBtn) {
  settingsToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (settingsModal) settingsModal.classList.add('open');
  });
}
if (settingsCloseBtn) {
  settingsCloseBtn.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('open');
  });
}
// Close modal on overlay click
if (settingsModal) {
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('open');
    }
  });
}

// Password/Visibility toggle
if (toggleKeyVisibility && apiKeyInput) {
  toggleKeyVisibility.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleKeyVisibility.textContent = '🔒';
    } else {
      apiKeyInput.type = 'password';
      toggleKeyVisibility.textContent = '👁️';
    }
  });
}

// Save Key
if (saveKeyBtn && apiKeyInput) {
  saveKeyBtn.addEventListener('click', () => {
    const keyVal = apiKeyInput.value.trim();
    if (keyVal.length === 0) {
      showToast("Please enter an API Key or clear it.", "⚠️");
      return;
    }
    customApiKey = keyVal;
    localStorage.setItem('custom_gemini_api_key', customApiKey);
    showToast("API Key saved locally.", "✅");
    updateKeyStatusUI();
  });
}

// Clear Key
if (clearKeyBtn && apiKeyInput) {
  clearKeyBtn.addEventListener('click', () => {
    customApiKey = '';
    apiKeyInput.value = '';
    localStorage.removeItem('custom_gemini_api_key');
    showToast("Custom API Key cleared. Defaulting to system.", "🛡️");
    updateKeyStatusUI();
  });
}

// Helper: update key status in modal
function updateKeyStatusUI() {
  if (!keyStatusIndicator) return;
  if (customApiKey) {
    keyStatusIndicator.innerHTML = '<span class="status-dot green"></span> Custom Gemini Key Active';
  } else {
    keyStatusIndicator.innerHTML = '<span class="status-dot red"></span> Using system default API key';
  }
}

// Helper: update fallback state & retry buttons
function updateFallbackUI() {
  if (syllabusFallbackStatus) {
    if (syllabusIsFallback) {
      syllabusFallbackStatus.innerHTML = '<span>Syllabus Generator:</span> <span class="status-tag fallback-rag">Fallback Mode (Local RAG)</span>';
    } else {
      syllabusFallbackStatus.innerHTML = '<span>Syllabus Generator:</span> <span class="status-tag active-ai">Active AI (Live)</span>';
    }
  }

  if (chatFallbackStatus) {
    if (chatIsFallback) {
      chatFallbackStatus.innerHTML = '<span>Mentor Terminal:</span> <span class="status-tag fallback-rag">Fallback Mode (Local RAG)</span>';
    } else {
      chatFallbackStatus.innerHTML = '<span>Mentor Terminal:</span> <span class="status-tag active-ai">Active AI (Live)</span>';
    }
  }

  if (retryAllBtn) {
    const canRetry = (syllabusIsFallback && lastSyllabusParams) || (chatIsFallback && lastChatParams);
    retryAllBtn.disabled = !canRetry;
  }
}

// Retry All Action
if (retryAllBtn) {
  retryAllBtn.addEventListener('click', async () => {
    if (settingsModal) settingsModal.classList.remove('open');
    showToast("Retrying all failed operations with new key...", "🔄");

    let promises = [];
    if (syllabusIsFallback && lastSyllabusParams) {
      promises.push(generatePlan(lastSyllabusParams));
    }
    if (chatIsFallback && lastChatParams) {
      promises.push(sendChat(lastChatParams));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  });
}

// Expose functions globally to ensure inline HTML event handlers resolve correctly under all execution scopes
window.sendChat = sendChat;
window.generatePlan = generatePlan;
window.copyCode = copyCode;
window.startCTF = startCTF;
