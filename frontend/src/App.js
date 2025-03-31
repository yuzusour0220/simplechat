import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// 環境変数から設定を読み込む
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'YOUR_API_ENDPOINT';
const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID || 'YOUR_USER_POOL_ID';
const USER_POOL_CLIENT_ID = process.env.REACT_APP_USER_POOL_CLIENT_ID || 'YOUR_USER_POOL_CLIENT_ID';
const REGION = process.env.REACT_APP_REGION || 'us-east-1';

// Amplify設定
Amplify.configure({
  Auth: {
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: USER_POOL_CLIENT_ID,
  },
});

function ChatInterface({ signOut, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // チャットメッセージ送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      // 認証トークンを取得
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const response = await axios.post(`${API_ENDPOINT}/chat`, {
        message: userMessage,
        conversationHistory: messages
      }, {
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      } else {
        setError('応答の取得に失敗しました');
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(`エラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 会話をクリア
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bedrock LLM チャットボット</h1>
        <div className="header-buttons">
          <button className="clear-button" onClick={clearConversation}>
            会話をクリア
          </button>
          <button className="logout-button" onClick={signOut}>
            ログアウト ({user.username})
          </button>
        </div>
      </header>
      
      <main className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Bedrock Chatbot へようこそ！</h2>
              <p>何でも質問してください。</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            送信
          </button>
        </form>
      </main>
      
      <footer>
        <p>Powered by Amazon Bedrock</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <ChatInterface signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}

export default App;