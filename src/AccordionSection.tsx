// src/AccordionSection.tsx
import { useState } from 'react';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isLocked?: boolean; // Optional prop to lock the accordion
  initialOpen?: boolean; // Optional prop to set initial open state (added for control)
}

export function AccordionSection({ title, children, isLocked = false, initialOpen = true }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen); // Use prop to initialize state

  const handleToggle = () => {
    if (!isLocked) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="accordion">
      <div
        className="accordion-header"
        onClick={handleToggle}
        style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <span className="section-title">{title}</span>
        <span className="accordion-icon">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  );
}

