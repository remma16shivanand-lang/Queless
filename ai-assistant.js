/* ═══════════════════════════════════════════
   QGo AI Assistant v3.0 — Fixed & Enhanced
   - Multilingual: English, Hindi, Telugu
   - Voice input support
   - Smart queue monitoring alerts
   - Step-by-step onboarding
   - Works correctly from browser
   Usage: <script src="ai-assistant.js"></script>
═══════════════════════════════════════════ */
(function() {

  var SYSTEM_PROMPT = `You are QGo's friendly AI assistant. QGo is a smart digital queue management app that gives people their time back.

LANGUAGE RULES:
- Auto-detect the user's language from their message
- If they write in Hindi → respond fully in Hindi
- If they write in Telugu → respond fully in Telugu  
- If they write in English → respond in English
- If they mix languages → match their dominant language
- Always be warm, simple, and clear

YOUR KNOWLEDGE ABOUT QGo:
- Users scan a QR code or open a link to join a queue
- They enter their name, select queue type (General/Emergency/Follow-up)
- They get a token like G001, E001, F001
- They can walk away freely and come back when called
- When called: screen flashes, confetti, sound, vibration
- Grace period: countdown timer if they miss their turn
- "I'm On My Way" button holds their slot extra time
- Smart Delay Mode: traffic/parking/need 2 mins options
- Priority Re-entry: if missed, they come back near front not end
- Safe indicator: Green=safe to explore, Yellow=come back soon, Red=stay now
- Nearby suggestions: what to do during wait matched to ETA
- Businesses register free at register.html, go live instantly
- Each business has isolated queue — hospital ≠ restaurant queue
- Admin panel at admin.html?biz=SLUG
- Super admin at superadmin.html

ONBOARDING FOR NEW USERS (use when they seem confused):
Step 1: Make sure you have the QR link from the business
Step 2: Enter your name in the box
Step 3: Pick your queue type
Step 4: Tap "Get My Token"  
Step 5: See your position — you can walk away now!
Step 6: Enable notifications so we alert you
Step 7: When position reaches 1 or you're called — head back!

EMOTION + INTENT:
- "hurry/urgent/emergency" → suggest Emergency queue, fastest path
- "tired/unwell/sick" → extra gentle tone, suggest Emergency queue
- "confused/don't understand/new" → step by step guidance
- "angry/frustrated/long wait" → empathize first, then help
- "running late/stuck in traffic" → explain Smart Delay Mode

COMMON ISSUES:
- Token not moving → queue position is live, check number on screen
- Missed turn → Priority Re-entry keeps you near front, tap "I'm on my way"  
- How long wait → AI estimates from real speed, shown as range
- App not working → refresh the page, check internet
- Want to cancel → tap Leave Queue button (lose spot)

Keep responses SHORT and friendly. Use emojis naturally. Never use technical jargon.`;

  // ── STYLES ──
  var css = document.createElement('style');
  css.textContent = `
    #qai-btn{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9000;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 4px 24px rgba(124,58,237,0.5);transition:transform 0.2s,box-shadow 0.2s;}
    #qai-btn:hover{transform:scale(1.1);box-shadow:0 4px 36px rgba(124,58,237,0.7);}
    #qai-btn .qai-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid #080810;display:flex;align-items:center;justify-content:center;font-size:7px;color:#fff;font-weight:700;animation:qaiPulse 2s infinite;}
    @keyframes qaiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}

    #qai-win{position:fixed;bottom:5rem;right:1.5rem;z-index:9001;width:350px;max-width:calc(100vw - 2rem);background:#0f0f1a;border:1px solid #2a1f4e;border-radius:20px;overflow:hidden;box-shadow:0 8px 48px rgba(124,58,237,0.3);display:none;flex-direction:column;max-height:540px;}
    #qai-win.open{display:flex;animation:qaiUp 0.3s ease;}
    @keyframes qaiUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}

    .qai-hdr{background:linear-gradient(135deg,#7c3aed,#a855f7);padding:1rem 1.2rem;display:flex;align-items:center;gap:0.7rem;flex-shrink:0;}
    .qai-av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
    .qai-hdr-info{flex:1;}
    .qai-hdr-name{font-weight:700;font-size:0.88rem;color:#fff;font-family:sans-serif;}
    .qai-hdr-status{font-size:0.68rem;color:rgba(255,255,255,0.75);margin-top:0.1rem;display:flex;align-items:center;gap:0.3rem;}
    .qai-hdr-status::before{content:'';width:5px;height:5px;background:#22c55e;border-radius:50%;display:inline-block;}
    .qai-hdr-btns{display:flex;gap:0.4rem;align-items:center;}
    .qai-lang{background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:0.65rem;padding:0.2rem 0.5rem;border-radius:999px;cursor:pointer;font-weight:600;}
    .qai-close{background:none;border:none;color:rgba(255,255,255,0.7);font-size:1rem;cursor:pointer;padding:0.2rem;}
    .qai-close:hover{color:#fff;}

    .qai-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.65rem;max-height:320px;}
    .qai-msgs::-webkit-scrollbar{width:3px;}
    .qai-msgs::-webkit-scrollbar-thumb{background:#2a1f4e;border-radius:2px;}

    .qai-msg{display:flex;gap:0.5rem;align-items:flex-end;animation:qaiMsgIn 0.2s ease;}
    @keyframes qaiMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .qai-msg.user{flex-direction:row-reverse;}
    .qai-bbl{max-width:82%;padding:0.6rem 0.85rem;border-radius:14px;font-size:0.82rem;line-height:1.55;font-family:sans-serif;}
    .qai-msg.bot .qai-bbl{background:#1e1e30;color:#e2e2ff;border-bottom-left-radius:4px;}
    .qai-msg.user .qai-bbl{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-bottom-right-radius:4px;}
    .qai-av-sm{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:0.65rem;flex-shrink:0;}

    .qai-typing{display:flex;gap:3px;padding:0.6rem 0.85rem;background:#1e1e30;border-radius:14px;border-bottom-left-radius:4px;width:fit-content;}
    .qai-typing span{width:5px;height:5px;background:#6b6b8a;border-radius:50%;animation:qaiDot 1.2s infinite;}
    .qai-typing span:nth-child(2){animation-delay:0.2s;}
    .qai-typing span:nth-child(3){animation-delay:0.4s;}
    @keyframes qaiDot{0%,60%,100%{transform:translateY(0);background:#6b6b8a}30%{transform:translateY(-4px);background:#a855f7}}

    .qai-quick{padding:0.5rem 1rem;display:flex;flex-wrap:wrap;gap:0.35rem;border-top:1px solid #1e1e30;flex-shrink:0;}
    .qai-qbtn{background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);color:#c084fc;border-radius:999px;padding:0.28rem 0.65rem;font-size:0.68rem;font-weight:500;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:sans-serif;}
    .qai-qbtn:hover{background:rgba(124,58,237,0.22);}

    .qai-input-row{padding:0.75rem 1rem;border-top:1px solid #1e1e30;display:flex;gap:0.45rem;align-items:center;flex-shrink:0;}
    .qai-input{flex:1;background:#13131f;border:1px solid #1e1e30;border-radius:999px;padding:0.5rem 0.9rem;color:#e2e2ff;font-family:sans-serif;font-size:0.82rem;outline:none;transition:border-color 0.2s;}
    .qai-input:focus{border-color:#7c3aed;}
    .qai-input::placeholder{color:#6b6b8a;}
    .qai-mic{width:32px;height:32px;border-radius:50%;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;transition:all 0.2s;}
    .qai-mic:hover{background:rgba(124,58,237,0.25);}
    .qai-mic.on{background:rgba(239,68,68,0.2);border-color:rgba(239,68,68,0.4);animation:micPulse 0.8s ease-in-out infinite;}
    @keyframes micPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    .qai-send{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;transition:transform 0.2s;}
    .qai-send:hover{transform:scale(1.1);}
    .qai-send:disabled{opacity:0.45;cursor:not-allowed;transform:none;}

    #qai-alert{position:fixed;top:5rem;left:50%;transform:translateX(-50%);z-index:8999;background:#13131f;border:1px solid rgba(251,191,36,0.4);border-radius:12px;padding:0.65rem 1.1rem;display:flex;align-items:center;gap:0.65rem;box-shadow:0 4px 24px rgba(0,0,0,0.4);font-family:sans-serif;font-size:0.8rem;color:#fbbf24;max-width:calc(100vw - 3rem);opacity:0;transition:opacity 0.3s;pointer-events:none;}
    #qai-alert.show{opacity:1;pointer-events:all;}
    #qai-alert .qa-close{margin-left:auto;background:none;border:none;color:#6b6b8a;cursor:pointer;font-size:1rem;}
  `;
  document.head.appendChild(css);

  // ── HTML ──
  var wrap = document.createElement('div');
  wrap.innerHTML = `
    <button id="qai-btn" title="QGo AI Assistant">🤖<div class="qai-dot">AI</div></button>
    <div id="qai-win">
      <div class="qai-hdr">
        <div class="qai-av">🤖</div>
        <div class="qai-hdr-info">
          <div class="qai-hdr-name">QGo Assistant</div>
          <div class="qai-hdr-status">Online · EN / हिं / తె</div>
        </div>
        <div class="qai-hdr-btns">
          <button class="qai-lang" id="qai-lang-btn" onclick="QAI.cycleLang()">🌐 Auto</button>
          <button class="qai-close" onclick="QAI.close()">✕</button>
        </div>
      </div>
      <div class="qai-msgs" id="qai-msgs"></div>
      <div class="qai-quick" id="qai-quick">
        <button class="qai-qbtn" onclick="QAI.ask('How do I join a queue?')">How to join?</button>
        <button class="qai-qbtn" onclick="QAI.ask('Guide me step by step, I am new')">Guide me 👋</button>
        <button class="qai-qbtn" onclick="QAI.ask('I missed my turn what do I do')">Missed turn?</button>
        <button class="qai-qbtn" onclick="QAI.ask('मुझे queue join करनी है, मदद करो')">हिंदी में</button>
        <button class="qai-qbtn" onclick="QAI.ask('Queue join చేయడం ఎలా చెప్పు')">తెలుగు లో</button>
        <button class="qai-qbtn" onclick="QAI.ask('I am in a hurry, what is the fastest option')">In a hurry ⚡</button>
      </div>
      <div class="qai-input-row">
        <input class="qai-input" id="qai-input" placeholder="Type or speak..." onkeydown="if(event.key==='Enter')QAI.send()"/>
        <button class="qai-mic" id="qai-mic" onclick="QAI.toggleVoice()" title="Speak">🎤</button>
        <button class="qai-send" id="qai-send" onclick="QAI.send()">➤</button>
      </div>
    </div>
    <div id="qai-alert">
      <span id="qai-alert-icon">⚠️</span>
      <span id="qai-alert-text">Queue is moving slower than usual</span>
      <button class="qa-close" onclick="QAI.hideAlert()">✕</button>
    </div>
  `;
  document.body.appendChild(wrap);

  // ── MAIN OBJECT ──
  window.QAI = {
    open: false,
    busy: false,
    history: [],
    recog: null,
    listening: false,
    langIdx: 0,
    langs: ['Auto','EN','हिं','తె'],
    speechLangs: ['en-IN','en-IN','hi-IN','te-IN'],
    alertT: null,

    init: function() {
      var self = this;
      document.getElementById('qai-btn').addEventListener('click', function(){ self.toggle(); });
      // Voice setup
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        this.recog = new SR();
        this.recog.continuous = false;
        this.recog.interimResults = true;
        this.recog.lang = 'en-IN';
        this.recog.onresult = function(e) {
          var t = Array.from(e.results).map(function(r){return r[0].transcript;}).join('');
          document.getElementById('qai-input').value = t;
          if (e.results[0].isFinal) { self.listening=false; self.updateMic(); self.send(); }
        };
        this.recog.onend = function(){ self.listening=false; self.updateMic(); };
        this.recog.onerror = function(){ self.listening=false; self.updateMic(); };
      } else {
        document.getElementById('qai-mic').style.display='none';
      }
    },

    toggle: function(){ this.open ? this.close() : this.openChat(); },

    openChat: function() {
      this.open = true;
      document.getElementById('qai-win').classList.add('open');
      document.getElementById('qai-btn').querySelector('.qai-dot').style.display='none';
      var self = this;
      if (this.history.length === 0) {
        setTimeout(function(){
          self.addBot("Hey! 👋 I'm your QGo AI assistant.\n\nI can help you in English, हिंदी, or తెలుగు. Just type or tap the 🎤 mic to speak!\n\nWhat do you need help with?");
        }, 300);
      }
      setTimeout(function(){ document.getElementById('qai-input').focus(); }, 400);
    },

    close: function() {
      this.open = false;
      document.getElementById('qai-win').classList.remove('open');
    },

    ask: function(q) {
      if (!this.open) this.openChat();
      document.getElementById('qai-input').value = q;
      document.getElementById('qai-quick').style.display = 'none';
      this.send();
    },

    send: async function() {
      if (this.busy) return;
      var inp = document.getElementById('qai-input');
      var msg = inp.value.trim();
      if (!msg) return;
      inp.value = '';
      if (!this.open) this.openChat();

      this.addUser(msg);
      this.history.push({ role:'user', content: msg + (window._qgoCtx ? '\n\n[Live queue context: '+window._qgoCtx+']' : '') });
      this.showTyping();
      this.busy = true;
      document.getElementById('qai-send').disabled = true;

      try {
        var resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-calls': 'true'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            system: SYSTEM_PROMPT,
            messages: this.history.slice(-10)
          })
        });

        if (!resp.ok) {
          var errData = await resp.json().catch(function(){ return {}; });
          throw new Error(errData.error ? errData.error.message : 'Status '+resp.status);
        }

        var data = await resp.json();
        var reply = (data.content && data.content[0] && data.content[0].text)
          ? data.content[0].text
          : "Sorry, I couldn't get a response. Please try again!";

        this.hideTyping();
        this.addBot(reply);
        this.history.push({ role:'assistant', content: reply });

      } catch(err) {
        this.hideTyping();
        // Friendly error message
        var errMsg = "I'm having a little trouble connecting right now 🙏\n\nFor quick help:\n• Check your internet connection\n• Try refreshing the page\n• Or tap any quick button above to try again!";
        if (err.message && err.message.includes('401')) {
          errMsg = "Authentication issue — the API key needs to be configured. Please contact the QGo team!";
        }
        this.addBot(errMsg);
        console.warn('QGo AI error:', err.message);
      }

      this.busy = false;
      document.getElementById('qai-send').disabled = false;
    },

    addBot: function(text) {
      var c = document.getElementById('qai-msgs');
      var d = document.createElement('div');
      d.className = 'qai-msg bot';
      d.innerHTML = '<div class="qai-av-sm">🤖</div><div class="qai-bbl">' + this.fmt(text) + '</div>';
      c.appendChild(d);
      c.scrollTop = c.scrollHeight;
    },

    addUser: function(text) {
      var c = document.getElementById('qai-msgs');
      var d = document.createElement('div');
      d.className = 'qai-msg user';
      d.innerHTML = '<div class="qai-bbl">' + this.esc(text) + '</div>';
      c.appendChild(d);
      c.scrollTop = c.scrollHeight;
    },

    showTyping: function() {
      var c = document.getElementById('qai-msgs');
      var d = document.createElement('div');
      d.className = 'qai-msg bot'; d.id = 'qai-t';
      d.innerHTML = '<div class="qai-av-sm">🤖</div><div class="qai-typing"><span></span><span></span><span></span></div>';
      c.appendChild(d);
      c.scrollTop = c.scrollHeight;
    },

    hideTyping: function() { var e=document.getElementById('qai-t'); if(e) e.remove(); },

    fmt: function(t) {
      return this.esc(t)
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
        .replace(/\n/g,'<br>');
    },

    esc: function(t) {
      return String(t)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;');
    },

    toggleVoice: function() {
      if (!this.recog) return;
      if (this.listening) {
        this.recog.stop();
      } else {
        this.recog.lang = this.speechLangs[this.langIdx];
        try {
          this.recog.start();
          this.listening = true;
          document.getElementById('qai-input').placeholder = '🎤 Listening... speak now';
        } catch(e) {
          console.warn('Voice error:', e);
        }
      }
      this.updateMic();
    },

    updateMic: function() {
      var btn = document.getElementById('qai-mic');
      if (this.listening) {
        btn.classList.add('on'); btn.textContent='🔴';
      } else {
        btn.classList.remove('on'); btn.textContent='🎤';
        document.getElementById('qai-input').placeholder='Type or speak...';
      }
    },

    cycleLang: function() {
      this.langIdx = (this.langIdx+1) % this.langs.length;
      if (this.recog) this.recog.lang = this.speechLangs[this.langIdx];
      document.getElementById('qai-lang-btn').textContent = '🌐 '+this.langs[this.langIdx];
    },

    // Call this with live queue data to enable smart alerts + context
    updateQueueContext: function(pos, eta, qLen, avgSpeed) {
      window._qgoCtx = 'Position:'+pos+', ETA:~'+eta+'min, Queue length:'+qLen+', Avg speed:'+avgSpeed+'min/person';
      // Smart alerts
      if (avgSpeed > 9 && qLen > 4) {
        this.showAlert('🐢','Queue moving slower than usual — good time to explore nearby!', 8000);
      } else if (qLen > 20) {
        this.showAlert('👥','Very busy right now — '+qLen+' people waiting', 6000);
      } else if (pos <= 2) {
        this.showAlert('🔔','Almost your turn — please start heading back!', 5000);
      }
    },

    showAlert: function(icon, text, ms) {
      document.getElementById('qai-alert-icon').textContent = icon;
      document.getElementById('qai-alert-text').textContent = text;
      var el = document.getElementById('qai-alert');
      el.classList.add('show');
      if (this.alertT) clearTimeout(this.alertT);
      if (ms) { var s=this; this.alertT=setTimeout(function(){ s.hideAlert(); }, ms); }
    },

    hideAlert: function() {
      document.getElementById('qai-alert').classList.remove('show');
    }
  };

  QAI.init();

})();
