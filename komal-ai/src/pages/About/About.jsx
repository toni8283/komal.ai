import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './About.module.css';
import PageTransition from '../../components/PageTransition/PageTransition';
import Header from '../../components/Header/Header';

const About = () => {
  return (
    <PageTransition>
      <div className={styles.aboutContainer}>
        {/* Warm Ambient Blurred Layer with SVG Film Grain Overlay */}
        <div className={styles.backdropLayer} aria-hidden="true">
          <div className={styles.backdropImage} />
          <div className={styles.backdropTint} />
          <div className={styles.grainOverlay} />
        </div>

        {/* Top Header Capsule: Komal.AI | About */}
        <Header />

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          <div className={styles.articleWrap}>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className={styles.title}
            >
              Komal<span className={styles.titleItalic}>.ai</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={styles.editorialBody}
            >
              <p className={styles.paragraph}>
                Built for conversations, not conversations with a machine.
                <br />
                Most AI interactions start with a keyboard.
              </p>

              <p className={styles.paragraph}>
                Komal.ai starts with your voice.
                <br />
                We are building a voice first AI companion that listens to what you say,
                understands the context, and responds naturally, making every interaction feel more human and effortless.
              </p>

              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>No perfect prompts.</div>
                <div className={styles.bulletItem}>No typing everything out.</div>
                <div className={styles.bulletItem}>Just talk.</div>
              </div>

              <p className={styles.paragraph}>
                Our goal is simple: make AI conversations feel more natural, accessible, and human.
                <br />
                Komal.ai. A space to talk, whenever you need one.
              </p>
            </motion.div>
          </div>
        </main>

        {/* Bottom-Right Start Talking CTA: exactly matches Home position */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className={styles.ctaWrapper}
        >
          <Link to="/talk" className={styles.ctaGroup} aria-label="Start talking with Komal">
            <span className={styles.startPill}>start talking</span>
            <span className={styles.arrowCircle}>
              <svg
                className={styles.arrowSvg}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M7 17L17 7M17 7H9M17 7V15"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </motion.div>

        {/* Bottom Disclaimer */}
        <footer className={styles.disclaimerWrapper}>
          <p className={styles.disclaimerText}>
            Komal.ai is an AI companion and is not a replacement for a licensed mental health professional or emergency service.
          </p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default About;
