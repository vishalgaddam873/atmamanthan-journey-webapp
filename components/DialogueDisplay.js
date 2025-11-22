import { useEffect, useState, useRef } from 'react';

const DialogueDisplay = ({ text, show = false, duration = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const timeoutRef = useRef(null);
  const charTimeoutRef = useRef(null);

  useEffect(() => {
    if (show && text) {
      setIsVisible(true);
      // Reset typewriter state
      setDisplayedText('');
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      // Fade in container
      setTimeout(() => {
        setOpacity(1);
      }, 100);
    } else {
      // Fade out
      setOpacity(0);
      // Clear any ongoing typewriter
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current);
      setTimeout(() => {
        setIsVisible(false);
        setDisplayedText('');
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 500);
    }
  }, [show, text]);

  // Typewriter effect
  useEffect(() => {
    if (!show || !text || !isVisible || opacity === 0) {
      return;
    }

    const lines = text.split('\n');
    if (lines.length === 0) return;

    const typeNextChar = () => {
      if (currentLineIndex >= lines.length) {
        // All lines typed
        return;
      }

      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        // Build text: completed lines + current line being typed
        const completedLines = lines.slice(0, currentLineIndex);
        const currentLineText = currentLine.substring(0, currentCharIndex + 1);
        const newText = [...completedLines, currentLineText].join('\n');
        
        setDisplayedText(newText);
        setCurrentCharIndex(currentCharIndex + 1);
        
        // Schedule next character (faster for spaces, normal for others)
        const delay = currentLine[currentCharIndex] === ' ' ? 30 : 50;
        charTimeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        // Line complete, move to next line
        if (currentLineIndex < lines.length - 1) {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
          // Small pause between lines
          timeoutRef.current = setTimeout(typeNextChar, 300);
        }
      }
    };

    // Start typing after a brief delay
    timeoutRef.current = setTimeout(typeNextChar, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current);
    };
  }, [show, text, isVisible, opacity, currentLineIndex, currentCharIndex]);

  // Debug logging
  useEffect(() => {
    if (show && text) {
      console.log('DialogueDisplay: Showing dialogue', { show, text: text.substring(0, 50), isVisible, opacity });
    }
  }, [show, text, isVisible, opacity]);

  if (!isVisible || !text) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      style={{
        opacity,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {/* Gradient overlay for better text readability - subtle */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        }}
      />
      
      {/* Dialogue text container - centered */}
      <div className="relative px-8 py-12 max-w-5xl mx-auto text-center">
        <div className="text-white">
          {/* Main dialogue text with typewriter effect - bigger font with glowing effect */}
          <p 
            className="text-4xl md:text-5xl lg:text-6xl font-medium leading-relaxed"
            style={{
              textShadow: `
                0 0 5px rgba(255, 255, 255, 0.5),
                0 0 10px rgba(255, 255, 255, 0.3),
                0 0 15px rgba(255, 220, 100, 0.2),
                0 2px 4px rgba(0, 0, 0, 0.8)
              `,
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
            }}
          >
            {displayedText || '\u00A0'}
            {/* Blinking cursor with subtle glow */}
            <span 
              className="inline-block w-1 h-12 md:h-16 lg:h-20 bg-white ml-2 animate-pulse"
              style={{
                boxShadow: '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3)',
              }}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default DialogueDisplay;

