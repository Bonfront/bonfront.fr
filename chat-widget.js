/**
 * Bonfront — Custom Voiceflow Chat Widget
 * Remplace le widget natif Voiceflow par un UI 100% custom
 * Appelle directement la Voiceflow Runtime API
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const CONFIG = {
    projectID: '69dec0aceb0390b51363cf7c',
    versionID: 'development',
    apiURL: 'https://bonfront-vf-proxy.floral-mode-c501.workers.dev',
    agentName: 'Alex',
    agentRole: 'Support IA · Bonfront',
    launchDelay: 1200,
  };

  // Génère ou récupère un userID persistant
  function getUserID() {
    let id = localStorage.getItem('bf_uid');
    if (!id) {
      id = 'bf_' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem('bf_uid', id);
    }
    return id;
  }

  const userID = getUserID();
  let sessionActive = false;
  let isOpen = false;
  let isTyping = false;

  // ─── API ────────────────────────────────────────────────────────────────────
  async function sendToVoiceflow(action) {
    try {
      const res = await fetch(`${CONFIG.apiURL}/state/user/${userID}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, config: { tts: false, stripSSML: true } }),
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      return await res.json();
    } catch (err) {
      console.error('[Bonfront Widget]', err);
      return null;
    }
  }

  function extractMessages(traces) {
    const messages = [];
    if (!traces) return messages;
    for (const trace of traces) {
      if (trace.type === 'text' && trace.payload?.message) {
        messages.push({ type: 'text', content: trace.payload.message });
      } else if (trace.type === 'speak' && trace.payload?.message) {
        messages.push({ type: 'text', content: trace.payload.message });
      } else if (trace.type === 'visual' && trace.payload?.image) {
        messages.push({ type: 'image', content: trace.payload.image });
      } else if (trace.type === 'choice' && trace.payload?.buttons?.length) {
        messages.push({ type: 'buttons', content: trace.payload.buttons });
      }
    }
    return messages;
  }

  // ─── STYLES ─────────────────────────────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

    #bf-widget-launcher {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e8ff00;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(232,255,0,0.35);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s ease;
      outline: none;
    }
    #bf-widget-launcher:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 8px 36px rgba(232,255,0,0.45);
    }
    #bf-widget-launcher:active {
      transform: scale(0.96);
    }
    #bf-widget-launcher svg {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #bf-widget-launcher .icon-chat { opacity: 1; transform: scale(1) rotate(0deg); }
    #bf-widget-launcher .icon-close { opacity: 0; transform: scale(0.6) rotate(-45deg); position: absolute; }
    #bf-widget-launcher.is-open .icon-chat { opacity: 0; transform: scale(0.6) rotate(45deg); }
    #bf-widget-launcher.is-open .icon-close { opacity: 1; transform: scale(1) rotate(0deg); }

    #bf-notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #ff4444;
      border-radius: 50%;
      border: 2px solid #0a0a0a;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    #bf-notif-dot.show {
      opacity: 1;
      transform: scale(1);
    }

    #bf-widget-panel {
      position: fixed;
      bottom: 96px;
      right: 28px;
      z-index: 9998;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #111110;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,255,0,0.06);
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1);
      transform-origin: bottom right;
    }
    #bf-widget-panel.is-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #bf-panel-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .bf-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e8ff00;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #0a0a0a;
      flex-shrink: 0;
      position: relative;
    }
    .bf-avatar::after {
      content: '';
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 9px;
      height: 9px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #111110;
    }
    .bf-agent-info {
      flex: 1;
    }
    .bf-agent-name {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .bf-agent-role {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.5px;
      margin-top: 1px;
    }
    .bf-header-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #0a0a0a;
      background: #e8ff00;
      padding: 3px 8px;
      border-radius: 100px;
    }

    #bf-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #bf-messages::-webkit-scrollbar { width: 3px; }
    #bf-messages::-webkit-scrollbar-track { background: transparent; }
    #bf-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .bf-msg-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      transform: translateY(8px);
      animation: bfMsgIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes bfMsgIn {
      to { opacity: 1; transform: translateY(0); }
    }
    .bf-msg-wrap.user-wrap { align-items: flex-end; }
    .bf-msg-wrap.agent-wrap { align-items: flex-start; }

    .bf-bubble {
      max-width: 82%;
      padding: 11px 15px;
      border-radius: 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    .bf-bubble.agent {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.88);
      border: 1px solid rgba(255,255,255,0.06);
      border-bottom-left-radius: 4px;
    }
    .bf-bubble.user {
      background: #e8ff00;
      color: #0a0a0a;
      font-weight: 500;
      border-bottom-right-radius: 4px;
    }

    .bf-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 15px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .bf-typing span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      animation: bfDot 1.2s infinite;
    }
    .bf-typing span:nth-child(2) { animation-delay: 0.2s; }
    .bf-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bfDot {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }

    .bf-buttons-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 0 4px;
    }
    .bf-choice-btn {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.75);
      background: transparent;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 100px;
      padding: 7px 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    .bf-choice-btn:hover {
      background: rgba(232,255,0,0.08);
      border-color: rgba(232,255,0,0.35);
      color: #e8ff00;
    }
    .bf-choice-btn:active {
      transform: scale(0.97);
    }
    .bf-choice-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    #bf-panel-footer {
      padding: 12px 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .bf-input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 8px 8px 8px 14px;
      transition: border-color 0.2s ease;
    }
    .bf-input-row:focus-within {
      border-color: rgba(232,255,0,0.3);
      background: rgba(232,255,0,0.02);
    }
    #bf-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.85);
      line-height: 1.5;
      resize: none;
      height: 22px;
      max-height: 80px;
      overflow-y: auto;
    }
    #bf-input::placeholder {
      color: rgba(255,255,255,0.2);
    }
    #bf-send {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #e8ff00;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
      outline: none;
    }
    #bf-send:hover { background: #c4d900; transform: scale(1.05); }
    #bf-send:active { transform: scale(0.95); }
    #bf-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
    #bf-send svg { color: #0a0a0a; }

    .bf-footer-note {
      text-align: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      color: rgba(255,255,255,0.18);
      margin-top: 8px;
      letter-spacing: 0.3px;
    }

    @media (max-width: 440px) {
      #bf-widget-panel {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-width: 100%;
        height: 85vh;
        border-radius: 20px 20px 0 0;
        transform-origin: bottom center;
      }
      #bf-widget-launcher {
        bottom: 20px;
        right: 20px;
      }
    }
  `;

  // ─── DOM ────────────────────────────────────────────────────────────────────
  function buildWidget() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    // Launcher
    const launcher = document.createElement('button');
    launcher.id = 'bf-widget-launcher';
    launcher.setAttribute('aria-label', 'Ouvrir le chat');
    launcher.innerHTML = `
      <span class="bf-notif" id="bf-notif-dot"></span>
      <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    document.body.appendChild(launcher);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'bf-widget-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat avec Alex');
    panel.innerHTML = `
      <div id="bf-panel-header">
        <div class="bf-avatar">A</div>
        <div class="bf-agent-info">
          <div class="bf-agent-name">${CONFIG.agentName}</div>
          <div class="bf-agent-role">${CONFIG.agentRole}</div>
        </div>
        <span class="bf-header-tag">IA</span>
      </div>
      <div id="bf-messages"></div>
      <div id="bf-panel-footer">
        <div class="bf-input-row">
          <input
            type="text"
            id="bf-input"
            placeholder="Posez votre question…"
            autocomplete="off"
            maxlength="500"
          />
          <button id="bf-send" aria-label="Envoyer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="bf-footer-note">Propulsé par Bonfront · Agent IA e-commerce</p>
      </div>
    `;
    document.body.appendChild(panel);

    return { launcher, panel };
  }

  // ─── MESSAGES UI ────────────────────────────────────────────────────────────
  function appendMessage(role, content) {
    const messagesEl = document.getElementById('bf-messages');
    const wrap = document.createElement('div');
    wrap.className = `bf-msg-wrap ${role === 'user' ? 'user-wrap' : 'agent-wrap'}`;

    const bubble = document.createElement('div');
    bubble.className = `bf-bubble ${role === 'user' ? 'user' : 'agent'}`;
    bubble.innerHTML = content.replace(/\n/g, '<br>');

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function appendButtons(buttons) {
    const messagesEl = document.getElementById('bf-messages');
    const wrap = document.createElement('div');
    wrap.className = 'bf-msg-wrap agent-wrap';

    const buttonsWrap = document.createElement('div');
    buttonsWrap.className = 'bf-buttons-wrap';

    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'bf-choice-btn';
      b.textContent = btn.name || btn.request?.payload?.label || btn.name;
      b.addEventListener('click', () => {
        // Disable all choice buttons after selection
        document.querySelectorAll('.bf-choice-btn').forEach(el => el.disabled = true);
        handleUserMessage(btn.name || btn.request?.payload?.label);
      });
      buttonsWrap.appendChild(b);
    });

    wrap.appendChild(buttonsWrap);
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    const messagesEl = document.getElementById('bf-messages');
    const el = document.createElement('div');
    el.className = 'bf-msg-wrap agent-wrap';
    el.id = 'bf-typing-indicator';
    el.innerHTML = `<div class="bf-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    const el = document.getElementById('bf-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    const el = document.getElementById('bf-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function setInputDisabled(val) {
    const input = document.getElementById('bf-input');
    const send = document.getElementById('bf-send');
    if (input) input.disabled = val;
    if (send) send.disabled = val;
  }

  // ─── LOGIC ──────────────────────────────────────────────────────────────────
  async function startSession() {
    showTyping();
    setInputDisabled(true);
    const traces = await sendToVoiceflow({ type: 'launch' });
    hideTyping();
    setInputDisabled(false);
    if (traces) {
      sessionActive = true;
      renderTraces(traces);
    } else {
      appendMessage('agent', "Bonjour, je suis Alex. Comment puis-je vous aider aujourd'hui&nbsp;?");
      sessionActive = true;
    }
  }

  function renderTraces(traces) {
    const messages = extractMessages(traces);
    messages.forEach((msg, i) => {
      setTimeout(() => {
        if (msg.type === 'text') {
          appendMessage('agent', msg.content);
        } else if (msg.type === 'buttons') {
          appendButtons(msg.content);
        }
      }, i * 80);
    });
  }

  async function handleUserMessage(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();

    appendMessage('user', clean);
    setInputDisabled(true);

    // Clear input if came from text field
    const inputEl = document.getElementById('bf-input');
    if (inputEl) inputEl.value = '';

    if (!sessionActive) await startSession();

    showTyping();
    const traces = await sendToVoiceflow({ type: 'text', payload: clean });
    hideTyping();
    setInputDisabled(false);

    if (traces) {
      renderTraces(traces);
    } else {
      appendMessage('agent', "Je rencontre un problème de connexion. Réessayez dans un instant.");
    }

    if (inputEl) inputEl.focus();
  }

  // ─── INIT ───────────────────────────────────────────────────────────────────
  function init() {
    const { launcher, panel } = buildWidget();

    // Toggle open/close
    launcher.addEventListener('click', async () => {
      isOpen = !isOpen;
      launcher.classList.toggle('is-open', isOpen);
      panel.classList.toggle('is-open', isOpen);
      launcher.setAttribute('aria-label', isOpen ? 'Fermer le chat' : 'Ouvrir le chat');

      // Hide notif dot
      document.getElementById('bf-notif-dot').classList.remove('show');

      if (isOpen && !sessionActive) {
        await startSession();
      }

      if (isOpen) {
        setTimeout(() => {
          const input = document.getElementById('bf-input');
          if (input) input.focus();
        }, 320);
      }
    });

    // Send on button
    document.getElementById('bf-send').addEventListener('click', () => {
      const input = document.getElementById('bf-input');
      if (input && input.value.trim()) {
        handleUserMessage(input.value);
      }
    });

    // Send on Enter (shift+enter = newline)
    document.getElementById('bf-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const input = document.getElementById('bf-input');
        if (input && input.value.trim()) {
          handleUserMessage(input.value);
        }
      }
    });

    // Show notif dot after launch delay (to draw attention)
    setTimeout(() => {
      if (!isOpen) {
        document.getElementById('bf-notif-dot').classList.add('show');
      }
    }, CONFIG.launchDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
