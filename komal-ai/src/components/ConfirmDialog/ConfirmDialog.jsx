import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'new chat', 
  cancelText = 'cancel', 
  onConfirm, 
  onCancel 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlayWrapper}>
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div 
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <motion.button 
                className={styles.cancelBtn} 
                onClick={onCancel}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={styles.btnText}>{cancelText}</span>
                <span className={styles.grainOverlay} aria-hidden="true" />
              </motion.button>
              
              <motion.button 
                className={styles.confirmBtn} 
                onClick={onConfirm}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={styles.btnText}>{confirmText}</span>
                <span className={styles.grainOverlay} aria-hidden="true" />
              </motion.button>
            </div>

            <span className={styles.dialogGrainOverlay} aria-hidden="true" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
