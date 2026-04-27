/* ═══════════════════════════════════════════════════
   QGo AI Assistant — v2.0
   Features:
   - Multilingual (Telugu, Hindi, English auto-detect)
   - Voice input (Web Speech API)
   - Step-by-step onboarding for new users
   - Smart queue prediction insights
   - Real-time crowd/delay alerts
   - Auto customer support with live system data
   - Emotion + intent understanding
   Usage: <script src="ai-assistant.js"></script>
═══════════════════════════════════════════════════ */
(function() {
  // ── SYSTEM PROMPT ──
  var SYSTEM_PROMPT = `You are QGo's friendly AI assistant. QGo is a smart queue management platform that gives people their time back.

LANGUAGES: Detect the user's language automatically and respond in the SAME language. Support English, Hindi (हिंदी), and Telugu (తెలుగు). If they mix languages, respond in the dominant language they used.

YOUR PERSONALITY:
- Warm, patient, simple language
- Never use technical jargon
- Use emojis naturally
- For non-tech users, explain things like you're talking to a grandparent
- Be encouraging and positive

WHAT YOU KNOW ABOUT QGo:
- Users scan a QR code at a business entrance OR open a link
- They enter their name and select queue type (General/Emergency/Follow-up)
- They get a token number (like G001, E001)
- They can walk away and come back when called
- When called: screen flashes, sound plays, phone vibrates, confetti appears
- Grace period: if they miss their turn, they get a countdown to come back
- "I'm On My Way" button: holds their slot for extra time
- Smart Delay Mode: tell the system you're stuck in traffic, parking, etc.
- Priority Re-entry: if they miss, they come back near the front, not the end
- Safe-to-leave indicator: Green=safe to explore, Yellow=come back soon, Red=stay!
- Nearby suggestions: AI shows what to do during wait (coffee, errands, etc.)
- Businesses register at register.html and get their own queue link instantly

SMART RESPONSES FOR COMMON ISSUES:
- "Token not moving" → explain queue position is live, suggest checking position number
- "Missed my turn" → explain priority re-entry, how to tap "I'm on my way"
- "How long will I wait" → explain AI estimates based on real speed, give range
- "App not working" → check internet connection, try refreshing
- "Want to cancel" → explain leave queue button, they lose spot
- "Running late" → explain Smart Delay Mode options
- "Queue very long" → suggest best time to visit based on typical patterns

ONBOARDING (for new users):
When someone seems confused or new, walk them through these steps:
1. Make sure you have the business QR link or URL
2. Enter your name in the box
3. Select your queue type
4. Tap "Get My Token"
5. You'll see your position — you can now walk away!
6. Enable notifications so we can alert you
7. When your position is 1 or you're called — head back!

EMOTION DETECTION:
- "I'm in a hurry" / "urgent" → suggest emergency queue, fastest options
- "I'm tired" / "unwell" → be extra gentle, suggest sitting areas, emergency queue
- "Confused" / "don't understand" → simplify, use step-by-step
- "Angry" / "frustrated" → be extra calm and empathetic, acknowledge frustration

Always be helpful. If you don't know something specific, be honest and suggest they ask the business staff.`;

  // ── INJECT STYLES ──
  var style = document.createElement('style');
  style.textContent = `
    #qgo-ai-btn {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9000;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 24px rgba(124,58,237,0.5);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: aiBtnPop 0.5s 1s ease both;
    }
    @keyframes aiBtnPop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
    #qgo-ai-btn:hover { transform: scale(1.1); box-shadow: 0 4px 36px rgba(124,58,237,0.7); }
    #qgo-ai-btn .ai-notif {
      position: absolute; top: 2px; right: 2px;
      width: 14px; height: 14px; background: #22c55e;
      border-radius: 50%; border: 2px solid #080810;
      animation: aiPulse 2s infinite;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; color: #fff; font-weight: 700;
    }
    @keyframes aiPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

    #qgo-ai-window {
      position: fixed; bottom: 5.5rem; right: 1.5rem; z-index: 9001;
      width: 360px; max-width: calc(100vw - 2rem);
      background: #0f0f1a; border: 1px solid #2a1f4e;
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 8px 48px rgba(124,58,237,0.3);
      display: none; flex-direction: column;
      max-height: 560px;
    }
    #qgo-ai-window.open { display: flex; animation: aiSlideUp 0.3s ease; }
    @keyframes aiSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

    .ai-header {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      padding: 1rem 1.2rem;
      display: flex; align-items: center; gap: 0.7rem;
      flex-shrink: 0;
    }
    .ai-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .ai-header-info { flex: 1; }
    .ai-header-name { font-weight: 700; font-size: 0.9rem; color: #fff; font-family: sans-serif; }
    .ai-header-status { font-size: 0.7rem; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem; }
    .ai-header-status::before { content: ''; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block; }
    .ai-header-right { display: flex; gap: 0.5rem; align-items: center; }
    .ai-lang-btn {
      background: rgba(255,255,255,0.15); border: none; color: #fff;
      font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 999px;
      cursor: pointer; font-weight: 600;
    }
    .ai-close-btn { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 1.1rem; cursor: pointer; padding: 0.2rem; }
    .ai-close-btn:hover { color: #fff; }

    .ai-messages {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: 0.7rem;
      max-height: 340px;
    }
    .ai-messages::-webkit-scrollbar { width: 4px; }
    .ai-messages::-webkit-scrollbar-thumb { background: #2a1f4e; border-radius: 2px; }

    .ai-msg { display: flex; gap: 0.5rem; align-items: flex-end; animation: msgIn 0.2s ease; }
    @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    .ai-msg.user { flex-direction: row-reverse; }
    .ai-bubble {
      max-width: 80%; padding: 0.65rem 0.9rem;
      border-radius: 14px; font-size: 0.84rem; line-height: 1.55;
      font-family: sans-serif;
    }
    .ai-msg.bot .ai-bubble { background: #1e1e30; color: #e2e2ff; border-bottom-left-radius: 4px; }
    .ai-msg.user .ai-bubble { background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; border-bottom-right-radius: 4px; }
    .msg-av { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#a855f7); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; }

    /* TYPING */
    .ai-typing { display: flex; gap: 3px; padding: 0.65rem 0.9rem; background: #1e1e30; border-radius: 14px; border-bottom-left-radius: 4px; width: fit-content; }
    .ai-typing span { width: 6px; height: 6px; background: #6b6b8a; border-radius: 50%; animation: typeDot 1.2s infinite; }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typeDot { 0%,60%,100%{transform:translateY(0);background:#6b6b8a} 30%{transform:translateY(-4px);background:#a855f7} }

    /* QUICK BUTTONS */
    .ai-quick { padding: 0.6rem 1rem; display: flex; flex-wrap: wrap; gap: 0.4rem; border-top: 1px solid #1e1e30; flex-shrink: 0; }
    .ai-qbtn {
      background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25);
      color: #c084fc; border-radius: 999px; padding: 0.3rem 0.7rem;
      font-size: 0.7rem; font-weight: 500; cursor: pointer;
      transition: all 0.2s; white-space: nowrap; font-family: sans-serif;
    }
    .ai-qbtn:hover { background: rgba(124,58,237,0.2); }

    /* INPUT */
    .ai-input-row {
      padding: 0.8rem 1rem; border-top: 1px solid #1e1e30;
      display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0;
    }
    .ai-input {
      flex: 1; background: #13131f; border: 1px solid #1e1e30;
      border-radius: 999px; padding: 0.55rem 1rem;
      color: #e2e2ff; font-family: sans-serif; font-size: 0.84rem;
      outline: none; transition: border-color 0.2s;
    }
    .ai-input:focus { border-color: #7c3aed; }
    .ai-input::placeholder { color: #6b6b8a; }
    .ai-voice-btn {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0; transition: all 0.2s;
    }
    .ai-voice-btn:hover { background: rgba(124,58,237,0.3); }
    .ai-voice-btn.listening { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); animation: voicePulse 0.8s ease-in-out infinite; }
    @keyframes voicePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    .ai-send-btn {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; flex-shrink: 0; transition: transform 0.2s;
    }
    .ai-send-btn:hover { transform: scale(1.1); }
    .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ONBOARDING STEPS */
    .ai-steps-card {
      background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2);
      border-radius: 10px; padding: 0.8rem; margin-top: 0.5rem;
    }
    .ai-step-row { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.5rem; }
    .ai-step-row:last-child { margin-bottom: 0; }
    .ai-step-num {
      width: 20px; height: 20px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: #fff; font-size: 0.65rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
    }
    .ai-step-text { font-size: 0.78rem; color: #e2e2ff; line-height: 1.4; }

    /* ALERT BANNER */
    #qgo-ai-alert {
      position: fixed; top: 5rem; left: 50%; transform: translateX(-50%);
      z-index: 8999; background: #13131f; border: 1px solid rgba(251,191,36,0.4);
      border-radius: 12px; padding: 0.7rem 1.2rem;
      display: flex; align-items: center; gap: 0.7rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      font-family: sans-serif; font-size: 0.82rem; color: #fbbf24;
      max-width: calc(100vw - 3rem); opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    }
    #qgo-ai-alert.show { opacity: 1; }
    #qgo-ai-alert .alert-icon { font-size: 1.2rem; flex-shrink: 0; }
    #qgo-ai-alert .alert-close { margin-left: auto; background: none; border: none; color: #6b6b8a; cursor: pointer; font-size: 1rem; pointer-events: all; }
  `;
  document.head.appendChild(style);

  // ── INJECT HTML ──
  var container = document.createElement('div');
  container.innerHTML = `
    <button id="qgo-ai-btn" title="AI Assistant">
      🤖
      <div class="ai-notif">AI</div>
    </button>

    <div id="qgo-ai-window">
      <div class="ai-header">
        <div class="ai-avatar">🤖</div>
        <div class="ai-header-info">
          <div class="ai-header-name">QGo Assistant</div>
          <div class="ai-header-status">Online · English / हिंदी / తెలుగు</div>
        </div>
        <div class="ai-header-right">
          <button class="ai-lang-btn" onclick="qgoAI.cycleLang()" title="Change language">🌐</button>
          <button class="ai-close-btn" id="qgo-ai-close">✕</button>
        </div>
      </div>
      <div class="ai-messages" id="qgo-ai-msgs"></div>
      <div class="ai-quick" id="qgo-ai-quick">
        <button class="ai-qbtn" onclick="qgoAI.ask('How do I join a queue?')">How to join?</button>
        <button class="ai-qbtn" onclick="qgoAI.ask('मुझे queue कैसे join करनी है?')">हिंदी में बताएं</button>
        <button class="ai-qbtn" onclick="qgoAI.ask('Queue ఎలా join చేయాలి?')">తెలుగులో చెప్పు</button>
        <button class="ai-qbtn" onclick="qgoAI.ask('I missed my turn, what do I do?')">Missed my turn?</button>
        <button class="ai-qbtn" onclick="qgoAI.ask('I am new here, guide me step by step')">Guide me 👋</button>
        <button class="ai-qbtn" onclick="qgoAI.ask('I am in a hurry')">I'm in a hurry ⚡</button>
      </div>
      <div class="ai-input-row">
        <input class="ai-input" id="qgo-ai-input" placeholder="Type or speak your question..." onkeydown="if(event.key==='Enter')qgoAI.send()"/>
        <button class="ai-voice-btn" id="qgo-voice-btn" onclick="qgoAI.toggleVoice()" title="Speak">🎤</button>
        <button class="ai-send-btn" id="qgo-send-btn" onclick="qgoAI.send()">➤</button>
      </div>
    </div>

    <div id="qgo-ai-alert">
      <div class="alert-icon" id="alertIcon">⚠️</div>
      <div id="alertText">Queue is moving slower than usual</div>
      <button class="alert-close" onclick="qgoAI.hideAlert()">✕</button>
    </div>
  `;
  document.body.appendChild(container);

  // ── GLOBAL AI OBJECT ──
  window.qgoAI = {
    isOpen: false,
    isLoading: false,
    history: [],
    recognition: null,
    isListening: false,
    currentLang: 'auto',
    langs: ['auto', 'en-IN', 'hi-IN', 'te-IN'],
    langNames: ['Auto', 'EN', 'हिं', 'తె'],
    langIndex: 0,
    alertTimer: null,

    init: function() {
      var self = this;
      document.getElementById('qgo-ai-btn').addEventListener('click', function() { self.toggle(); });
      document.getElementById('qgo-ai-close').addEventListener('click', function() { self.close(); });
      // Setup voice
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SR();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';
        this.recognition.onresult = function(e) {
          var transcript = Array.from(e.results).map(function(r){return r[0].transcript;}).join('');
          document.getElementById('qgo-ai-input').value = transcript;
          if (e.results[0].isFinal) { self.isListening=false; self.updateVoiceBtn(); self.send(); }
        };
        this.recognition.onend = function() { self.isListening=false; self.updateVoiceBtn(); };
        this.recognition.onerror = function() { self.isListening=false; self.updateVoiceBtn(); };
      } else {
        document.getElementById('qgo-voice-btn').style.display = 'none';
      }
    },

    toggle: function() { this.isOpen ? this.close() : this.open(); },

    open: function() {
      this.isOpen = true;
      document.getElementById('qgo-ai-window').classList.add('open');
      document.getElementById('qgo-ai-btn').querySelector('.ai-notif').style.display = 'none';
      if (this.history.length === 0) {
        var self = this;
        setTimeout(function() {
          self.addBot("Hello! 👋 I'm your QGo AI assistant. I can help you in English, हिंदी, or తెలుగు.\n\nI'm here to guide you — whether you're joining a queue for the first time, running late, or just need help. What can I do for you?");
        }, 300);
      }
      setTimeout(function(){ document.getElementById('qgo-ai-input').focus(); }, 400);
    },

    close: function() {
      this.isOpen = false;
      document.getElementById('qgo-ai-window').classList.remove('open');
    },

    ask: function(q) {
      document.getElementById('qgo-ai-input').value = q;
      this.send();
      document.getElementById('qgo-ai-quick').style.display = 'none';
    },

    send: async function() {
      if (this.isLoading) return;
      var input = document.getElementById('qgo-ai-input');
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      this.addUser(msg);
      this.history.push({ role:'user', content: msg });
      this.showTyping();
      this.isLoading = true;
      document.getElementById('qgo-send-btn').disabled = true;

      // Build context with live queue data if available
      var contextMsg = msg;
      if (window._qgoLiveContext) {
        contextMsg = msg + '\n\n[LIVE CONTEXT: ' + window._qgoLiveContext + ']';
      }
      var messagesForAPI = this.history.slice(0,-1).concat([{role:'user',content:contextMsg}]);

      try {
        var res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: messagesForAPI
          })
        });
        var data = await res.json();
        var reply = data.content && data.content[0] ? data.content[0].text : "Sorry, I couldn't get a response right now. Please try again!";
        this.hideTyping();
        this.addBot(reply);
        this.history.push({ role:'assistant', content: reply });
      } catch(e) {
        this.hideTyping();
        this.addBot("Oops! Connection issue. Please check your internet and try again 🙏");
      }
      this.isLoading = false;
      document.getElementById('qgo-send-btn').disabled = false;
    },

    addBot: function(text) {
      var msgs = document.getElementById('qgo-ai-msgs');
      var div = document.createElement('div');
      div.className = 'ai-msg bot';
      div.innerHTML = '<div class="msg-av">🤖</div><div class="ai-bubble">' + this.formatMsg(text) + '</div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    addUser: function(text) {
      var msgs = document.getElementById('qgo-ai-msgs');
      var div = document.createElement('div');
      div.className = 'ai-msg user';
      div.innerHTML = '<div class="ai-bubble">' + this.esc(text) + '</div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    showTyping: function() {
      var msgs = document.getElementById('qgo-ai-msgs');
      var div = document.createElement('div');
      div.className = 'ai-msg bot'; div.id = 'ai-typing';
      div.innerHTML = '<div class="msg-av">🤖</div><div class="ai-typing"><span></span><span></span><span></span></div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    hideTyping: function() { var el=document.getElementById('ai-typing'); if(el) el.remove(); },

    formatMsg: function(text) {
      // Convert **bold** and line breaks
      return this.esc(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    },

    esc: function(t) {
      return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },

    // VOICE INPUT
    toggleVoice: function() {
      if (!this.recognition) return;
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      } else {
        this.recognition.lang = this.currentLang === 'auto' ? 'en-IN' : this.currentLang;
        this.recognition.start();
        this.isListening = true;
        document.getElementById('qgo-ai-input').placeholder = '🎤 Listening... speak now';
      }
      this.updateVoiceBtn();
    },

    updateVoiceBtn: function() {
      var btn = document.getElementById('qgo-voice-btn');
      if (this.isListening) {
        btn.classList.add('listening');
        btn.textContent = '🔴';
      } else {
        btn.classList.remove('listening');
        btn.textContent = '🎤';
        document.getElementById('qgo-ai-input').placeholder = 'Type or speak your question...';
      }
    },

    // LANGUAGE CYCLE
    cycleLang: function() {
      this.langIndex = (this.langIndex+1) % this.langs.length;
      this.currentLang = this.langs[this.langIndex];
      if (this.recognition) this.recognition.lang = this.currentLang==='auto'?'en-IN':this.currentLang;
      var btn = document.querySelector('.ai-lang-btn');
      if (btn) btn.textContent = '🌐 '+this.langNames[this.langIndex];
    },

    // ALERT SYSTEM
    showAlert: function(icon, text, duration) {
      document.getElementById('alertIcon').textContent = icon||'⚠️';
      document.getElementById('alertText').textContent = text;
      var el = document.getElementById('qgo-ai-alert');
      el.classList.add('show');
      el.style.pointerEvents = 'all';
      if (this.alertTimer) clearTimeout(this.alertTimer);
      if (duration) { var self=this; this.alertTimer=setTimeout(function(){self.hideAlert();},duration); }
    },

    hideAlert: function() {
      var el=document.getElementById('qgo-ai-alert');
      el.classList.remove('show');
      el.style.pointerEvents='none';
    },

    // SMART QUEUE MONITORING - call this with live data
    monitorQueue: function(position, etaMins, avgSpeed, queueLength) {
      // Slow queue alert
      if (avgSpeed > 8 && queueLength > 5) {
        this.showAlert('🐢','Queue moving slower than usual — you may want to explore nearby','8000');
        // Update live context for AI
        window._qgoLiveContext = 'User is at position '+position+', ~'+etaMins+' min wait, queue is moving slowly (avg '+avgSpeed.toFixed(1)+' min/person), '+queueLength+' people waiting';
      }
      // Crowd spike alert
      if (queueLength > 15) {
        this.showAlert('👥','Busy right now! '+queueLength+' people in queue — expect longer wait','6000');
      }
      // Good time alert
      if (queueLength <= 2 && position <= 2) {
        this.showAlert('✅','Almost your turn — please start heading back!','5000');
      }
      // Update context
      window._qgoLiveContext = 'User position: #'+position+', ETA: ~'+etaMins+' mins, queue length: '+queueLength+', avg per person: '+avgSpeed.toFixed(1)+' min';
    }
  };

  // Initialize
  window.qgoAI.init();

})();
