import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandlers {
  onSearch?: () => void;
  onNewPage?: () => void;
  onNewCloaking?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Cmd+K even in inputs
      if (!((event.metaKey || event.ctrlKey) && event.key === 'k')) {
        return;
      }
    }

    // Cmd/Ctrl + K - Open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      handlers.onSearch?.();
      return;
    }

    // Single key shortcuts (only when not in input)
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          handlers.onNewPage?.() ?? navigate('/app');
          break;
        case 'c':
          event.preventDefault();
          handlers.onNewCloaking?.() ?? navigate('/cloaking/new');
          break;
        case '?':
          event.preventDefault();
          handlers.onShowHelp?.();
          break;
        case 'g':
          // G + D for Dashboard, G + S for Settings
          // This is handled by a separate listener for sequential keys
          break;
      }
    }
  }, [handlers, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useGoShortcuts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const now = Date.now();
      
      if (event.key.toLowerCase() === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      // If last key was 'g' within 500ms
      if (lastKey === 'g' && now - lastKeyTime < 500) {
        switch (event.key.toLowerCase()) {
          case 'd':
            event.preventDefault();
            navigate('/dashboard');
            break;
          case 's':
            event.preventDefault();
            navigate('/settings');
            break;
          case 'c':
            event.preventDefault();
            navigate('/cloaking');
            break;
          case 'p':
            event.preventDefault();
            navigate('/app');
            break;
        }
        lastKey = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
