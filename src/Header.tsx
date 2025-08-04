// src/Header.tsx
interface HeaderProps {
  signOut?: () => void;
}

export function Header({ signOut }: HeaderProps) {
  return (
    <header className="main-header">
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
}
