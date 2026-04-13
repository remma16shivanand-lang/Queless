/* QGo AI Chatbot Widget - include this on every page */
/* Usage: <script src="chatbot.js"></script> before </body> */

(function() {
  var SYSTEM_PROMPT = `You are QGo's friendly AI assistant. QGo is a smart queue management app that gives people their time back while waiting in lines.

You help customers with:
- How to join a queue (scan QR code or open the link, enter name, get token)
- Understanding their queue position and ETA
- What to do nearby while waiting (coffee, errands, shopping)
- How the safe-to-leave indicator works (green = safe, yellow = risky, red = stay)
- How notifications work (browser push alerts, sound, vibration, confetti when called)
- Business registration questions
- Admin panel help
- General app troubleshooting

Key facts about QGo:
- Free to use, no app download needed
- Works on any phone browser
- Each business has its own isolated queue
- Tokens are like G001, E001, F001 (General, Emergency, Follow-up)
- AI-powered ETA gets smarter as more people are served
- Confetti + sound + vibration when it's your turn
- Businesses register at /register.html and get unique queue links

Keep responses short, friendly, and GenZ-ish but professional. Use emojis sparingly. Always be helpful and positive. If you don't know something specific about a user's queue, tell them to check their token screen.`;

  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    #qgo-chat-btn {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9000;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 24px rgba(124,58,237,0.5);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: chatBtnPop 0.5s ease;
    }
    #qgo-chat-btn:hover { transform: scale(1.1); box-shadow: 0 4px 36px rgba(124,58,237,0.7); }
    #qgo-chat-btn .notif-dot {
      position: absolute; top: 2px; right: 2px;
      width: 12px; height: 12px; background: #22c55e;
      border-radius: 50%; border: 2px solid #080810;
      animation: notifPulse 2s infinite;
    }
    @keyframes notifPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.3)} }
    @keyframes chatBtnPop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

    #qgo-chat-window {
      position: fixed; bottom: 5rem; right: 1.5rem; z-index: 9001;
      width: 340px; max-width: calc(100vw - 2rem);
      background: #0f0f1a; border: 1px solid #2a1f4e;
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 8px 48px rgba(124,58,237,0.3);
      display: none; flex-direction: column;
      animation: chatSlideUp 0.3s ease;
      max-height: 520px;
    }
    #qgo-chat-window.open { display: flex; }
    @keyframes chatSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

    .chat-header {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      padding: 1rem 1.2rem;
      display: flex; align-items: center; gap: 0.7rem;
    }
    .chat-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .chat-header-info { flex: 1; }
    .chat-header-name { font-weight: 700; font-size: 0.92rem; color: #fff; font-family: 'Space Grotesk', sans-serif; }
    .chat-header-status { font-size: 0.72rem; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 0.3rem; }
    .chat-header-status::before { content: ''; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block; }
    .chat-close { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 1.1rem; cursor: pointer; padding: 0.2rem; }
    .chat-close:hover { color: #fff; }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: 0.7rem;
      max-height: 340px;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: #2a1f4e; border-radius: 2px; }

    .chat-msg {
      display: flex; gap: 0.5rem; align-items: flex-end;
      animation: msgPop 0.2s ease;
    }
    @keyframes msgPop { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .chat-msg.user { flex-direction: row-reverse; }
    .msg-bubble {
      max-width: 75%; padding: 0.6rem 0.9rem;
      border-radius: 14px; font-size: 0.85rem; line-height: 1.5;
      font-family: 'Space Grotesk', sans-serif;
    }
    .chat-msg.bot .msg-bubble { background: #1e1e30; color: #e2e2ff; border-bottom-left-radius: 4px; }
    .chat-msg.user .msg-bubble { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; border-bottom-right-radius: 4px; }
    .msg-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#a855f7); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; }

    .typing-dots { display: flex; gap: 3px; padding: 0.6rem 0.9rem; background: #1e1e30; border-radius: 14px; border-bottom-left-radius: 4px; width: fit-content; }
    .typing-dots span { width: 6px; height: 6px; background: #6b6b8a; border-radius: 50%; animation: typingDot 1.2s infinite; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot { 0%,60%,100%{transform:translateY(0);background:#6b6b8a} 30%{transform:translateY(-4px);background:#a855f7} }

    .chat-quick-btns { padding: 0.5rem 1rem; display: flex; flex-wrap: wrap; gap: 0.4rem; border-top: 1px solid #1e1e30; }
    .quick-btn {
      background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25);
      color: #c084fc; border-radius: 999px; padding: 0.3rem 0.7rem;
      font-size: 0.72rem; font-weight: 500; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
      font-family: 'Space Grotesk', sans-serif;
    }
    .quick-btn:hover { background: rgba(124,58,237,0.2); border-color: rgba(168,85,247,0.5); }

    .chat-input-area {
      padding: 0.8rem 1rem; border-top: 1px solid #1e1e30;
      display: flex; gap: 0.5rem; align-items: center;
    }
    .chat-input {
      flex: 1; background: #13131f; border: 1px solid #1e1e30;
      border-radius: 999px; padding: 0.55rem 1rem;
      color: #e2e2ff; font-family: 'Space Grotesk', sans-serif;
      font-size: 0.85rem; outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #7c3aed; }
    .chat-input::placeholder { color: #6b6b8a; }
    .chat-send {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; flex-shrink: 0;
      transition: transform 0.2s;
    }
    .chat-send:hover { transform: scale(1.1); }
    .chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  `;
  document.head.appendChild(style);

  // Inject HTML
  var html = `
    <button id="qgo-chat-btn" title="Chat with QGo AI">
      🤖
      <div class="notif-dot"></div>
    </button>
    <div id="qgo-chat-window">
      <div class="chat-header">
        <div class="chat-avatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-header-name">QGo Assistant</div>
          <div class="chat-header-status">Online — here to help</div>
        </div>
        <button class="chat-close" id="qgo-chat-close">✕</button>
      </div>
      <div class="chat-messages" id="qgo-chat-messages"></div>
      <div class="chat-quick-btns" id="qgo-quick-btns">
        <button class="quick-btn" onclick="qgoQuick('How do I join a queue?')">How to join?</button>
        <button class="quick-btn" onclick="qgoQuick('What does my token mean?')">My token?</button>
        <button class="quick-btn" onclick="qgoQuick('Is it safe to leave the queue?')">Safe to leave?</button>
        <button class="quick-btn" onclick="qgoQuick('How do notifications work?')">Notifications?</button>
      </div>
      <div class="chat-input-area">
        <input class="chat-input" id="qgo-chat-input" placeholder="Ask me anything..." onkeydown="if(event.key==='Enter')qgoSend()"/>
        <button class="chat-send" id="qgo-send-btn" onclick="qgoSend()">➤</button>
      </div>
    </div>
  `;
  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // Chat state
  var chatHistory = [];
  var isOpen = false;
  var isLoading = false;

  // Toggle
  document.getElementById('qgo-chat-btn').addEventListener('click', function() {
    isOpen = !isOpen;
    var win = document.getElementById('qgo-chat-window');
    win.classList.toggle('open', isOpen);
    if (isOpen && chatHistory.length === 0) {
      setTimeout(function() {
        addBotMessage("Hey! 👋 I'm QGo's AI assistant. I can help you with queue questions, explain how things work, or guide you through anything. What's on your mind?");
      }, 300);
    }
    if (isOpen) {
      document.getElementById('qgo-chat-btn').querySelector('.notif-dot').style.display = 'none';
      setTimeout(function() { document.getElementById('qgo-chat-input').focus(); }, 100);
    }
  });
  document.getElementById('qgo-chat-close').addEventListener('click', function() {
    isOpen = false;
    document.getElementById('qgo-chat-window').classList.remove('open');
  });

  window.qgoQuick = function(msg) {
    document.getElementById('qgo-chat-input').value = msg;
    qgoSend();
  };

  window.qgoSend = async function() {
    if (isLoading) return;
    var input = document.getElementById('qgo-chat-input');
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addUserMessage(msg);
    chatHistory.push({ role: 'user', content: msg });
    document.getElementById('qgo-quick-btns').style.display = 'none';
    showTyping();
    isLoading = true;
    document.getElementById('qgo-send-btn').disabled = true;

    try {
      var response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: chatHistory
        })
      });
      var data = await response.json();
      var reply = data.content && data.content[0] ? data.content[0].text : "Sorry, I couldn't get a response. Please try again!";
      hideTyping();
      addBotMessage(reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch(e) {
      hideTyping();
      addBotMessage("Oops! Something went wrong. Try again in a moment 🙏");
    }
    isLoading = false;
    document.getElementById('qgo-send-btn').disabled = false;
  };

  function addBotMessage(text) {
    var msgs = document.getElementById('qgo-chat-messages');
    var div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-bubble">'+escHtml(text)+'</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    var msgs = document.getElementById('qgo-chat-messages');
    var div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = '<div class="msg-bubble">'+escHtml(text)+'</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    var msgs = document.getElementById('qgo-chat-messages');
    var div = document.createElement('div');
    div.className = 'chat-msg bot'; div.id = 'typing-indicator';
    div.innerHTML = '<div class="msg-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function escHtml(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }
})();
