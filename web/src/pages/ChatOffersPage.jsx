/**
 * @file apps/web/src/pages/ChatOffersPage.jsx
 * @description Master Peer-to-Peer Chat & Price Negotiation Center with interactive
 * Offer Cards, counter-proposals, instant status updates, and messaging thread.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function ChatOffersPage() {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    makeOffer,
    respondToOffer,
    currentUser,
    isAuthenticated,
    openAuth
  } = useApp();

  const [inputMsg, setInputMsg] = useState('');
  const [offerInputOpen, setOfferInputOpen] = useState(false);
  const [customOfferAmount, setCustomOfferAmount] = useState('');
  const [counterInputOpenForId, setCounterInputOpenForId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');

  if (!isAuthenticated) {
    return (
      <div>
        <Navbar />
        <AuthModal />
        <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
          <h2>Please sign in to access your chats &amp; negotiations</h2>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => openAuth('login')}
          >
            Sign In Now
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(activeChat.id, inputMsg.trim());
    setInputMsg('');
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!customOfferAmount || Number(customOfferAmount) <= 0) return;
    makeOffer(activeChat.id, Number(customOfferAmount));
    setCustomOfferAmount('');
    setOfferInputOpen(false);
  };

  const handleCounterSubmit = (msgId) => {
    if (!counterAmount || Number(counterAmount) <= 0) return;
    respondToOffer(activeChat.id, msgId, 'counter', Number(counterAmount));
    setCounterInputOpenForId(null);
    setCounterAmount('');
  };

  return (
    <div className="chat-page">
      <Navbar />
      <AuthModal />

      <main className="container chat-layout">
        {/* Left Conversations Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Chats &amp; Offers</h2>
            <span className="badge badge-blue">{chats.length} active</span>
          </div>

          <div className="chat-threads-list">
            {chats.map((c) => (
              <div
                key={c.id}
                className={`chat-thread-item ${activeChatId === c.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(c.id)}
              >
                <img
                  src={c.listingImage || c.otherUser.avatar}
                  alt={c.listingTitle}
                  className="chat-thread-thumb"
                />
                <div className="chat-thread-info">
                  <div className="thread-title-row">
                    <strong className="thread-user-name">{c.otherUser.name}</strong>
                    <span className="thread-time">{c.lastTime}</span>
                  </div>
                  <div className="thread-item-name">{c.listingTitle}</div>
                  <p className="thread-last-msg">{c.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Active Conversation Area */}
        <section className="chat-main-area">
          {activeChat ? (
            <>
              {/* Chat Thread Header */}
              <div className="chat-thread-header">
                <div className="thread-header-user">
                  <img
                    src={activeChat.otherUser.avatar}
                    alt={activeChat.otherUser.name}
                    className="thread-header-avatar"
                  />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                      {activeChat.otherUser.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--brand-green)' }}>● Active now</span>
                  </div>
                </div>

                <div className="thread-header-item-card">
                  <img
                    src={activeChat.listingImage}
                    alt={activeChat.listingTitle}
                    className="thread-header-item-img"
                  />
                  <div>
                    <Link to={`/listing/${activeChat.listingId}`} className="header-item-title">
                      {activeChat.listingTitle}
                    </Link>
                    <strong className="header-item-price tabular-nums">
                      ₹{Number(activeChat.listingPrice).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="chat-messages-container">
                {activeChat.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-bubble-row ${m.sender === 'me' ? 'me' : 'other'}`}
                  >
                    {m.type === 'offer' ? (
                      /* Special Interactive Offer Card */
                      <div className="offer-bubble-card">
                        <div className="offer-bubble-header">
                          <span style={{ fontSize: '18px' }}>🤝</span>
                          <div>
                            <strong>Negotiation Offer</strong>
                            <small style={{ display: 'block', color: 'var(--text-muted)' }}>{m.time}</small>
                          </div>
                        </div>

                        <div className="offer-bubble-amount">
                          ₹{Number(m.offerAmount).toLocaleString('en-IN')}
                        </div>

                        <div className="offer-bubble-status">
                          Status: <span className={`offer-status-pill ${m.offerStatus}`}>{m.offerStatus.toUpperCase()}</span>
                        </div>

                        {/* Receiver Actions when pending and not sent by me */}
                        {m.sender !== 'me' && m.offerStatus === 'pending' && (
                          <div className="offer-action-buttons">
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => respondToOffer(activeChat.id, m.id, 'accept')}
                            >
                              ✓ Accept Offer
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => setCounterInputOpenForId(m.id)}
                            >
                              Counter
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626' }}
                              onClick={() => respondToOffer(activeChat.id, m.id, 'decline')}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {counterInputOpenForId === m.id && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                            <input
                              type="number"
                              placeholder="Counter ₹"
                              value={counterAmount}
                              onChange={(e) => setCounterAmount(e.target.value)}
                              style={{ width: '100px', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px' }}
                            />
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              onClick={() => handleCounterSubmit(m.id)}
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Standard Text Message Bubble */
                      <div className="chat-bubble">
                        <p>{m.text}</p>
                        <span className="bubble-time">{m.time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Offer Drawer Bar */}
              {offerInputOpen && (
                <form onSubmit={handleCreateOffer} className="make-offer-bar">
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Propose an Offer:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={customOfferAmount}
                      onChange={(e) => setCustomOfferAmount(e.target.value)}
                      className="offer-quick-input"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                    Send Offer
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => setOfferInputOpen(false)}
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Chat Input Footer */}
              <form onSubmit={handleSend} className="chat-input-footer">
                <button
                  type="button"
                  className="btn-offer-trigger"
                  onClick={() => setOfferInputOpen(!offerInputOpen)}
                  title="Make an Offer"
                >
                  🤝 Offer
                </button>
                <input
                  type="text"
                  placeholder="Type a message to discuss condition, inspection, or pickup..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="chat-text-input"
                />
                <button type="submit" className="btn-primary chat-send-btn" disabled={!inputMsg.trim()}>
                  Send &rarr;
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p>Select a conversation from the sidebar</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style>{`
        .chat-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .chat-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          padding: 24px 16px 60px;
          height: calc(100vh - 120px);
          min-height: 600px;
        }
        .chat-sidebar {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chat-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #E7E5E4;
        }
        .chat-threads-list {
          flex: 1;
          overflow-y: auto;
        }
        .chat-thread-item {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #F8FAFC;
          cursor: pointer;
          transition: background 0.15s;
        }
        .chat-thread-item:hover {
          background: #EEEDE9;
        }
        .chat-thread-item.active {
          background: #EFF6FF;
          border-left: 3px solid var(--brand-blue);
        }
        .chat-thread-thumb {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          object-fit: cover;
        }
        .chat-thread-info {
          flex: 1;
          overflow: hidden;
        }
        .thread-title-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .thread-user-name {
          font-size: 13px;
          color: var(--text-primary);
        }
        .thread-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .thread-item-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--brand-blue);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .thread-last-msg {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 2px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-main-area {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chat-thread-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #E2E8F0;
          background: #F6F5F2;
        }
        .thread-header-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .thread-header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        .thread-header-item-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          padding: 6px 12px;
          border-radius: 10px;
        }
        .thread-header-item-img {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
        }
        .header-item-title {
          font-size: 12px;
          font-weight: 700;
          display: block;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-item-price {
          font-size: 12px;
          color: var(--brand-green);
        }
        .chat-messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #EEEDE9;
        }
        .chat-bubble-row {
          display: flex;
        }
        .chat-bubble-row.me {
          justify-content: flex-end;
        }
        .chat-bubble-row.other {
          justify-content: flex-start;
        }
        .chat-bubble {
          max-width: 65%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        .chat-bubble-row.me .chat-bubble {
          background: var(--brand-blue);
          color: #FBFBFA;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble-row.other .chat-bubble {
          background: #FBFBFA;
          color: var(--text-primary);
          border: 1px solid #E7E5E4;
          border-bottom-left-radius: 4px;
        }
        .bubble-time {
          display: block;
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.7;
          text-align: right;
        }
        .offer-bubble-card {
          background: #FBFBFA;
          border: 2px solid var(--brand-blue);
          border-radius: 12px;
          padding: 16px;
          min-width: 240px;
          box-shadow: 0 4px 12px rgba(21, 72, 166, 0.1);
        }
        .offer-bubble-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .offer-bubble-amount {
          font-size: 22px;
          font-weight: 800;
          color: var(--brand-blue);
          margin-bottom: 6px;
        }
        .offer-bubble-status {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .offer-status-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background: #FEF3C7;
          color: #92400E;
        }
        .offer-status-pill.accepted {
          background: #ECFDF5;
          color: #065F46;
        }
        .offer-status-pill.declined {
          background: #FEE2E2;
          color: #991B1B;
        }
        .offer-action-buttons {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }
        .make-offer-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #EFF6FF;
          border-top: 1px solid #BFDBFE;
          padding: 10px 16px;
        }
        .offer-quick-input {
          padding: 6px 10px;
          border: 1px solid #E7E5E4;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          width: 110px;
        }
        .chat-input-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #E2E8F0;
          background: #FBFBFA;
        }
        .btn-offer-trigger {
          padding: 8px 14px;
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .chat-text-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #E7E5E4;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }
        .chat-send-btn {
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 10px;
        }
        @media (max-width: 800px) {
          .chat-layout {
            grid-template-columns: 1fr;
          }
          .chat-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
