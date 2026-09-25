import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMenu from '../ChatMenu/ChatMenu';
import { useTherapy } from '../../context/TherapyContext';
import styles from './ChatLog.module.css';

const formatHistoryDate = (dateStr) => {
  if (!dateStr) return 'just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return dateStr;
  }
};

const ChatLog = ({
  isOpen,
  onClose,
  messages = [],
  therapistName = 'Komal',
  onSave,
  onNewChat,
}) => {
  const { savedChats, deleteSavedChat, loadChat } = useTherapy();
  const [view, setView] = useState('chat'); // 'chat' | 'history'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && view === 'chat') {
      const timer = setTimeout(scrollToBottom, 80);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isOpen, view]);

  const handleBackClick = () => {
    if (view === 'history') {
      setView('chat');
    } else {
      onClose();
    }
  };

  const handleSelectHistoryItem = (chat) => {
    if (loadChat) {
      loadChat(chat);
    }
    setView('chat');
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div 
        className={styles.panel} 
        initial={{ y: 25, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 25, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching talk-chatlog.png & history.png */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.chevronButton}
            onClick={handleBackClick}
            aria-label={view === 'history' ? 'Back to chat' : 'Close chat log'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <div className={styles.menuWrapper}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Chat options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
            <ChatMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSave={onSave}
              onNewChat={onNewChat}
              onHistory={() => setView('history')}
            />
          </div>
        </div>

        {/* Content Area: Chat or History */}
        <AnimatePresence mode="wait">
          {view === 'chat' ? (
            <motion.div
              key="chat-view"
              className={styles.messagesContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Start talking to see your conversation here.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id || index}
                      className={styles.messageRow}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    >
                      {isUser ? (
                        <div className={styles.userText}>{msg.text}</div>
                      ) : (
                        <div className={styles.therapistText}>{msg.text}</div>
                      )}
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          ) : (
            <motion.div
              key="history-view"
              className={styles.historyContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {(!savedChats || savedChats.length === 0) ? (
                <div className={styles.emptyState}>
                  <p>No saved conversations yet.</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {savedChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      className={styles.historyCard}
                      onClick={() => handleSelectHistoryItem(chat)}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className={styles.historyCardContent}>
                        <h4 className={styles.historyCardTitle}>{chat.title || 'Hey Komal -- normal chat'}</h4>
                        <span className={styles.historyCardDate}>{formatHistoryDate(chat.date)}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.historyTrashButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedChat(chat.id);
                        }}
                        aria-label="Delete saved conversation"
                        title="Delete conversation"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel grain overlay */}
        <span className={styles.panelGrainOverlay} aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
};

export default ChatLog;
