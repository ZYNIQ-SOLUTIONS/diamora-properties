document.addEventListener('DOMContentLoaded', () => {
  // Inject HTML structure
  const chatbotHTML = `
    <div class="chatbot-container">
      <button class="chatbot-button" id="chatbotToggle">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
      
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <h3>Diamora Assistant</h3>
          <button class="chatbot-close" id="chatbotClose">&times;</button>
        </div>
        
        <div class="chatbot-messages" id="chatbotMessages">
          <div class="chat-message bot">
            Hello! I'm your Diamora Properties assistant. How can I help you find your dream home in the UAE today?
          </div>
          <div class="typing-indicator" id="typingIndicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
        
        <form class="chatbot-input-container" id="chatbotForm">
          <input type="text" id="chatbotInput" placeholder="Type a message..." autocomplete="off" required>
          <button type="submit" id="chatbotSubmit">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  const toggleBtn = document.getElementById('chatbotToggle');
  const closeBtn = document.getElementById('chatbotClose');
  const chatWindow = document.getElementById('chatbotWindow');
  const chatForm = document.getElementById('chatbotForm');
  const chatInput = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  const typingIndicator = document.getElementById('typingIndicator');
  const submitBtn = document.getElementById('chatbotSubmit');

  let chatHistory = [];

  // Toggle chat window
  const toggleChat = () => chatWindow.classList.toggle('open');
  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

  // Add message to UI
  const appendMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    msgDiv.textContent = text;
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
      // Determine API URL based on environment (assuming api is on port 5000 in dev)
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
        appendMessage(data.error || 'Sorry, I am having trouble connecting right now.', 'bot');
      }
    } catch (err) {
      console.error('Chat error:', err);
      appendMessage('Sorry, an error occurred. Please try again later.', 'bot');
    } finally {
      setTyping(false);
      submitBtn.disabled = false;
      // Focus back on input only on desktop (prevent mobile keyboard shifting)
      if (window.innerWidth > 768) {
        chatInput.focus();
      }
    }
  });
});
