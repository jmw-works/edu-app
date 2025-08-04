import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import "../App.css"; // Correct relative path


interface AccordionSectionProps {
  title: string;
  educationalText: string;
  isLocked?: boolean;
  initialOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionSection({
  title,
  educationalText,
  isLocked = false,
  initialOpen = false,
  children,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleOpen = () => {
    if (!isLocked) setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div
        className={`accordion-header ${isLocked ? 'locked' : ''}`}
        onClick={toggleOpen}
      >
        <span className="section-title">{title}</span>
        <span className="accordion-icon">
          {isLocked ? (
            <span role="img" aria-label="locked">🔒</span>
          ) : isOpen ? (
            <MdKeyboardArrowUp />
          ) : (
            <MdKeyboardArrowDown />
          )}
        </span>
      </div>

      {isOpen && (
        <div className="accordion-body">
          <p className="section-description">{educationalText}</p>
          {children}
        </div>
      )}
    </div>
  );
}


