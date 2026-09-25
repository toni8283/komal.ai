import React from 'react';
import { motion } from 'framer-motion';
import styles from './VoiceControls.module.css';

const VoiceControls = ({ isPaused, onChatLogToggle, onTogglePause }) => {
  return (
    <div className={styles.controlsGroup}>
      {/* "chat log" pill button */}
      <motion.button 
        className={styles.chatLogBtn} 
        onClick={onChatLogToggle}
        whileHover={{ y: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Open chat log"
      >
        <span className={styles.btnText}>chat log</span>
        <span className={styles.grainOverlay} aria-hidden="true" />
      </motion.button>
      
      {/* Circular pause/play button */}
      <motion.button 
        className={styles.playPauseBtn} 
        onClick={onTogglePause} 
        whileHover={{ y: -1, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label={isPaused ? 'Resume conversation' : 'Pause conversation'}
      >
        <span className={styles.iconWrapper}>
          {isPaused ? (
            <svg className={styles.playSvg} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
            </svg>
          ) : (
            <span className={styles.recordDot} />
          )}
        </span>
        <span className={styles.grainOverlay} aria-hidden="true" />
      </motion.button>
    </div>
  );
};

export default VoiceControls;
