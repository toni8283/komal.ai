import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';
import PageTransition from '../../components/PageTransition/PageTransition';
import Header from '../../components/Header/Header';

const HERO_IMAGES = [
  { id: 0, src: '/image/homeimg1.jpg', alt: 'Warm moment 1' },
  { id: 1, src: '/image/homeimg2.jpg', alt: 'Quiet reflection 2' },
  { id: 2, src: '/image/heroimg3.jpg', alt: 'Present listening 3' },
  { id: 3, src: '/image/heroimg4.jpg', alt: 'Shared presence 4' },
  { id: 4, src: '/image/heroimg5.jpg', alt: 'Ambient warmth 5' },
  { id: 5, src: '/image/homeimg6.jpg', alt: 'Gentle embrace 6' },
];

const Home = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cycle through the hero images automatically with gentle pacing
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentImage = HERO_IMAGES[activeImageIndex] || HERO_IMAGES[0];

  return (
    <PageTransition>
      <div className={styles.homeContainer}>
        {/* Dynamic Dark Warm Blurred Backdrop with Active Hero Colors */}
        <div className={styles.backdropLayer} aria-hidden="true">
          <div
            className={styles.backdropImage}
            style={{ backgroundImage: `url(${currentImage.src})` }}
          />
          <div className={styles.backdropTint} />
          <div className={styles.grainOverlay} />
        </div>

        {/* Top Header Capsule: Komal.AI | About */}
        <Header />

        {/* Main Two-Column Editorial Layout */}
        <main className={styles.mainContent}>
          {/* Left Column: 2x3 Grid of Evocative Hero Images */}
          <section className={styles.gallerySection} aria-label="Visual stories">
            <div className={styles.imageGrid}>
              {HERO_IMAGES.map((item, index) => {
                const isActive = index === activeImageIndex;
                return (
                  <div
                    key={item.id}
                    className={`${styles.imageTile} ${isActive ? styles.activeTile : styles.inactiveTile}`}
                    onClick={() => setActiveImageIndex(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Highlight image ${index + 1}`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className={styles.tilePhoto}
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                    <div className={styles.tileNoiseOverlay} />
                    <div className={styles.tileShade} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Editorial Typography & Single Komal CTA */}
          <section className={styles.textSection}>
            <div className={styles.editorialWrap}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className={styles.headingBlock}
              >
                <h1 className={styles.headline}>
                  <span className={styles.titleLine1}>Someone's here.</span>
                  <span className={styles.titleLine2}>Talk to me</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={styles.description}
              >
                A space to talk freely, be understood,
                <br />
                and feel a little less alone.
              </motion.p>
            </div>

            {/* Bottom-Right Start Talking CTA Button */}
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
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default Home;
