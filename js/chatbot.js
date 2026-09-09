document.addEventListener('DOMContentLoaded', () => {
  // Prevent duplicate injection
  if (document.querySelector('.chatbot-container')) return;

  const STORAGE_HISTORY_KEY = 'diamora_chat_history_v2';
  const STORAGE_MSGS_KEY = 'diamora_chat_rendered_v2';
  const STORAGE_OPEN_KEY = 'diamora_chat_is_open_v2';

  const DEFAULT_WELCOME_MSG = 'Welcome to <strong>Diamora Properties</strong>. I am your private AI real estate consultant. How can I assist you with UAE ultra-luxury residences, Golden Visas, or off-plan allocations today?';

  // Detect browser SpeechRecognition support
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const hasSpeechRecognition = !!SpeechRecognitionAPI;
  const hasSpeechSynthesis = !!window.speechSynthesis;

  // Inject HTML structure
  const chatbotHTML = `
    <div class="chatbot-container" id="chatbotContainer">
      <div class="chatbot-teaser" id="chatbotTeaser" role="button" aria-label="Open AI Assistant">
        <span class="chatbot-teaser-badge">AI 24/7</span>
        <span class="chatbot-wave-hand">👋</span>
        <span>Ask Diamora Private AI</span>
      </div>

      <div class="chatbot-btn-wrapper">
        <div class="chatbot-beacon-ring"></div>
        <div class="chatbot-beacon-ring ring-2"></div>
        <button class="chatbot-button" id="chatbotToggle" aria-label="Open Diamora Real Estate AI Assistant">
          <span class="chatbot-icon-chat" id="chatbotIconChat">
            <span class="chatbot-btn-wave">👋</span>
            <span class="chatbot-icon-sparkle">✨</span>
          </span>
          <span class="chatbot-icon-close" id="chatbotIconClose" style="display: none;">&times;</span>
        </button>
      </div>
      
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <div class="chatbot-avatar" id="chatbotAvatar">D</div>
            <div>
              <h3>Diamora AI Concierge</h3>
              <div class="chatbot-header-sub">
                <span class="chatbot-status-dot"></span>
                <span id="chatbotStatusText">Active • Private UAE Advisory</span>
              </div>
            </div>
          </div>
          <div class="chatbot-header-actions">
            <button type="button" class="chatbot-header-btn" id="chatbotReset" title="Start New Conversation / Reset Chat" aria-label="Start New Conversation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button type="button" class="chatbot-close" id="chatbotClose" aria-label="Close Chat">&times;</button>
          </div>
        </div>
        
        <div class="chatbot-messages" id="chatbotMessages">
          <div class="chatbot-suggestions" id="chatbotSuggestions">
            <button type="button" class="chat-chip" data-prompt="Show me prime Palm Jumeirah &amp; waterfront properties">💎 Palm Jumeirah</button>
            <button type="button" class="chat-chip" data-prompt="How do I qualify for the UAE 10-Year Golden Visa via real estate?">🇦🇪 10-Yr Golden Visa</button>
            <button type="button" class="chat-chip" data-prompt="What are the highest-yielding off-plan projects right now?">📈 High-Yield Off-Plan</button>
            <button type="button" class="chat-chip" data-prompt="I want to speak directly with a licensed Diamora private advisor">📞 Human Advisor</button>
          </div>

          <div class="typing-indicator" id="typingIndicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
        
        <form class="chatbot-input-container" id="chatbotForm">
          <input type="text" id="chatbotInput" placeholder="Type your inquiry or select an option above..." autocomplete="off" required>
          ${hasSpeechRecognition ? `
          <button type="button" class="chatbot-voice-btn" id="chatbotVoiceBtn" aria-label="Start voice input" title="Talk to AI">
            <svg id="voiceIconMic" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <svg id="voiceIconStop" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          </button>` : ''}
          <button type="submit" id="chatbotSubmit" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  const toggleBtn = document.getElementById('chatbotToggle');
  const iconChat = document.getElementById('chatbotIconChat');
  const iconClose = document.getElementById('chatbotIconClose');
  const teaser = document.getElementById('chatbotTeaser');
  const closeBtn = document.getElementById('chatbotClose');
  const resetBtn = document.getElementById('chatbotReset');
  const chatWindow = document.getElementById('chatbotWindow');
  const chatForm = document.getElementById('chatbotForm');
  const chatInput = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  const typingIndicator = document.getElementById('typingIndicator');
  const submitBtn = document.getElementById('chatbotSubmit');
  const suggestionsContainer = document.getElementById('chatbotSuggestions');
  const voiceBtn = document.getElementById('chatbotVoiceBtn');
  const voiceIconMic = document.getElementById('voiceIconMic');
  const voiceIconStop = document.getElementById('voiceIconStop');
  const chatbotAvatar = document.getElementById('chatbotAvatar');
  const chatbotStatusText = document.getElementById('chatbotStatusText');

  let chatHistory = [];
  let renderedMessages = [];

  // ============================================================
  // VOICE MODE STATE MACHINE
  // States: 'idle' | 'listening' | 'processing' | 'speaking'
  // ============================================================
  let voiceState = 'idle';
  let recognition = null;
  let currentUtterance = null;
  let voiceAutoRestart = false;

  const setVoiceState = (state) => {
    voiceState = state;

    if (!voiceBtn) return;

    voiceBtn.classList.remove('listening', 'speaking', 'processing');

    switch (state) {
      case 'idle':
        voiceBtn.classList.remove('active');
        if (voiceIconMic) voiceIconMic.style.display = '';
        if (voiceIconStop) voiceIconStop.style.display = 'none';
        voiceBtn.setAttribute('aria-label', 'Start voice input');
        voiceBtn.title = 'Talk to AI';
        chatInput.placeholder = 'Type your inquiry or select an option above...';
        chatInput.disabled = false;
        if (chatbotAvatar) chatbotAvatar.classList.remove('speaking');
        if (chatbotStatusText) chatbotStatusText.textContent = 'Active • Private UAE Advisory';
        break;

      case 'listening':
        voiceBtn.classList.add('active', 'listening');
        if (voiceIconMic) voiceIconMic.style.display = 'none';
        if (voiceIconStop) voiceIconStop.style.display = '';
        voiceBtn.setAttribute('aria-label', 'Stop recording');
        voiceBtn.title = 'Stop recording';
        chatInput.placeholder = '🎙️ Listening… speak now';
        chatInput.disabled = true;
        if (chatbotStatusText) chatbotStatusText.textContent = '🎙️ Listening…';
        break;

      case 'processing':
        voiceBtn.classList.add('processing');
        if (chatbotStatusText) chatbotStatusText.textContent = '⏳ Processing…';
        break;

      case 'speaking':
        voiceBtn.classList.add('speaking');
        if (voiceIconMic) voiceIconMic.style.display = '';
        if (voiceIconStop) voiceIconStop.style.display = 'none';
        if (chatbotAvatar) chatbotAvatar.classList.add('speaking');
        if (chatbotStatusText) chatbotStatusText.textContent = '🔊 Speaking…';
        break;
    }
  };

  // ============================================================
  // SPEECH SYNTHESIS — AI speaks the response aloud
  // ============================================================
  const getBestVoice = (text) => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Detect Arabic content
    const arabicPattern = /[\u0600-\u06FF]/;
    const isArabic = arabicPattern.test(text);

    if (isArabic) {
      // Prefer Arabic voices
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) return arabicVoice;
    }

    // Prefer English premium voices (natural sounding)
    const preferredNames = ['Samantha', 'Karen', 'Daniel', 'Moira', 'Google UK English Female', 'Google US English'];
    for (const name of preferredNames) {
      const found = voices.find(v => v.name.includes(name));
      if (found) return found;
    }

    // Fall back to first English voice
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) return enVoice;

    return voices[0] || null;
  };

  const stripMarkdownForSpeech = (text) => {
    // Remove markdown formatting for cleaner TTS
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/•\s*/g, '')
      .replace(/\n+/g, ' ')
      .replace(/&amp;/g, 'and')
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const speakResponse = (text) => {
    if (!hasSpeechSynthesis) return;

    // Cancel any in-progress speech
    window.speechSynthesis.cancel();

    const cleanText = stripMarkdownForSpeech(text);
    if (!cleanText) return;

    setVoiceState('speaking');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    // Set voice when voices are available
    const assignVoice = () => {
      const voice = getBestVoice(cleanText);
      if (voice) utterance.voice = voice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      assignVoice();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', assignVoice, { once: true });
    }

    // Detect language for utterance
    const arabicPattern = /[\u0600-\u06FF]/;
    utterance.lang = arabicPattern.test(cleanText) ? 'ar-AE' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      currentUtterance = null;
      setVoiceState('idle');
      // Auto-restart listening after AI finishes speaking (continuous mode)
      if (voiceAutoRestart) {
        setTimeout(() => {
          if (voiceState === 'idle' && chatWindow.classList.contains('open')) {
            startListening();
          }
        }, 500);
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e.error);
      currentUtterance = null;
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    voiceAutoRestart = false;
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
  };

  // ============================================================
  // SPEECH RECOGNITION — Client speaks, browser converts to text
  // ============================================================
  const startListening = () => {
    if (!hasSpeechRecognition) return;

    // If currently speaking, stop first
    stopSpeaking();

    // If already listening, stop
    if (voiceState === 'listening' && recognition) {
      stopListening();
      return;
    }

    try {
      recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US'; // Default — Arabic speakers often type/switch naturally

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          setVoiceState('processing');
          chatInput.disabled = false;
          chatInput.value = transcript;
          // Dispatch submit through the existing Gemini pipeline
          chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        } else {
          setVoiceState('idle');
          chatInput.disabled = false;
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        chatInput.disabled = false;
        setVoiceState('idle');

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          appendMessage('🎙️ Microphone access was denied. Please allow mic access in your browser settings and try again.', 'bot');
        } else if (event.error === 'no-speech') {
          // Silent — user just didn't speak, not an error
        } else if (event.error === 'network') {
          appendMessage('Voice recognition requires an internet connection. Please check your connection.', 'bot');
        }
      };

      recognition.onend = () => {
        if (voiceState === 'listening') {
          // Ended without result (e.g. user was silent)
          chatInput.disabled = false;
          setVoiceState('idle');
        }
      };

      recognition.start();

    } catch (err) {
      console.warn('SpeechRecognition could not start:', err);
      chatInput.disabled = false;
      setVoiceState('idle');
    }
  };

  const stopListening = () => {
    voiceAutoRestart = false;
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {}
      recognition = null;
    }
    chatInput.disabled = false;
    setVoiceState('idle');
  };

  // Voice button click handler
  if (voiceBtn) {
    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (voiceState === 'speaking') {
        // Stop AI speaking, go idle
        stopSpeaking();
        setVoiceState('idle');
      } else if (voiceState === 'listening') {
        // Stop listening
        stopListening();
      } else if (voiceState === 'idle') {
        // Start listening
        startListening();
      }
    });
  }

  // Stop voice when chat closes
  const stopVoiceSession = () => {
    stopSpeaking();
    stopListening();
  };

  // Toggle chat window & update icons
  const openChat = () => {
    chatWindow.classList.add('open');
    if (teaser) teaser.style.display = 'none';
    if (iconChat) iconChat.style.display = 'none';
    if (iconClose) iconClose.style.display = 'block';

    sessionStorage.setItem(STORAGE_OPEN_KEY, 'true');
    setTimeout(() => {
      if (window.innerWidth > 768) chatInput.focus();
    }, 150);
  };

  const closeChat = () => {
    stopVoiceSession();
    chatWindow.classList.remove('open');
    if (teaser) teaser.style.display = 'flex';
    if (iconChat) iconChat.style.display = 'flex';
    if (iconClose) iconClose.style.display = 'none';

    sessionStorage.setItem(STORAGE_OPEN_KEY, 'false');
  };

  const toggleChat = () => {
    if (chatWindow.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  };

  toggleBtn.addEventListener('click', toggleChat);
  if (teaser) teaser.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // Tap outside to close chat on mobile & desktop
  document.addEventListener('pointerdown', (e) => {
    if (!chatWindow.classList.contains('open')) return;
    if (chatbotContainer && chatbotContainer.contains(e.target)) return;
    closeChat();
  });

  // ESC key to close chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWindow.classList.contains('open')) {
      closeChat();
    }
  });

  // Quick Chips Click Listener
  if (suggestionsContainer) {
    suggestionsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (!chip) return;
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        chatInput.value = prompt;
        chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }

  // Convert markdown to clean safe HTML for bot replies
  const formatMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points * or -
    html = html.replace(/^\s*[\*\-]\s+(.*)$/gm, '• $1');

    // Line breaks
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return html;
  };

  // Add message to UI and optionally persist
  const appendMessage = (text, sender, persist = true) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    if (sender === 'bot') {
      msgDiv.innerHTML = formatMarkdown(text);
    } else {
      msgDiv.textContent = text;
    }
    
    // Insert before suggestions or typing indicator
    if (suggestionsContainer && suggestionsContainer.parentNode === messagesContainer) {
      messagesContainer.insertBefore(msgDiv, suggestionsContainer);
    } else {
      messagesContainer.insertBefore(msgDiv, typingIndicator);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (persist) {
      renderedMessages.push({ text, sender, time: Date.now() });
      try {
        sessionStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(renderedMessages));
        sessionStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(chatHistory));
      } catch (err) {
        console.warn('Could not persist chat session:', err);
      }
    }
  };

  // Set typing indicator
  const setTyping = (isTyping) => {
    if (isTyping) {
      typingIndicator.classList.add('active');
    } else {
      typingIndicator.classList.remove('active');
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Reset conversation handler
  const resetConversation = () => {
    if (renderedMessages.length > 1 && !confirm('Start a fresh conversation? Current chat history will be cleared.')) {
      return;
    }

    stopVoiceSession();

    try {
      sessionStorage.removeItem(STORAGE_MSGS_KEY);
      sessionStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch (e) {}

    chatHistory = [];
    renderedMessages = [];

    // Remove all message divs
    const oldMessages = messagesContainer.querySelectorAll('.chat-message');
    oldMessages.forEach(el => el.remove());

    // Show initial welcome message
    appendMessage(DEFAULT_WELCOME_MSG, 'bot', true);

    // Re-display suggestion chips
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'flex';
    }
  };

  if (resetBtn) {
    resetBtn.addEventListener('click', resetConversation);
  }

  // Restore conversation from sessionStorage
  const initSessionChat = () => {
    try {
      const storedMsgs = sessionStorage.getItem(STORAGE_MSGS_KEY);
      const storedHistory = sessionStorage.getItem(STORAGE_HISTORY_KEY);
      const wasOpen = sessionStorage.getItem(STORAGE_OPEN_KEY);

      if (storedMsgs) {
        const parsedMsgs = JSON.parse(storedMsgs);
        if (Array.isArray(parsedMsgs) && parsedMsgs.length > 0) {
          renderedMessages = parsedMsgs;
          if (storedHistory) {
            chatHistory = JSON.parse(storedHistory) || [];
          }

          // Render restored messages
          parsedMsgs.forEach(msg => {
            appendMessage(msg.text, msg.sender, false);
          });

          // If user already chatted, hide initial suggestions
          const hasUserMsg = parsedMsgs.some(m => m.sender === 'user');
          if (hasUserMsg && suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
          }

          if (wasOpen === 'true') {
            openChat();
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Error rehydrating chat from sessionStorage:', err);
    }

    // Default first-time view
    appendMessage(DEFAULT_WELCOME_MSG, 'bot', true);
  };

  // Initialize session
  initSessionChat();

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = chatInput.value.trim();
    if (!text) return;

    // Re-enable input in case it was disabled by voice mode
    chatInput.disabled = false;

    // Hide suggestions once user engages
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }

    // Add to history
    chatHistory.push({
      role: 'user',
      parts: [{ text }]
    });

    // Add user message to UI
    appendMessage(text, 'user');
    chatInput.value = '';

    // If in voice mode, update status
    const isVoiceInput = voiceState === 'processing';
    if (isVoiceInput) {
      setVoiceState('processing');
    }

    setTyping(true);
    submitBtn.disabled = true;

    // Capture dynamic client page context
    const pageContext = {
      pageUrl: window.location.href,
      pagePath: window.location.pathname + window.location.search,
      pageTitle: document.title || 'Diamora Properties'
    };

    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:5000/api/chat' : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          context: pageContext
        })
      });

      const data = await response.json();
      
      if (response.ok && data.text) {
        chatHistory.push({
          role: 'model',
          parts: [{ text: data.text }]
        });
        appendMessage(data.text, 'bot');

        // Speak the response aloud if voice was used for the question
        if (isVoiceInput && hasSpeechSynthesis) {
          speakResponse(data.text);
        } else {
          // Ensure state is idle if not in voice flow
          if (voiceState === 'processing') setVoiceState('idle');
        }
      } else {
        const errMsg = data.error || 'Thank you for reaching out. Please connect directly with our advisory team on WhatsApp at +971 50 676 0668.';
        appendMessage(errMsg, 'bot');
        if (isVoiceInput && hasSpeechSynthesis) {
          speakResponse(errMsg);
        } else {
          if (voiceState === 'processing') setVoiceState('idle');
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = 'We are currently assisting multiple private clients. Please message our private office directly on WhatsApp at +971 50 676 0668.';
      appendMessage(errMsg, 'bot');
      if (isVoiceInput && hasSpeechSynthesis) {
        speakResponse(errMsg);
      } else {
        if (voiceState === 'processing') setVoiceState('idle');
      }
    } finally {
      setTyping(false);
      submitBtn.disabled = false;
      if (window.innerWidth > 768 && voiceState === 'idle') {
        chatInput.focus();
      }
    }
  });
});
