/* ============================================================
   TradeLink — Consumer & Seller Direct Messages Page
   Split pane messaging interface with supplier negotiation.
   ============================================================ */
import { useState } from 'react';
import {
  Send, Search, ShieldCheck, CheckCheck, Paperclip,
  ChevronLeft, ArrowLeft, Phone, MoreVertical, Building2, Package
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { MOCK_CONVERSATIONS } from '../../utils/constants';
import './ConsumerPages.css';

export default function ConsumerMessages() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0].id);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatView, setMobileChatView] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeId) || conversations[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buyer',
      text: inputText.trim(),
      time: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            lastMessage: newMessage.text,
            lastTime: 'Just now',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );
    setInputText('');
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setMobileChatView(true);
    // clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell role="consumer">
      <div className="messages-layout-card card animate-fade-in-up">
        {/* Left Pane: Conversation List */}
        <div className={`conversations-sidebar ${mobileChatView ? 'hidden-on-mobile' : ''}`}>
          <div className="conversations-sidebar-header">
            <h2 className="messages-title">Messages & Quotes</h2>
            <div className="messages-search-box">
              <Search size={16} className="messages-search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="messages-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-scroll-list">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  className={`conversation-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="conv-avatar">
                    {conv.avatar}
                    {conv.online && <span className="online-indicator"></span>}
                  </div>

                  <div className="conv-content">
                    <div className="conv-row-top">
                      <h4 className="conv-name">{conv.participantName}</h4>
                      <span className="conv-time">{conv.lastTime}</span>
                    </div>
                    <div className="conv-rfq-tag truncate">
                      <Package size={12} /> {conv.rfqTitle}
                    </div>
                    <p className="conv-last-msg truncate">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="unread-pill">{conv.unreadCount}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat View */}
        <div className={`chat-main-pane ${!mobileChatView ? 'hidden-on-mobile' : ''}`}>
          {/* Active Chat Header */}
          <div className="chat-header">
            <button
              className="chat-back-mobile-btn"
              onClick={() => setMobileChatView(false)}
            >
              <ArrowLeft size={20} />
            </button>

            <div className="chat-header-avatar">
              {activeConv.avatar}
            </div>

            <div className="chat-header-info">
              <div className="chat-header-name-row">
                <h3 className="chat-header-name">{activeConv.participantName}</h3>
                <span className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  <ShieldCheck size={12} /> Verified Supplier
                </span>
              </div>
              <span className="chat-header-rfq">
                Re: {activeConv.rfqTitle}
              </span>
            </div>

            <div className="chat-header-actions">
              <button className="btn btn-ghost btn-sm btn-icon" title="Call supplier">
                <Phone size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="chat-messages-area">
            {activeConv.messages.map((m) => {
              const isMe = m.sender === 'buyer';
              return (
                <div key={m.id} className={`message-bubble-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                  <div className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    <p className="message-text">{m.text}</p>
                    <div className="message-meta">
                      <span className="message-time">{m.time}</span>
                      {isMe && <CheckCheck size={14} className="message-read-check" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <button type="button" className="btn btn-ghost btn-icon" title="Attach document or invoice">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              className="chat-input-field"
              placeholder="Type your message, query or price proposal..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-icon" title="Send message">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
