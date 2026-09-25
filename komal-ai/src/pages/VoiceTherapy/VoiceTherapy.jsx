import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VoiceTherapy.module.css';
import PageTransition from '../../components/PageTransition/PageTransition';
import Waveform from '../../components/Waveform/Waveform';
import VoiceControls from '../../components/VoiceControls/VoiceControls';
import ChatLog from '../../components/ChatLog/ChatLog';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useTherapy } from '../../context/TherapyContext';
import { therapists, getTherapist } from '../../data/therapists';
import { VoiceAgentService } from '../../services/voiceAgentService';

const VoiceTherapy = () => {
  const { therapistId: paramId } = useParams();
  const navigate = useNavigate();
  
  // Default to Komal (primary companion)
  const [selectedId, setSelectedId] = useState(paramId || 'komal');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const voiceDropdownRef = useRef(null);

  const therapist = getTherapist(selectedId);

  const {
    sessionStatus,
    setSessionStatus,
    chatMessages,
    streamMessage,
    clearMessages,
    saveChat,
    notification,
    dismissNotification,
  } = useTherapy();

  const [isChatLogOpen, setIsChatLogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const voiceAgentRef = useRef(null);

  // Close voice dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(e.target)) {
        setIsVoiceDropdownOpen(false);
      }
    };
    if (isVoiceDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isVoiceDropdownOpen]);

  // Initialize live AssemblyAI Voice Agent
  useEffect(() => {
    setSessionStatus('listening');
    setSessionError(null);

    const agent = new VoiceAgentService({
      backendUrl: window.location.port === '5173' ? '' : 'http://localhost:4000',
      therapistId: therapist.id,
      onStatusChange: (status) => {
        setSessionStatus(status);
        if (status === 'paused') {
          setIsPaused(true);
        } else if (status === 'listening' || status === 'speaking') {
          setIsPaused(false);
        }
      },
      onUserTranscript: ({ text, isFinal }) => {
        streamMessage({
          sender: 'user',
          text,
          isFinal,
        });
      },
      onAgentTranscript: ({ text, delta, isFinal }) => {
        streamMessage({
          sender: therapist.name,
          text,
          delta,
          isFinal,
        });
      },
      onError: (err) => {
        console.warn('[VoiceTherapy] Voice session error:', err);
        setSessionError(err.message);
      },
    });

    voiceAgentRef.current = agent;
    agent.start();

    return () => {
      if (voiceAgentRef.current) {
        voiceAgentRef.current.stop();
        voiceAgentRef.current = null;
      }
    };
  }, [therapist.id]);

  const handleTogglePause = () => {
    if (voiceAgentRef.current) {
      const nowPaused = voiceAgentRef.current.togglePause();
      setIsPaused(nowPaused);
    } else {
      setIsPaused((prev) => !prev);
    }
  };

  const handleNewChat = () => {
    setIsConfirmOpen(true);
  };

  const confirmNewChat = () => {
    clearMessages();
    setIsConfirmOpen(false);
    if (voiceAgentRef.current) {
      voiceAgentRef.current.stop();
      voiceAgentRef.current.start();
    }
  };

  const handleSaveChat = () => {
    saveChat(`${therapist.name} session - ${new Date().toLocaleDateString()}`);
  };

  const handleSelectVoice = (id) => {
    if (id === selectedId) {
      setIsVoiceDropdownOpen(false);
      return;
    }
    setSelectedId(id);
    setIsVoiceDropdownOpen(false);

    if (voiceAgentRef.current) {
      voiceAgentRef.current.switchVoice(id);
    }
  };

  return (
    <PageTransition>
      <div className={styles.therapyContainer}>
        {/* Background layer: acc1.jpg with 100px blur and SVG grain */}
        <div className={styles.bgImageLayer} aria-hidden="true">
          <div
            className={styles.bgBlurredImage}
            style={{ backgroundImage: `url('/image/acc1.jpg')` }}
          />
          <div className={styles.bgVignette} />
          <div className={styles.bgGrainOverlay} />
        </div>

        {/* Top bar matching talk-mainscreen.png */}
        <header className={styles.topBar}>
          {/* Top-left "go back" pill */}
          <motion.button
            className={styles.pillButton}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Go back to home"
          >
            <span>go back</span>
            <span className={styles.grainOverlay} aria-hidden="true" />
          </motion.button>

          {/* Top-right "Voice" pill & dropdown matching talk-voice list.png */}
          <div className={styles.voiceMenuWrapper} ref={voiceDropdownRef}>
            <motion.button
              className={`${styles.pillButton} ${isVoiceDropdownOpen ? styles.pillActive : ''}`}
              onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Select voice"
            >
              <span>Voice: {selectedId === 'alex' ? 'Male' : 'Female'}</span>
              <span className={styles.grainOverlay} aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {isVoiceDropdownOpen && (
                <motion.div
                  className={styles.voiceDropdown}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    className={`${styles.voiceItem} ${selectedId === 'komal' ? styles.voiceItemActive : ''}`}
                    onClick={() => handleSelectVoice('komal')}
                  >
                    Female Voice
                  </button>
                  <button
                    type="button"
                    className={`${styles.voiceItem} ${selectedId === 'alex' ? styles.voiceItemActive : ''}`}
                    onClick={() => handleSelectVoice('alex')}
                  >
                    Male Voice
                  </button>
                  <span className={styles.grainOverlay} aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Status notification toast */}
        <AnimatePresence>
          {(notification || sessionError) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.notificationToast}
            >
              <span>{notification?.message || sessionError}</span>
              <button
                className={styles.notificationClose}
                onClick={() => {
                  if (notification) dismissNotification();
                  if (sessionError) setSessionError(null);
                }}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Waveform with white baseline matching talk-mainscreen.png */}
        <main className={styles.centerSessionArea}>
          <div className={styles.waveformContainer}>
            <Waveform status={isPaused ? 'paused' : sessionStatus} />
          </div>
        </main>

        {/* Bottom controls matching talk-mainscreen.png */}
        <footer className={styles.bottomArea}>
          <VoiceControls
            isPaused={isPaused}
            onChatLogToggle={() => setIsChatLogOpen(true)}
            onTogglePause={handleTogglePause}
          />
        </footer>

        {/* Chat Log & History Overlay */}
        <AnimatePresence>
          {isChatLogOpen && (
            <ChatLog
              isOpen={isChatLogOpen}
              onClose={() => setIsChatLogOpen(false)}
              messages={chatMessages}
              therapistName={therapist.name}
              onSave={handleSaveChat}
              onNewChat={handleNewChat}
            />
          )}
        </AnimatePresence>

        {/* Confirm New Chat Dialog */}
        <AnimatePresence>
          {isConfirmOpen && (
            <ConfirmDialog
              isOpen={isConfirmOpen}
              title="Start a new conversation?"
              message="This will clear your current conversation."
              confirmText="new chat"
              cancelText="cancel"
              onConfirm={confirmNewChat}
              onCancel={() => setIsConfirmOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default VoiceTherapy;
