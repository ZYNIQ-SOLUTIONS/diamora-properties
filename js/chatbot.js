document.addEventListener('DOMContentLoaded', () => {
  // Prevent duplicate injection
  if (document.querySelector('.chatbot-container')) return;

  // Inject HTML structure
  const chatbotHTML = `
    <div class="chatbot-container" id="chatbotContainer">
      <div class="chatbot-teaser" id="chatbotTeaser" role="button" aria-label="Open AI Assistant">
        <span class="chatbot-wave-hand">👋</span>
        <span>Need advice? Ask Diamora AI</span>
      </div>

      <button class="chatbot-button" id="chatbotToggle" aria-label="Open Diamora Real Estate AI Assistant">
        <span class="chatbot-icon-chat" id="chatbotIconChat">
          <span class="chatbot-btn-wave">👋</span>
        </span>
        <span class="chatbot-icon-close" id="chatbotIconClose" style="display: none;">&times;</span>
      </button>
      
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <div class="chatbot-status-dot"></div>
            <div>
              <h3>Diamora AI Consultant</h3>
              <div class="chatbot-header-sub">UAE Prime Real Estate Advisory</div>
            </div>
          </div>
          <button class="chatbot-close" id="chatbotClose" aria-label="Close Chat">&times;</button>
        </div>
        
        <div class="chatbot-messages" id="chatbotMessages">
          <div class="chat-message bot">
            Welcome to <strong>Diamora Properties</strong>. I am your private AI real estate consultant. How can I assist you with UAE luxury residences, golden visas, or off-plan allocations today?
          </div>
          <div class="typing-indicator" id="typingIndicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
        
        <form class="chatbot-input-container" id="chatbotForm">
          <input type="text" id="chatbotInput" placeholder="Ask about Dubai & Abu Dhabi prime assets..." autocomplete="off" required>
          <button type="submit" id="chatbotSubmit" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
  const chatWindow = document.getElementById('chatbotWindow');
  const chatForm = document.getElementById('chatbotForm');
  const chatInput = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  const typingIndicator = document.getElementById('typingIndicator');
  const submitBtn = document.getElementById('chatbotSubmit');

  let chatHistory = [];

  // Toggle chat window & update icons
  const openChat = () => {
    chatWindow.classList.add('open');
    if (teaser) teaser.style.display = 'none';
    if (iconChat) iconChat.style.display = 'none';
    if (iconClose) iconClose.style.display = 'block';
    setTimeout(() => {
      if (window.innerWidth > 768) chatInput.focus();
    }, 150);
  };

  const closeChat = () => {
    chatWindow.classList.remove('open');
    if (teaser) teaser.style.display = 'flex';
    if (iconChat) iconChat.style.display = 'block';
    if (iconClose) iconClose.style.display = 'none';
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

  // Add message to UI
  const appendMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    if (sender === 'bot') {
      msgDiv.innerHTML = formatMarkdown(text);
    } else {
      msgDiv.textContent = text;
    }
    messagesContainer.insertBefore(msgDiv, typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage(text, 'user');
    chatInput.value = '';
    
    // Add to history
    chatHistory.push({
      role: 'user',
      parts: [{ text }]
    });

    setTyping(true);
    submitBtn.disabled = true;

    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:5000/api/chat' : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();
      
      if (response.ok && data.text) {
        appendMessage(data.text, 'bot');
        chatHistory.push({
          role: 'model',
          parts: [{ text: data.text }]
        });
      } else {
        appendMessage(data.error || 'Thank you for reaching out. Please connect directly with our advisory team on WhatsApp at +971 50 676 0668.', 'bot');
      }
    } catch (err) {
      console.error('Chat error:', err);
      appendMessage('We are currently assisting multiple private clients. Please message our private office directly on WhatsApp at +971 50 676 0668.', 'bot');
    } finally {
      setTyping(false);
      submitBtn.disabled = false;
      if (window.innerWidth > 768) {
        chatInput.focus();
      }
    }
  });
});
