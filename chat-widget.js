(function () {

  /* ─────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────── */
  const CONFIG = {
    agentName:   "Alex",
    agentAvatar: null,
    greeting:    "Bonjour 👋 Je suis Alex, l'assistant Bonfront. Comment puis-je vous aider aujourd'hui ?",
    color:       "#d2ff28",
    colorDark:   "#0e0f0d",
    colorText:   "#0e0f0d",
    webhookUrl:  "https://n8n.bonfront.fr/webhook/chat",
    token:       "fdf7bc82-d244-4254-80cd-e547734bd4e3", 
  };

  /* ─────────────────────────────────────────────
     FONTS
  ───────────────────────────────────────────── */
  const fontLink = document.createElement("link");
  fontLink.rel  = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@500;600&display=swap";
  document.head.appendChild(fontLink);

  /* ─────────────────────────────────────────────
     CSS
  ───────────────────────────────────────────── */
  const css = `
    /* ── PILL LAUNCHER ── */
    #bf-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      height: 48px;
      padding: 0 20px 0 15px;
      border-radius: 24px;
      background: ${CONFIG.color};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 9px;
      z-index: 99998;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 13px;
      color: ${CONFIG.colorText};
      letter-spacing: 0.01em;
      box-shadow: 0 2px 0 #8aaa10, 0 6px 20px rgba(210,255,40,0.22);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, opacity 0.2s ease;
    }
    #bf-launcher:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 0 #8aaa10, 0 12px 28px rgba(210,255,40,0.3);
    }
    #bf-launcher:active {
      transform: translateY(1px);
      box-shadow: 0 1px 0 #8aaa10;
    }
    #bf-launcher.bf-hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px) scale(0.95);
    }
    #bf-launcher svg { flex-shrink: 0; }

    /* ── WINDOW ── */
    #bf-window {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 340px;
      max-height: 560px;
      background: ${CONFIG.colorDark};
      border-radius: 20px;
      border: 1px solid rgba(210,255,40,0.12);
      box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99997;
      font-family: 'DM Sans', sans-serif;
      transform-origin: bottom right;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      transform: scale(0.7) translateY(20px);
      opacity: 0;
      pointer-events: none;
    }
    #bf-window.bf-open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* Glow décoratif */
    #bf-window::before {
      content: '';
      position: absolute;
      top: -60px; right: -40px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(210,255,40,0.07) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    /* ── HEADER ── */
    #bf-header {
      padding: 15px 18px 13px;
      background: #111210;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      gap: 11px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    #bf-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: ${CONFIG.color};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 14px;
      color: ${CONFIG.colorText};
      flex-shrink: 0;
      overflow: hidden;
    }
    #bf-avatar img { width: 100%; height: 100%; object-fit: cover; }
    #bf-agent-name {
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 14px;
      color: #f0f0ec;
      letter-spacing: 0.01em;
    }
    #bf-status {
      display: flex; align-items: center; gap: 5px;
      margin-top: 2px;
    }
    #bf-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${CONFIG.color};
      animation: bf-pulse 2.5s ease-in-out infinite;
    }
    #bf-status-text {
      font-size: 11px;
      color: rgba(210,255,40,0.7);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    #bf-close {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.4);
      font-size: 13px; line-height: 1;
      margin-left: auto;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    #bf-close:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }

    /* ── MESSAGES ── */
    #bf-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative; z-index: 1;
    }
    #bf-messages::-webkit-scrollbar { width: 3px; }
    #bf-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

    .bf-msg {
      display: flex; flex-direction: column; gap: 3px;
      animation: bf-fadein 0.28s cubic-bezier(0.34,1.3,0.64,1);
    }
    .bf-msg.bf-user { align-items: flex-end; }
    .bf-msg.bf-bot  { align-items: flex-start; }

    @keyframes bf-fadein {
      from { transform: translateY(6px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }

    .bf-bubble {
      max-width: 82%;
      padding: 10px 14px;
      font-size: 13.5px;
      line-height: 1.55;
    }
    .bf-msg.bf-user .bf-bubble {
      background: ${CONFIG.color};
      color: ${CONFIG.colorText};
      border-radius: 14px 14px 4px 14px;
    }
    .bf-msg.bf-bot .bf-bubble {
      background: #1a1b18;
      color: #d8d9d3;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px 14px 14px 14px;
    }
    .bf-time {
      font-size: 10.5px;
      color: rgba(255,255,255,0.2);
      padding: 0 4px;
    }

    /* ── TYPING ── */
    #bf-typing-indicator {
      display: flex; gap: 4px; align-items: center;
      padding: 12px 14px;
      background: #1a1b18;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px 14px 14px 14px;
      width: fit-content;
      animation: bf-fadein 0.2s ease;
    }
    .bf-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: rgba(210,255,40,0.5);
      animation: bf-bounce 1.4s ease-in-out infinite;
    }
    .bf-dot:nth-child(2) { animation-delay: 0.2s; }
    .bf-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bf-bounce {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
      30%            { transform: translateY(-4px); opacity: 1;   }
    }

    /* ── INPUT AREA ── */
    #bf-footer {
      padding: 12px 14px 14px;
      background: #111210;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0;
      position: relative; z-index: 1;
    }
    #bf-input {
      flex: 1;
      background: #1a1b18;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 9px 16px;
      font-size: 13px;
      color: #d8d9d3;
      font-family: 'DM Sans', sans-serif;
      outline: none;
      transition: border-color 0.2s;
      caret-color: ${CONFIG.color};
    }
    #bf-input::placeholder { color: rgba(255,255,255,0.22); }
    #bf-input:focus { border-color: rgba(210,255,40,0.3); }
    #bf-send {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: ${CONFIG.color};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s, transform 0.15s;
    }
    #bf-send:hover  { background: #e0ff60; transform: scale(1.05); }
    #bf-send:active { transform: scale(0.96); }

    /* ── BRANDING ── */
    #bf-branding {
      text-align: center;
      font-size: 10px;
      color: rgba(255,255,255,0.15);
      padding: 0 0 10px;
      background: #111210;
      letter-spacing: 0.04em;
      position: relative; z-index: 1;
    }
    #bf-branding a { color: rgba(210,255,40,0.35); text-decoration: none; }
    #bf-branding a:hover { color: rgba(210,255,40,0.6); }

    @keyframes bf-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
     DOM — LAUNCHER
  ───────────────────────────────────────────── */
  const launcher = document.createElement("button");
  launcher.id = "bf-launcher";
  launcher.setAttribute("aria-label", "Ouvrir le chat");
  launcher.innerHTML = `
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="${CONFIG.colorText}"/>
      <circle cx="8.5" cy="10" r="1.5" fill="${CONFIG.colorText}"/>
      <circle cx="12"  cy="10" r="1.5" fill="${CONFIG.colorText}"/>
      <circle cx="15.5" cy="10" r="1.5" fill="${CONFIG.colorText}"/>
    </svg>
    Parler à ${CONFIG.agentName}
  `;

  /* ─────────────────────────────────────────────
     DOM — WINDOW
  ───────────────────────────────────────────── */
  const avatarContent = CONFIG.agentAvatar
    ? `<img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" />`
    : `<span>${CONFIG.agentName.charAt(0).toUpperCase()}</span>`;

  const win = document.createElement("div");
  win.id = "bf-window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", `Chat avec ${CONFIG.agentName}`);
  win.innerHTML = `
    <div id="bf-header">
      <div id="bf-avatar">${avatarContent}</div>
      <div>
        <div id="bf-agent-name">${CONFIG.agentName}</div>
        <div id="bf-status">
          <div id="bf-status-dot"></div>
          <span id="bf-status-text">En ligne</span>
        </div>
      </div>
      <button id="bf-close" aria-label="Fermer">✕</button>
    </div>
    <div id="bf-messages"></div>
    <div id="bf-footer">
      <input id="bf-input" type="text" placeholder="Votre message..." autocomplete="off" />
      <button id="bf-send" aria-label="Envoyer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${CONFIG.colorText}" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
    <div id="bf-branding">Propulsé par <a href="https://bonfront.fr" target="_blank">Bonfront</a></div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  const messagesEl = document.getElementById("bf-messages");
  const inputEl    = document.getElementById("bf-input");
  let isOpen = false;
  let sessionId = "session_" + Math.random().toString(36).substr(2, 9);
  let conversationHistory = [];

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  function timestamp() {
    return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function parseMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function addMessage(text, type) {
    const wrapper = document.createElement("div");
    wrapper.className = `bf-msg bf-${type}`;

    const bubble = document.createElement("div");
    bubble.className = "bf-bubble";
    bubble.innerHTML = parseMarkdown(text);

    const time = document.createElement("div");
    time.className = "bf-time";
    time.textContent = timestamp();

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.id = "bf-typing-indicator";
    t.innerHTML = `<div class="bf-dot"></div><div class="bf-dot"></div><div class="bf-dot"></div>`;
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById("bf-typing-indicator");
    if (t) t.remove();
  }

  /* ─────────────────────────────────────────────
     SEND
  ───────────────────────────────────────────── */
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    conversationHistory.push({ role: "user", content: text });
    inputEl.value = "";
    showTyping();

    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Bonfront-Token": CONFIG.token,
        },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: conversationHistory,
        }),
      });

      if (!res.ok) {
        hideTyping();
        addMessage("Désolé, une erreur est survenue.", "bot");
        return;
      }

      const reply = await res.text();
      hideTyping();
      const replyText = reply || "Désolé, une erreur est survenue.";
      addMessage(replyText, "bot");
      conversationHistory.push({ role: "assistant", content: replyText });
    } catch {
      hideTyping();
      addMessage("Désolé, je ne suis pas disponible pour le moment.", "bot");
    }
  }

  /* ─────────────────────────────────────────────
     TOGGLE
  ───────────────────────────────────────────── */
  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle("bf-open", isOpen);
    launcher.classList.toggle("bf-hidden", isOpen);
    if (isOpen) inputEl.focus();
  }

  /* ─────────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────────── */
  launcher.addEventListener("click", toggle);
  document.getElementById("bf-close").addEventListener("click", toggle);
  document.getElementById("bf-send").addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  addMessage(CONFIG.greeting, "bot");

})();
