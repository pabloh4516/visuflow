import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { CustomPosition } from '@/types/generator';

interface DraggablePopupProps {
  children: ReactNode;
  position: CustomPosition;
  onPositionChange: (position: CustomPosition) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  popupWidth: string;
  isEnabled: boolean;
}

// Safe zone margins (percentage from edges)
const SAFE_ZONE = 5;

export function DraggablePopup({
  children,
  position,
  onPositionChange,
  containerRef,
  popupWidth,
  isEnabled,
}: DraggablePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCoords, setShowCoords] = useState(false);

  const clampPosition = useCallback((x: number, y: number): CustomPosition => {
    // Clamp to safe zone bounds (5% - 95%)
    const clampedX = Math.max(SAFE_ZONE, Math.min(100 - SAFE_ZONE, x));
    const clampedY = Math.max(SAFE_ZONE, Math.min(100 - SAFE_ZONE, y));
    return { x: Math.round(clampedX), y: Math.round(clampedY) };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEnabled || !popupRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
    setIsDragging(true);
    setShowCoords(true);
  }, [isEnabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isEnabled || !popupRef.current) return;
    e.stopPropagation();

    const touch = e.touches[0];
    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left - rect.width / 2,
      y: touch.clientY - rect.top - rect.height / 2,
    });
    setIsDragging(true);
    setShowCoords(true);
  }, [isEnabled]);

  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const handleMove = (clientX: number, clientY: number) => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      // Calculate position as percentage
      const x = ((clientX - dragOffset.x - containerRect.left) / containerRect.width) * 100;
      const y = ((clientY - dragOffset.y - containerRect.top) / containerRect.height) * 100;
      
      const clamped = clampPosition(x, y);
      onPositionChange(clamped);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setTimeout(() => setShowCoords(false), 1500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, dragOffset, containerRef, onPositionChange, clampPosition]);

  return (
    <div
      ref={popupRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="transition-all"
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: popupWidth,
        maxWidth: '90%',
        cursor: isEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        zIndex: 10,
        transition: isDragging ? 'none' : 'all 0.15s ease-out',
      }}
    >
      {/* Coordinate indicator */}
      {isEnabled && showCoords && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20"
        >
          X: {position.x}% · Y: {position.y}%
        </div>
      )}
      
      {/* Drag hint when enabled but not dragging */}
      {isEnabled && !isDragging && !showCoords && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 animate-pulse"
        >
          Arraste para posicionar
        </div>
      )}
      
      {children}
    </div>
  );
}
