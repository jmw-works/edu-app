// src/Header.tsx
import { forwardRef } from 'react';

interface HeaderProps {
  signOut?: () => void;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(({ signOut }, ref) => {
  return (
    <header ref={ref} className="main-header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 /* Ensure it's on top */ }}>
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
        <span className="logo-text">Treasure Gym</span>
      </div>
      <nav className="nav-links">
        <a href="#" className="nav-link">Learn</a>
        <a href="#" className="nav-link">Compete</a>
        <a href="#" className="nav-link">For Education</a>
        <a href="#" className="nav-link">For Business</a>
        <a href="#" className="nav-link">Pricing</a>
      </nav>
      <div className="auth-buttons">
        <input type="text" placeholder="Search" className="search-input" />
        <button onClick={signOut} className="sign-out-button">Sign Out</button>
      </div>
    </header>
  );
});
