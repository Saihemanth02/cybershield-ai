/* ============================================================
   API GATEWAY & CORS CONFIGURATION
   ============================================================ */
const API_BASE = (window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000'))
  ? 'http://localhost:3000'
  : '';

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
      setTimeout(() => {
        showToast("Warning: Local file protocol detected. Please open http://localhost:3000 to avoid API blocks.", "⚠️");
      }, 1500);
    }
  }, 1000);
});

/* ============================================================
   MOBILE INTERACTION NAVIGATION & SCROLL HANDLERS
============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
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
async function generatePlan() {
  const name = document.getElementById('student-name').value;
  const level = document.getElementById('student-level').value;
  const goal = document.getElementById('student-goal').value;
  const hours = document.getElementById('student-hours').value;
  const struggle = document.getElementById('student-struggle').value;

  const errorPanel = document.getElementById('form-error-panel');
  const placeholderState = document.getElementById('placeholder-state');
  const loadingState = document.getElementById('loading-state');
  const resultState = document.getElementById('result-state');
  const resultBody = document.getElementById('result-body');
  const generateSubmitBtn = document.getElementById('generate-submit-btn');

  if (errorPanel) errorPanel.classList.remove('show');

  // Client side validation check (struggle is optional)
  if (!name || !level || !goal || !hours) {
    if (errorPanel) {
      errorPanel.textContent = "Validation Failure: Please specify name, skill tier, goal, and study hours commitment.";
      errorPanel.classList.add('show');
    }
    showToast("Form payload is incomplete.", "❌");
    return;
  }

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
        'Content-Type': 'application/json'
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
    }

    if (loadingState) loadingState.classList.remove('show');
    if (resultState) resultState.classList.add('show');
    showToast("Curriculum compiled successfully via RAG engine.", "✅");

  } catch (error) {
    console.error("AI Syllabus generation error:", error);
    if (loadingState) loadingState.classList.remove('show');
    if (placeholderState) placeholderState.style.display = 'flex';
    
    if (errorPanel) {
      errorPanel.textContent = `Transmission Error: ${error.message}`;
      errorPanel.classList.add('show');
    }
    showToast("Syllabus generation pipeline failed.", "❌");
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

/* ============================================================
   CONVERSATIONAL AI CONSOLE (POST /api/chat)
============================================================ */
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatInputField = document.getElementById('chat-input-field');
const chatSendBtn = document.getElementById('chat-send-btn');
const activeHistory = []; // Local queue structure for memory buffers

async function sendChat() {
  if (!chatInputField || !chatMessagesContainer) return;
  const userMessage = chatInputField.value.trim();

  if (userMessage.length === 0) return;

  // Render User Message bubble
  appendChatBubble('user', userMessage);
  chatInputField.value = '';

  // Append Typing Indicator node
  const typingIndicator = appendTypingIndicator();
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

  // Toggle button state
  if (chatSendBtn) {
    chatSendBtn.disabled = true;
    chatSendBtn.textContent = "...";
  }

  try {
    // Send request including memory history buffer
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        history: activeHistory
      })
    });

    const data = await response.json();

    // Remove typing indicator before appending response
    removeTypingIndicator(typingIndicator);

    if (!response.ok) {
      throw new Error(data.message || `Server returned status HTTP ${response.status}`);
    }

    // Render AI Response bubble
    appendChatBubble('ai', data.reply);
    
    // Save state transaction inside memory buffers
    activeHistory.push({ role: 'user', message: userMessage });
    activeHistory.push({ role: 'ai', message: data.reply });

    // Limit memory size in client context (keep last 10 messages)
    if (activeHistory.length > 20) {
      activeHistory.splice(0, 2);
    }

  } catch (error) {
    console.error("Mentor Terminal Chat session failed:", error);
    removeTypingIndicator(typingIndicator);
    
    appendChatBubble('ai', `CONNECTION TERMINATED: ${error.message}. Verify network adapter statuses or configure server local API keys.`);
    showToast("Terminal message transmission failed.", "❌");
  } finally {
    if (chatSendBtn) {
      chatSendBtn.disabled = false;
      chatSendBtn.textContent = "Transmit";
    }
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }
}

// Chat Helper: Append standard bubbles
function appendChatBubble(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `msg ${role}`;
  
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
  chatMessagesContainer.appendChild(bubble);
}

// Chat Helper: Append typing animation
function appendTypingIndicator() {
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
  chatMessagesContainer.appendChild(indicator);
  return indicator;
}

// Chat Helper: Remove typing animation
function removeTypingIndicator(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
