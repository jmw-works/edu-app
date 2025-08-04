import { useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdLockOutline
} from "react-icons/md";
import "../App.css";

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
    if (!isLocked) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={`accordion ${isLocked ? "accordion-locked" : ""}`}>
      <div
        className={`accordion-header ${isLocked ? "locked" : ""}`}
        onClick={toggleOpen}
      >
        <span className="section-title">{title}</span>
        <span className="accordion-icon">
          {isLocked ? (
            <MdLockOutline size={24} />
          ) : isOpen ? (
            <MdKeyboardArrowUp size={24} />
          ) : (
            <MdKeyboardArrowDown size={24} />
          )}
        </span>
      </div>

      {isOpen && !isLocked && (
        <div className="accordion-body">
          <p className="section-description">{educationalText}</p>
          {children}
        </div>
      )}
    </div>
  );
}






