import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatMenu.module.css';

const ChatMenu = ({ isOpen, onClose, onSave, onNewChat, onHistory }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.menuContainer}
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -6 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <button
            className={styles.menuItem}
            onClick={() => {
              onSave();
              onClose();
            }}
          >
            save chat
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            new chat
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              onHistory();
              onClose();
            }}
          >
            History
          </button>

          <span className={styles.grainOverlay} aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatMenu;
