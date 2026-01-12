'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

type StoredPositionV2 = {
  v: 2;
  x: number;
  y: number;
};

interface DraggableButtonProps {
  children: React.ReactNode;
  initialPosition?: Position;
  onPositionChange?: (position: Position) => void;
  className?: string;
  disabled?: boolean;
}

export default function DraggableButton({
  children,
  initialPosition = { x: 0, y: 0 },
  onPositionChange,
  className = '',
  disabled = false,
}: DraggableButtonProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const positionRef = useRef<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  const dragStartPosition = useRef<Position>({ x: 0, y: 0 });
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const suppressClickRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const setPositionSafe = useCallback((next: Position) => {
    positionRef.current = next;
    setPosition(next);
  }, []);

  const clampToViewport = useCallback((pos: Position) => {
    const margin = 20;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const rect = buttonRef.current?.getBoundingClientRect();
    const elementWidth = rect?.width ?? 0;
    const elementHeight = rect?.height ?? 0;

    const maxX = Math.max(margin, windowWidth - elementWidth - margin);
    const maxY = Math.max(margin, windowHeight - elementHeight - margin);

    return {
      x: Math.max(margin, Math.min(pos.x, maxX)),
      y: Math.max(margin, Math.min(pos.y, maxY)),
    };
  }, []);

  useEffect(() => {
    const storageKey = `draggable-button-${className}`;
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as Partial<StoredPositionV2 & Position>;
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          if (parsed.v === 2) {
            setPositionSafe(clampToViewport({ x: parsed.x, y: parsed.y }));
          } else {
            // Legacy v1: `y` stored as bottom offset (windowHeight - clientY).
            setPositionSafe(clampToViewport({ x: parsed.x, y: window.innerHeight - parsed.y }));
          }
        }
      } catch (error) {
        console.warn('Failed to parse saved position:', error);
      }
    }
  }, [className, clampToViewport, setPositionSafe]);

  useEffect(() => {
    const handleResize = () => {
      setPositionSafe(clampToViewport(positionRef.current));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampToViewport, setPositionSafe]);

  const savePosition = useCallback(
    (pos: Position) => {
      const storageKey = `draggable-button-${className}`;
      const payload: StoredPositionV2 = { v: 2, x: pos.x, y: pos.y };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    },
    [className]
  );

  const getPositionStyle = useCallback((): { top: string; left: string } => {
    return {
      left: `${position.x}px`,
      top: `${position.y}px`,
    };
  }, [position.x, position.y]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      setIsDragging(true);
      dragStartTime.current = Date.now();
      dragStartPosition.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const next = clampToViewport({
          x: moveEvent.clientX - dragOffset.current.x,
          y: moveEvent.clientY - dragOffset.current.y,
        });
        setPositionSafe(next);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        const dragDuration = Date.now() - dragStartTime.current;
        const dragDistance = Math.sqrt(
          Math.pow(upEvent.clientX - dragStartPosition.current.x, 2) +
            Math.pow(upEvent.clientY - dragStartPosition.current.y, 2)
        );

        if (dragDuration < 200 && dragDistance < 5) {
          suppressClickRef.current = false;
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          return;
        }

        suppressClickRef.current = true;
        setIsDragging(false);

        // Snap left/right only; keep y unchanged.
        const margin = 20;
        const edgeThreshold = 100;
        const windowWidth = window.innerWidth;
        const rect = buttonRef.current?.getBoundingClientRect();
        const elementWidth = rect?.width ?? 0;

        const current = positionRef.current;
        let finalX = current.x;

        if (current.x <= edgeThreshold) {
          finalX = margin;
        } else if (windowWidth - (current.x + elementWidth) <= edgeThreshold) {
          finalX = Math.max(margin, windowWidth - elementWidth - margin);
        }

        const snappedPosition = clampToViewport({ x: finalX, y: current.y });
        setPositionSafe(snappedPosition);
        savePosition(snappedPosition);
        onPositionChange?.(snappedPosition);

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [clampToViewport, disabled, onPositionChange, savePosition, setPositionSafe]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();

      const touch = e.touches[0];
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };

      setIsDragging(true);
      dragStartTime.current = Date.now();
      dragStartPosition.current = { x: touch.clientX, y: touch.clientY };

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        const next = clampToViewport({
          x: moveTouch.clientX - dragOffset.current.x,
          y: moveTouch.clientY - dragOffset.current.y,
        });
        setPositionSafe(next);
      };

      const handleTouchEnd = (endEvent: TouchEvent) => {
        const dragDuration = Date.now() - dragStartTime.current;

        if (endEvent.changedTouches.length > 0) {
          const touch = endEvent.changedTouches[0];
          const dragDistance = Math.sqrt(
            Math.pow(touch.clientX - dragStartPosition.current.x, 2) +
              Math.pow(touch.clientY - dragStartPosition.current.y, 2)
          );

          if (dragDuration < 200 && dragDistance < 5) {
            suppressClickRef.current = false;
            setIsDragging(false);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            return;
          }
        }

        suppressClickRef.current = true;
        setIsDragging(false);

        // Snap left/right only; keep y unchanged.
        const margin = 20;
        const edgeThreshold = 100;
        const windowWidth = window.innerWidth;
        const rect = buttonRef.current?.getBoundingClientRect();
        const elementWidth = rect?.width ?? 0;

        const current = positionRef.current;
        let finalX = current.x;

        if (current.x <= edgeThreshold) {
          finalX = margin;
        } else if (windowWidth - (current.x + elementWidth) <= edgeThreshold) {
          finalX = Math.max(margin, windowWidth - elementWidth - margin);
        }

        const snappedPosition = clampToViewport({ x: finalX, y: current.y });
        setPositionSafe(snappedPosition);
        savePosition(snappedPosition);
        onPositionChange?.(snappedPosition);

        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    },
    [clampToViewport, disabled, onPositionChange, savePosition, setPositionSafe]
  );

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      ref={buttonRef}
      className={`fixed z-50 cursor-move ${className}`}
      style={getPositionStyle()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClickCapture={handleClickCapture}
      whileDrag={{ scale: 1.05 }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
