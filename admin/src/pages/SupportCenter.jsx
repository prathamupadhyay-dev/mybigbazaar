// ============================================================
// macOS Support & Conversations Console
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  LifeBuoy,
  Search,
  ShieldCheck,
  Flag,
  Trash2,
  Send,
  Tag,
  MapPin,
  Folder,
  User,
  Store,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import MetricCard from '../components/charts/MetricCard';
import StatusPill from '../components/common/StatusPill';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function SupportCenter() {
  // Top-level console mode: 'ad_chats' | 'tickets'
  const [consoleMode, setConsoleMode] = useState('ad_chats');

  // ==========================================
  // 1. LIVE AD CHATS & OFFERS STATE
  // ==========================================
  const [conversations, setConversations] = useState([]);
  const [chatMetrics, setChatMetrics] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeOffersCount: 0,
    acceptedDealsCount: 0,
    flaggedCount: 0
  });
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [chatFilter, setChatFilter] = useState('all'); // 'all' | 'offers' | 'accepted' | 'flagged'
  const [chatSearch, setChatSearch] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [composerText, setComposerText] = useState('');
  const [composerRole, setComposerRole] = useState('admin'); // 'admin' | 'seller' | 'buyer'
  const [sendingMsg, setSendingMsg] = useState(false);

  // ==========================================
  // 2. HELPDESK TICKETS STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAdConversations = async () => {
    setLoadingChats(true);
    try {
      const res = await apiFetch('/api/v1/chat/admin/conversations');
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json.data) ? json.data : [];
        setConversations(list);
        if (json.metrics) {
          setChatMetrics(json.metrics);
        } else {
          setChatMetrics({
            totalConversations: list.length,
            totalMessages: list.reduce((acc, c) => acc + (c.messages?.length || 0), 0),
            activeOffersCount: list.filter(
              (c) => c.latestOffer && ['pending', 'countered'].includes(c.latestOffer.status)
            ).length,
            acceptedDealsCount: list.filter((c) => c.latestOffer?.status === 'accepted').length,
            flaggedCount: list.filter((c) => c.status === 'flagged' || c.status === 'blocked').length
          });
        }
        if (list.length > 0 && !selectedConvId) {
          setSelectedConvId(list[0].id || list[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to load live ad conversations:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await apiFetch('/api/v1/support/admin/tickets');
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const raw = Array.isArray(json.data) ? json.data : [];
        const mapped = raw.map((t, idx) => ({
          _id: t._id,
          id: t.ticketId || t._id || `TKT-${1000 + idx}`,
          customer: t.name || 'Verified Member',
          phone: t.phone || '+91 98765 43210',
          email: t.email || 'customer@bigbazaar.com',
          category: (t.category || 'general_enquiry').replace('_', ' ').toUpperCase(),
          subject: t.subject || 'Support Inquiry',
          message: t.message || '',
          priority: t.priority || 'medium',
          slaRemaining: '3h 15m',
          assignedTo: t.assignedTo || 'Support Desk',
          status: t.status || 'open',
          raw: t
        }));
        setTickets(mapped);
      }
    } catch (err) {
      console.warn('Failed to load live support tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadAdConversations();
    loadTickets();
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (chatFilter === 'offers' && !c.latestOffer) return false;
      if (chatFilter === 'accepted' && c.latestOffer?.status !== 'accepted') return false;
      if (chatFilter === 'flagged' && c.status !== 'flagged' && c.status !== 'blocked') return false;

      if (chatSearch.trim()) {
        const q = chatSearch.toLowerCase();
        const hay = `${c.listingTitle || ''} ${c.buyerName || ''} ${c.sellerName || ''} ${c.buyerPhone || ''} ${c.sellerPhone || ''} ${c.listingCategory || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, chatFilter, chatSearch]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => (c.id || c._id) === selectedConvId) ||
      filteredConversations[0] ||
      null
    );
  }, [conversations, filteredConversations, selectedConvId]);

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!composerText.trim() || !activeConversation || sendingMsg) return;

    const cid = activeConversation.id || activeConversation._id;
    const msgText = composerText.trim();
    setComposerText('');
    setSendingMsg(true);

    const senderName =
      composerRole === 'admin'
        ? 'Trust & Safety Admin'
        : composerRole === 'seller'
        ? activeConversation.sellerName || 'Verified Seller'
        : activeConversation.buyerName || 'Buyer';

    const messageType = composerRole === 'admin' ? 'admin_notice' : 'text';

    try {
      const res = await apiFetch(`/api/v1/chat/conversations/${cid}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          text: msgText,
          messageType,
          senderRole: composerRole,
          senderName
        })
      });
      if (res && res.ok) {
        const json = await res.json();
        const createdMsg = json.data;
        if (createdMsg) {
          setConversations((prev) =>
            prev.map((c) =>
              (c.id || c._id) === cid
                ? {
                    ...c,
                    messages: [...(c.messages || []), createdMsg],
                    lastMessage: {
                      text: createdMsg.text,
                      senderName,
                      messageType: createdMsg.messageType,
                      createdAt: createdMsg.createdAt
                    }
                  }
                : c
            )
          );
          showToast(
            composerRole === 'admin'
              ? 'Official Trust & Safety notice posted to conversation.'
              : `Message sent as ${senderName}.`
          );
        }
      }
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleAdminRespondOffer = async (messageId, action) => {
    if (!activeConversation) return;
    try {
      const res = await apiFetch(`/api/v1/chat/messages/${messageId}/offer`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (res && res.ok) {
        showToast(`Offer ${action === 'accept' ? 'accepted' : 'declined'} and synced to Mobile App.`);
        loadAdConversations();
      }
    } catch (err) {
      console.warn('Offer action error:', err);
    }
  };

  const handleToggleFlagConversation = async (conv) => {
    const cid = conv.id || conv._id;
    const nextStatus = conv.status === 'flagged' ? 'active' : 'flagged';
    setConversations((prev) =>
      prev.map((c) => ((c.id || c._id) === cid ? { ...c, status: nextStatus } : c))
    );
    try {
      await apiFetch(`/api/v1/chat/admin/conversations/${cid}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(
        nextStatus === 'flagged'
          ? 'Conversation flagged for Trust & Safety review.'
          : 'Conversation restored to active status.'
      );
    } catch {}
  };

  const handleDeleteConversation = async (conv) => {
    const cid = conv.id || conv._id;
    setConversations((prev) => prev.filter((c) => (c.id || c._id) !== cid));
    if (selectedConvId === cid) {
      setSelectedConvId(null);
    }
    try {
      await apiFetch(`/api/v1/chat/admin/conversations/${cid}`, {
        method: 'DELETE'
      });
      showToast('Conversation thread removed.');
    } catch {}
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'open') return t.status === 'open' || t.status === 'assigned';
    if (activeTab === 'waiting') return t.status === 'waiting_customer';
    if (activeTab === 'resolved') return t.status === 'resolved';
    return true;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    const ticketRefId = selectedTicket._id || selectedTicket.id;
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t))
    );
    showToast(`Reply dispatched to ${selectedTicket.customer}.`);
    try {
      await apiFetch(`/api/v1/support/admin/tickets/${ticketRefId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'resolved',
          resolutionNote: replyMessage
        })
      });
    } catch (err) {
      console.warn('Failed to commit ticket resolution to backend:', err);
    }
    setSelectedTicket(null);
    setReplyMessage('');
  };

  return (
    <div className="admin-page" style={{ padding: '4px 0 24px 0', maxWidth: '1500px', margin: '0 auto' }}>
      {/* Top macOS Window Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-text-primary, #1C1917)',
              letterSpacing: '-0.02em'
            }}
          >
            Support
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: '999px',
              backgroundColor: 'rgba(21, 128, 61, 0.1)',
              color: '#15803D',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#15803D'
              }}
            />
            {conversations.length} Active Threads
          </span>
        </div>

        {/* macOS Segmented Switcher + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-sunken, #EEEDE9)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E7E5E4)'
            }}
          >
            <button
              type="button"
              onClick={() => setConsoleMode('ad_chats')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                backgroundColor: consoleMode === 'ad_chats' ? 'var(--color-panel, #FFFFFF)' : 'transparent',
                color:
                  consoleMode === 'ad_chats'
                    ? 'var(--color-text-primary, #1C1917)'
                    : 'var(--color-text-secondary, #57534E)',
                boxShadow:
                  consoleMode === 'ad_chats' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={14} />
              <span>Conversations ({conversations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setConsoleMode('tickets')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                backgroundColor: consoleMode === 'tickets' ? 'var(--color-panel, #FFFFFF)' : 'transparent',
                color:
                  consoleMode === 'tickets'
                    ? 'var(--color-text-primary, #1C1917)'
                    : 'var(--color-text-secondary, #57534E)',
                boxShadow:
                  consoleMode === 'tickets' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <LifeBuoy size={14} />
              <span>Tickets ({tickets.length})</span>
            </button>
          </div>

          <ExportButton
            data={consoleMode === 'ad_chats' ? conversations : tickets}
            filename={
              consoleMode === 'ad_chats'
                ? 'mybigbazaar-conversations.csv'
                : 'mybigbazaar-support-tickets.csv'
            }
            label="Export CSV"
          />
        </div>
      </div>

      {/* ============================================================
          VIEW 1: CONVERSATIONS & OFFERS (macOS Messages Split View)
         ============================================================ */}
      {consoleMode === 'ad_chats' ? (
        <>
          {/* KPI Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '18px'
            }}
          >
            <MetricCard
              label="Active Threads"
              value={`${chatMetrics.totalConversations || conversations.length}`}
              period="buyer & seller inquiries"
              icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
            <MetricCard
              label="Total Messages"
              value={`${chatMetrics.totalMessages || 0}`}
              period="across active listings"
              icon="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
            <MetricCard
              label="Active Offers"
              value={`${chatMetrics.activeOffersCount || 0}`}
              period="pending or countered"
              icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
            <MetricCard
              label="Accepted Deals"
              value={`${chatMetrics.acceptedDealsCount || 0}`}
              period="ready for fulfillment"
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </div>

          {/* macOS 3-Pane Messages Split Window */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr 290px',
              height: '660px',
              backgroundColor: 'var(--color-panel, #FFFFFF)',
              border: '1px solid var(--color-border, #E7E5E4)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* LEFT PANE: CONVERSATION THREAD LIST */}
            <div
              style={{
                borderRight: '1px solid var(--color-border, #E7E5E4)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-canvas, #FAF9F6)'
              }}
            >
              {/* Search & Filter Header */}
              <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-metadata, #78716C)'
                    }}
                  />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search listing, buyer, seller..."
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 10px 0 30px',
                      borderRadius: '7px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: 'var(--color-panel, #FFFFFF)',
                      color: 'var(--color-text-primary, #1C1917)',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'offers', label: 'Offers' },
                    { id: 'accepted', label: 'Accepted' },
                    { id: 'flagged', label: 'Flagged' }
                  ].map((tab) => {
                    const active = chatFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setChatFilter(tab.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: active
                            ? '1px solid var(--color-navy, #0B2545)'
                            : '1px solid transparent',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: active
                            ? 'var(--color-navy, #0B2545)'
                            : 'var(--color-sunken, #EEEDE9)',
                          color: active ? '#FFFFFF' : 'var(--color-text-secondary, #57534E)',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threads Scroll List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loadingChats ? (
                  <div
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--color-text-metadata, #78716C)',
                      fontSize: '12.5px'
                    }}
                  >
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--color-text-metadata, #78716C)',
                      fontSize: '12.5px'
                    }}
                  >
                    No conversations found.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const cid = c.id || c._id;
                    const isSelected =
                      activeConversation && (activeConversation.id || activeConversation._id) === cid;
                    const offerSt = c.latestOffer?.status;

                    return (
                      <div
                        key={cid}
                        onClick={() => setSelectedConvId(cid)}
                        style={{
                          padding: '11px 12px',
                          borderBottom: '1px solid var(--color-border, #E7E5E4)',
                          cursor: 'pointer',
                          backgroundColor: isSelected
                            ? 'var(--color-sunken, #EEEDE9)'
                            : 'transparent',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          transition: 'background-color 100ms ease'
                        }}
                      >
                        {c.listingImage ? (
                          <img
                            src={c.listingImage}
                            alt={c.listingTitle}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '7px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--color-border, #E7E5E4)'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '7px',
                              backgroundColor: 'var(--color-sunken, #EEEDE9)',
                              border: '1px solid var(--color-border, #E7E5E4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: 'var(--color-text-metadata, #78716C)'
                            }}
                          >
                            <MessageSquare size={16} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '2px'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: 'var(--color-text-primary, #1C1917)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {c.listingTitle}
                            </span>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: 'var(--color-text-primary, #1C1917)',
                                marginLeft: '6px',
                                flexShrink: 0
                              }}
                            >
                              {formatINR(c.listingPrice)}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--color-text-secondary, #57534E)',
                              marginBottom: '3px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {c.buyerName} · {c.sellerName}
                          </div>

                          <div
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--color-text-metadata, #78716C)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '5px'
                            }}
                          >
                            {c.lastMessage?.text || 'No messages yet'}
                          </div>

                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '10.5px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(120, 113, 108, 0.12)',
                                color: 'var(--color-text-secondary, #57534E)',
                                fontWeight: 600
                              }}
                            >
                              {c.messages?.length || 0} msgs
                            </span>

                            {offerSt && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase',
                                  backgroundColor:
                                    offerSt === 'accepted'
                                      ? 'rgba(21, 128, 61, 0.12)'
                                      : offerSt === 'countered'
                                      ? 'rgba(67, 56, 202, 0.12)'
                                      : 'rgba(180, 83, 9, 0.12)',
                                  color:
                                    offerSt === 'accepted'
                                      ? '#15803D'
                                      : offerSt === 'countered'
                                      ? '#4338CA'
                                      : '#B45309'
                                }}
                              >
                                {offerSt === 'accepted'
                                  ? `Deal ${formatINR(c.latestOffer.counterAmount || c.latestOffer.amount)}`
                                  : offerSt === 'countered'
                                  ? `Counter ${formatINR(c.latestOffer.counterAmount)}`
                                  : `Offer ${formatINR(c.latestOffer.amount)}`}
                              </span>
                            )}

                            {c.status === 'flagged' && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(190, 18, 60, 0.12)',
                                  color: '#BE123C'
                                }}
                              >
                                Flagged
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CENTER PANE: LIVE MESSAGE & OFFER TRANSCRIPT */}
            {activeConversation ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: 'var(--color-panel, #FFFFFF)'
                }}
              >
                {/* Pinned Thread Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border, #E7E5E4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-canvas, #FAF9F6)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {activeConversation.listingImage ? (
                      <img
                        src={activeConversation.listingImage}
                        alt=""
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '7px',
                          objectFit: 'cover',
                          border: '1px solid var(--color-border, #E7E5E4)'
                        }}
                      />
                    ) : null}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '13.5px',
                            color: 'var(--color-text-primary, #1C1917)'
                          }}
                        >
                          {activeConversation.listingTitle}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '12.5px',
                            color: 'var(--color-text-secondary, #57534E)'
                          }}
                        >
                          {formatINR(activeConversation.listingPrice)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--color-text-metadata, #78716C)',
                          marginTop: '1px'
                        }}
                      >
                        Buyer: {activeConversation.buyerName} ({activeConversation.buyerPhone}) · Seller:{' '}
                        {activeConversation.sellerName} ({activeConversation.sellerPhone})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleToggleFlagConversation(activeConversation)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        color: activeConversation.status === 'flagged' ? '#15803D' : '#B45309'
                      }}
                    >
                      <Flag size={12} />
                      <span>{activeConversation.status === 'flagged' ? 'Unflag' : 'Flag'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleDeleteConversation(activeConversation)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        color: '#BE123C'
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Messages Scroll Transcript */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {(activeConversation.messages || []).map((m, idx) => {
                    const msgId = m._id || m.id || `m-${idx}`;
                    const role = m.senderRole || 'buyer';
                    const isSellerMsg = role === 'seller';
                    const isAdminMsg = role === 'admin' || m.messageType === 'admin_notice';
                    const isSystemMsg = role === 'system' || m.messageType === 'system';
                    const isOfferMsg = m.messageType === 'offer' && m.offerDetails;

                    if (isSystemMsg) {
                      return (
                        <div
                          key={msgId}
                          style={{
                            alignSelf: 'center',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--color-sunken, #EEEDE9)',
                            fontSize: '11.5px',
                            color: 'var(--color-text-secondary, #57534E)',
                            fontWeight: 500
                          }}
                        >
                          {m.text}
                        </div>
                      );
                    }

                    if (isAdminMsg) {
                      return (
                        <div
                          key={msgId}
                          style={{
                            alignSelf: 'center',
                            width: '90%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(11, 37, 69, 0.05)',
                            border: '1px solid var(--color-border, #E7E5E4)',
                            color: 'var(--color-text-primary, #1C1917)',
                            fontSize: '12.5px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 600,
                              fontSize: '11px',
                              color: 'var(--color-navy, #0B2545)',
                              marginBottom: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            <ShieldCheck size={13} />
                            <span>Trust & Safety Notice</span>
                          </div>
                          <div>{m.text}</div>
                        </div>
                      );
                    }

                    if (isOfferMsg) {
                      const od = m.offerDetails;
                      const st = (od.status || 'pending').toLowerCase();
                      return (
                        <div
                          key={msgId}
                          style={{
                            alignSelf: isSellerMsg ? 'flex-end' : 'flex-start',
                            width: '300px',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            backgroundColor: 'var(--color-canvas, #FAF9F6)',
                            border: '1px solid var(--color-border, #E7E5E4)'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: 'var(--color-text-primary, #1C1917)'
                              }}
                            >
                              <Tag size={12} />
                              <span>{m.senderName || activeConversation.buyerName} · Price Offer</span>
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor:
                                  st === 'accepted'
                                    ? 'rgba(21, 128, 61, 0.12)'
                                    : st === 'countered'
                                    ? 'rgba(67, 56, 202, 0.12)'
                                    : 'rgba(180, 83, 9, 0.12)',
                                color:
                                  st === 'accepted'
                                    ? '#15803D'
                                    : st === 'countered'
                                    ? '#4338CA'
                                    : '#B45309'
                              }}
                            >
                              {st}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              marginBottom: '6px'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '10.5px', color: 'var(--color-text-metadata, #78716C)' }}>
                                Offered Price
                              </div>
                              <div
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: 'var(--color-text-primary, #1C1917)'
                                }}
                              >
                                {formatINR(od.amount)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '10.5px', color: 'var(--color-text-metadata, #78716C)' }}>
                                Asking Price
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--color-text-metadata, #78716C)',
                                  textDecoration: 'line-through'
                                }}
                              >
                                {formatINR(od.askingPrice || activeConversation.listingPrice)}
                              </div>
                            </div>
                          </div>

                          {od.counterAmount && (
                            <div
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(67, 56, 202, 0.08)',
                                fontSize: '11.5px',
                                color: '#4338CA',
                                fontWeight: 600,
                                marginBottom: '8px'
                              }}
                            >
                              Seller Counter Offer: {formatINR(od.counterAmount)}
                            </div>
                          )}

                          {(st === 'pending' || st === 'countered') && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleAdminRespondOffer(msgId, 'accept')}
                                style={{
                                  flex: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#15803D',
                                  color: '#FFFFFF',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                <Check size={12} />
                                <span>Accept Offer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminRespondOffer(msgId, 'decline')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #BE123C',
                                  backgroundColor: 'transparent',
                                  color: '#BE123C',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msgId}
                        style={{
                          alignSelf: isSellerMsg ? 'flex-end' : 'flex-start',
                          maxWidth: '72%'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-metadata, #78716C)',
                            marginBottom: '3px',
                            textAlign: isSellerMsg ? 'right' : 'left'
                          }}
                        >
                          <strong style={{ color: 'var(--color-text-secondary, #57534E)' }}>
                            {m.senderName ||
                              (isSellerMsg ? activeConversation.sellerName : activeConversation.buyerName)}
                          </strong>{' '}
                          ({isSellerMsg ? 'Seller' : 'Buyer'}) ·{' '}
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                        <div
                          style={{
                            padding: '9px 13px',
                            borderRadius: '12px',
                            backgroundColor: isSellerMsg
                              ? 'var(--color-navy, #0B2545)'
                              : 'var(--color-sunken, #EEEDE9)',
                            color: isSellerMsg ? '#FFFFFF' : 'var(--color-text-primary, #1C1917)',
                            fontSize: '13px',
                            lineHeight: 1.45
                          }}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Message & Moderator Composer */}
                <form
                  onSubmit={handleSendChatMessage}
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'var(--color-canvas, #FAF9F6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text-metadata, #78716C)'
                      }}
                    >
                      Send as:
                    </span>
                    {[
                      { id: 'admin', label: 'Admin', icon: ShieldCheck },
                      { id: 'seller', label: `Seller (${activeConversation.sellerName})`, icon: Store },
                      { id: 'buyer', label: `Buyer (${activeConversation.buyerName})`, icon: User }
                    ].map((r) => {
                      const RoleIcon = r.icon;
                      const active = composerRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setComposerRole(r.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            border: active
                              ? '1px solid var(--color-navy, #0B2545)'
                              : '1px solid var(--color-border, #E7E5E4)',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            backgroundColor: active
                              ? 'var(--color-navy, #0B2545)'
                              : 'var(--color-panel, #FFFFFF)',
                            color: active ? '#FFFFFF' : 'var(--color-text-secondary, #57534E)'
                          }}
                        >
                          <RoleIcon size={12} />
                          <span>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder={
                        composerRole === 'admin'
                          ? 'Post an official Trust & Safety notice...'
                          : composerRole === 'seller'
                          ? `Reply as Seller (${activeConversation.sellerName})...`
                          : `Send message as Buyer (${activeConversation.buyerName})...`
                      }
                      style={{
                        flex: 1,
                        height: '36px',
                        padding: '0 12px',
                        borderRadius: '7px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        backgroundColor: 'var(--color-panel, #FFFFFF)',
                        color: 'var(--color-text-primary, #1C1917)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!composerText.trim() || sendingMsg}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 16px',
                        height: '36px',
                        fontSize: '12.5px',
                        fontWeight: 600
                      }}
                    >
                      <Send size={13} />
                      <span>{sendingMsg ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-metadata, #78716C)',
                  fontSize: '13px'
                }}
              >
                Select a conversation thread to inspect messages and offers.
              </div>
            )}

            {/* RIGHT PANE: LISTING & PARTICIPANT INSPECTOR */}
            <div
              style={{
                borderLeft: '1px solid var(--color-border, #E7E5E4)',
                padding: '16px',
                overflowY: 'auto',
                backgroundColor: 'var(--color-canvas, #FAF9F6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {activeConversation ? (
                <>
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--color-text-metadata, #78716C)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Listing Details
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--color-panel, #FFFFFF)',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      borderRadius: '9px',
                      overflow: 'hidden'
                    }}
                  >
                    {activeConversation.listingImage ? (
                      <img
                        src={activeConversation.listingImage}
                        alt=""
                        style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                      />
                    ) : null}
                    <div style={{ padding: '12px' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary, #1C1917)',
                          marginBottom: '4px'
                        }}
                      >
                        {activeConversation.listingTitle}
                      </div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary, #1C1917)',
                          marginBottom: '8px'
                        }}
                      >
                        {formatINR(activeConversation.listingPrice)}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11.5px',
                          color: 'var(--color-text-secondary, #57534E)'
                        }}
                      >
                        <MapPin size={12} />
                        <span>{activeConversation.listingLocation || 'Indore, MP'}</span>
                      </div>
                      {activeConversation.listingCategory && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11.5px',
                            color: 'var(--color-text-secondary, #57534E)',
                            marginTop: '4px'
                          }}
                        >
                          <Folder size={12} />
                          <span>{activeConversation.listingCategory}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--color-text-metadata, #78716C)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Participants
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--color-panel, #FFFFFF)',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      borderRadius: '9px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--color-text-metadata, #78716C)',
                          textTransform: 'uppercase',
                          marginBottom: '2px'
                        }}
                      >
                        Buyer
                      </div>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary, #1C1917)'
                        }}
                      >
                        {activeConversation.buyerName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)' }}>
                        {activeConversation.buyerPhone}
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--color-border, #E7E5E4)' }} />

                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--color-text-metadata, #78716C)',
                          textTransform: 'uppercase',
                          marginBottom: '2px'
                        }}
                      >
                        Seller
                      </div>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary, #1C1917)'
                        }}
                      >
                        {activeConversation.sellerName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)' }}>
                        {activeConversation.sellerPhone}
                      </div>
                    </div>
                  </div>

                  {activeConversation.latestOffer && (
                    <>
                      <div
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: 'var(--color-text-metadata, #78716C)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}
                      >
                        Offer Summary
                      </div>
                      <div
                        style={{
                          backgroundColor: 'var(--color-panel, #FFFFFF)',
                          border: '1px solid var(--color-border, #E7E5E4)',
                          borderRadius: '9px',
                          padding: '12px',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--color-text-secondary, #57534E)' }}>Asking Price</span>
                          <strong>{formatINR(activeConversation.listingPrice)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--color-text-secondary, #57534E)' }}>Buyer Offer</span>
                          <strong>{formatINR(activeConversation.latestOffer.amount)}</strong>
                        </div>
                        {activeConversation.latestOffer.counterAmount && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-secondary, #57534E)' }}>Seller Counter</span>
                            <strong style={{ color: '#4338CA' }}>
                              {formatINR(activeConversation.latestOffer.counterAmount)}
                            </strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary, #57534E)' }}>Status</span>
                          <strong style={{ textTransform: 'uppercase', color: '#15803D' }}>
                            {activeConversation.latestOffer.status}
                          </strong>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        /* ============================================================
           VIEW 2: HELPDESK SUPPORT TICKETS QUEUE
           ============================================================ */
        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid var(--color-border, #E7E5E4)'
              }}
            >
              {[
                { id: 'open', label: 'Active Queue' },
                { id: 'waiting', label: 'Waiting on Customer' },
                { id: 'resolved', label: 'Resolved' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: activeTab === t.id ? 'var(--color-panel, #FFFFFF)' : 'transparent',
                    color:
                      activeTab === t.id
                        ? 'var(--color-text-primary, #1C1917)'
                        : 'var(--color-text-secondary, #57534E)',
                    boxShadow: activeTab === t.id ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        No Support Tickets Found
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        There are currently no customer support tickets in this queue.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '12.5px' }}>
                        {t.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.customer}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>{t.phone}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.category}</span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', maxWidth: '280px' }}>
                        {t.subject}
                      </td>
                      <td>
                        <StatusPill status={t.priority} label={t.priority} />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>{t.slaRemaining}</span>
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '12.5px' }}>
                        {t.assignedTo}
                      </td>
                      <td>
                        <StatusPill status={t.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            padding: '5px 10px'
                          }}
                          onClick={() => setSelectedTicket(t)}
                        >
                          <span>Reply</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Reply Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>Ticket {selectedTicket.id}</h3>
                <StatusPill status={selectedTicket.priority} label={selectedTicket.priority} />
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'var(--color-sunken, #EEEDE9)',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span className="form-label">Customer Query</span>
                <div
                  style={{
                    marginTop: '4px',
                    backgroundColor: 'var(--color-canvas, #FAF9F6)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px'
                  }}
                >
                  {selectedTicket.subject}
                </div>
              </div>

              <div>
                <span className="form-label">Response</span>
                <textarea
                  rows="4"
                  placeholder="Type resolution response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-panel, #FFFFFF)',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setSelectedTicket(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSendReply}>
                Send Reply & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--color-panel, #FFFFFF)',
            border: '1px solid var(--color-border, #E7E5E4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 9999,
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--color-text-primary)'
          }}
        >
          <Check size={14} style={{ color: '#15803D' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
