import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const location = useLocation();
  const isAbout = location.pathname === '/about';
  const isHome = location.pathname === '/' || location.pathname === '/talk';

  return (
    <header className={styles.headerContainer}>
      <nav className={styles.navCapsule}>
        <Link
          to="/"
          className={`${styles.navItem} ${isHome ? styles.active : styles.inactive}`}
          aria-label="Komal.AI Home"
        >
          Komal.AI
        </Link>
        <span className={styles.divider} aria-hidden="true" />
        <Link
          to="/about"
          className={`${styles.navItem} ${isAbout ? styles.active : styles.inactive}`}
          aria-label="About Komal.AI"
        >
          About
        </Link>
      </nav>
    </header>
  );
};

export default Header;
