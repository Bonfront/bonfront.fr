(function () {
  const CONFIG = {
    agentName: "Alex",
    agentAvatar: null,
    greeting: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    color: "#e8ff00",
    colorText: "#1a1a1a",
    font: "inherit",
    position: "bottom-right",
    borderRadius: "16px",
    bubbleSize: "56px",
    webhookUrl: "https://n8n.bonfront.fr/webhook/chat",
  };

  const css = `
    #bonfront-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: ${CONFIG.bubbleSize};
      height: ${CONFIG.bubbleSize};
      border-radius: 50%;
      background: ${CONFIG.color};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    }
    #bonfront-bubble:hover { transform: scale(1.08); }
    #bonfront-bubble:active { transform: scale(0.92); }
    #bonfront-bubble .bf-icon { position: absolute; transition: transform 0.2s ease, opacity 0.15s ease; }
    #bonfront-bubble .bf-icon-close { opacity: 0; transform: rotate(-90deg) scale(0.6); }
    #bonfront-bubble.bf-open .bf-icon-chat { opacity: 0; transform: rotate(90deg) scale(0.6); }
    #bonfront-bubble.bf-open .bf-icon-close { opacity: 1; transform: rotate(0deg) scale(1); }
    #bonfront-notif {
      position: absolute;
      top: 0; right: 0;
      width: 12px; height: 12px;
      background: #e24b4a;
      border-radius: 50%;
      border: 2px solid #fff;
      animation: bf-pulse 1.8s infinite;
    }
    @keyframes bf-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }
    #bonfront-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 340px;
      max-height: 520px;
      background: #fff;
      border-radius: ${CONFIG.borderRadius};
      box-shadow: 0 8px 32px rgba(0,0,0,0.14);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99997;
      font-family: ${CONFIG.font};
      transform-origin: bottom right;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      transform: scale(0.7) translateY(20px);
      opacity: 0;
      pointer-events: none;
    }
    #bonfront-window.bf-open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    #bonfront-header {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: ${CONFIG.color};
      color: ${CONFIG.colorText};
      flex-shrink: 0;
    }
    #bonfront-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 500;
      flex-shrink: 0;
      overflow: hidden;
    }
    #bonfront-avatar img { width: 100%; height: 100%; object-fit: cover; }
    #bonfront-status { display: flex; align-items: center; gap: 5px; font-size: 11px; opacity: 0.85; }
    #bonfront-status span { width: 6px; height: 6px; border-radius: 50%; background: #5DCAA5; display: inline-block; }
    #bonfront-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8f8f8;
    }
    .bf-msg-bot, .bf-msg-user { display: flex; flex-direction: column; max-width: 82%; animation: bf-slidein 0.22s cubic-bezier(0.34,1.3,0.64,1); }
    .bf-msg-bot { align-self: flex-start; }
    .bf-msg-user { align-self: flex-end; }
    @keyframes bf-slidein {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .bf-bubble-bot {
      background: #fff;
      border-radius: 14px 14px 14px 4px;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.55;
      color: #1a1a1a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    }
    .bf-bubble-user {
      background: ${CONFIG.color};
      color: ${CONFIG.colorText};
      border-radius: 14px 14px 4px 14px;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.55;
    }
    .bf-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 10px 14px;
      background: #fff;
      border-radius: 14px 14px 14px 4px;
      width: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    }
    .bf-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #aaa;
      animation: bf-bounce 1.2s infinite;
    }
    .bf-dot:nth-child(2) { animation-delay: 0.2s; }
    .bf-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bf-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    #bonfront-footer {
      padding: 10px 12px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      align-items: center;
      background: #fff;
      flex-shrink: 0;
    }
    #bonfront-input {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13px;
      outline: none;
      font-family: ${CONFIG.font};
      transition: border-color 0.15s;
    }
    #bonfront-input:focus { border-color: ${CONFIG.color}; }
    #bonfront-send {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: ${CONFIG.color};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }
    #bonfront-send:hover { transform: scale(1.08); }
    #bonfront-send:active { transform: scale(0.9); }
    #bonfront-branding {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      padding: 4px 0 6px;
      background: #fff;
    }
    #bonfront-branding a { color: #bbb; text-decoration: none; }
    #bonfront-branding a:hover { color: #888; }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const bubble = document.createElement("button");
  bubble.id = "bonfront-bubble";
  bubble.setAttribute("aria-label", "Ouvrir le chat");
  bubble.innerHTML = `
    <svg class="bf-icon bf-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colorText}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="bf-icon bf-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colorText}" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <div id="bonfront-notif"></div>
  `;

  const avatarContent = CONFIG.agentAvatar
    ? `<img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" />`
    : `<span>${CONFIG.agentName.charAt(0).toUpperCase()}</span>`;

  const win = document.createElement("div");
  win.id = "bonfront-window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", `Chat avec ${CONFIG.agentName}`);
  win.innerHTML = `
    <div id="bonfront-header">
      <div id="bonfront-avatar">${avatarContent}</div>
      <div>
        <div style="font-size:14px;font-weight:500;">${CONFIG.agentName}</div>
        <div id="bonfront-status"><span></span>En ligne</div>
      </div>
    </div>
    <div id="bonfront-messages"></div>
    <div id="bonfront-footer">
      <input id="bonfront-input" type="text" placeholder="Votre message..." autocomplete="off" />
      <button id="bonfront-send" aria-label="Envoyer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colorText}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
    <div id="bonfront-branding">Propulsé par <a href="https://bonfront.fr" target="_blank">Bonfront</a></div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  const messages = document.getElementById("bonfront-messages");
  const input = document.getElementById("bonfront-input");
  let isOpen = false;
  let sessionId = "session_" + Math.random().toString(36).substr(2, 9);

  function addMessage(text, type) {
    const wrapper = document.createElement("div");
    wrapper.className = type === "user" ? "bf-msg-user" : "bf-msg-bot";
    const bubble = document.createElement("div");
    bubble.className = type === "user" ? "bf-bubble-user" : "bf-bubble-bot";
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.id = "bf-typing-indicator";
    t.className = "bf-msg-bot";
    t.innerHTML = `<div class="bf-typing"><div class="bf-dot"></div><div class="bf-dot"></div><div class="bf-dot"></div></div>`;
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById("bf-typing-indicator");
    if (t) t.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    showTyping();
    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();
      hideTyping();
      const reply = typeof data === 'string' ? data : (data.output || data.message || data.text || "Désolé, une erreur est survenue.");
      addMessage(reply, "bot");
    } catch (e) {
      hideTyping();
      addMessage("Désolé, je ne suis pas disponible pour le moment.", "bot");
    }
  }

  function toggle() {
    isOpen = !isOpen;
    bubble.classList.toggle("bf-open", isOpen);
    win.classList.toggle("bf-open", isOpen);
    document.getElementById("bonfront-notif").style.display = "none";
    if (isOpen) input.focus();
  }

  bubble.addEventListener("click", toggle);
  document.getElementById("bonfront-send").addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  addMessage(CONFIG.greeting, "bot");
})();
