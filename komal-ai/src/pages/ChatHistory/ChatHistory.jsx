import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatHistory.module.css';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useTherapy } from '../../context/TherapyContext';

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

const ChatHistory = () => {
  const { savedChats, deleteSavedChat, loadChat } = useTherapy();
  const navigate = useNavigate();

  const handleOpenChat = (chat) => {
    if (loadChat) {
      loadChat(chat);
    }
    navigate('/talk');
  };

  return (
    <PageTransition>
      <div className={styles.historyContainer}>
        {/* Background layer: acc1.jpg with 100px blur and SVG grain */}
        <div className={styles.bgImageLayer} aria-hidden="true">
          <div
            className={styles.bgBlurredImage}
            style={{ backgroundImage: `url('/image/acc1.jpg')` }}
          />
          <div className={styles.bgVignette} />
          <div className={styles.bgGrainOverlay} />
        </div>

        {/* Top-left "go back" button */}
        <div className={styles.topBar}>
          <motion.button
            className={styles.pillButton}
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Go back"
          >
            <span>go back</span>
            <span className={styles.grainOverlay} aria-hidden="true" />
          </motion.button>
        </div>

        {/* Centered History Panel matching history.png */}
        <main className={styles.mainContent}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Chat history</h2>
            </div>

            <div className={styles.listContainer}>
              {(!savedChats || savedChats.length === 0) ? (
                <div className={styles.emptyState}>
                  <p>No saved conversations yet.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {savedChats.map((chat, index) => (
                    <motion.div
                      key={chat.id || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileTap={{ scale: 0.99 }}
                      className={styles.historyCard}
                      onClick={() => handleOpenChat(chat)}
                    >
                      <div className={styles.historyCardContent}>
                        <h3 className={styles.historyCardTitle}>
                          {chat.title || 'Hey Komal -- normal chat'}
                        </h3>
                        <span className={styles.historyCardDate}>
                          {formatHistoryDate(chat.date)}
                        </span>
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
                </AnimatePresence>
              )}
            </div>

            <span className={styles.panelGrainOverlay} aria-hidden="true" />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ChatHistory;
