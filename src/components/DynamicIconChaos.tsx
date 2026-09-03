import React, { useEffect, useRef } from 'react';

interface IconState {
  element: SVGElement;
  currentX: number;
  currentY: number;
  currentRot: number;
  currentScale: number;
  targetX: number;
  targetY: number;
  targetRot: number;
  targetScale: number;
  seed: number;
  active: boolean;
}

export const DynamicIconChaos: React.FC = () => {
  const mouseRef = useRef<{ x: number; y: number; active: boolean; lastMove: number }>({
    x: -9999,
    y: -9999,
    active: false,
    lastMove: 0,
  });

  const trackedIconsRef = useRef<Map<SVGElement, IconState>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const PROXIMITY_RADIUS = 110; // Detection radius around each icon in pixels
    const MAX_ESCAPE_FORCE = 52; // Maximum pixel displacement
    const LERP_FACTOR = 0.22; // Smooth dynamic spring factor

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      mouseRef.current.lastMove = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
        mouseRef.current.lastMove = performance.now();
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    // Dynamic Physics & Animation Loop
    let lastIconQueryTime = 0;
    let cachedCandidateIcons: SVGElement[] = [];

    const updateCandidates = () => {
      // Find all lucide icons and SVG icons in the page
      const found = Array.from(
        document.querySelectorAll<SVGElement>('svg.lucide, svg[data-icon], svg, [data-dodge-icon="true"]')
      );
      // Filter visible icons only
      cachedCandidateIcons = found.filter((el) => {
        // Exclude elements that shouldn't move (like SVG defs, clips, gradients)
        if (el.tagName.toLowerCase() === 'defs' || el.tagName.toLowerCase() === 'clippath') return false;
        // Check if inside document and rendered
        return el.isConnected;
      });
    };

    updateCandidates();

    const tick = (now: number) => {
      // Periodically refresh the list of icons to catch modals, dynamic lists, etc.
      if (now - lastIconQueryTime > 400) {
        updateCandidates();
        lastIconQueryTime = now;
      }

      const mouse = mouseRef.current;
      const trackedMap = trackedIconsRef.current;

      // 1. Process candidate icons
      for (let i = 0; i < cachedCandidateIcons.length; i++) {
        const icon = cachedCandidateIcons[i];
        if (!icon.isConnected) {
          trackedMap.delete(icon);
          continue;
        }

        const rect = icon.getBoundingClientRect();
        // Culling: offscreen or hidden
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          rect.bottom < -50 ||
          rect.top > window.innerHeight + 50 ||
          rect.right < -50 ||
          rect.left > window.innerWidth + 50
        ) {
          continue;
        }

        let state = trackedMap.get(icon);
        if (!state) {
          state = {
            element: icon,
            currentX: 0,
            currentY: 0,
            currentRot: 0,
            currentScale: 1,
            targetX: 0,
            targetY: 0,
            targetRot: 0,
            targetScale: 1,
            seed: (i * 137.5) % 360, // Unique phase per icon
            active: false,
          };
          trackedMap.set(icon, state);
        }

        // Base center position (subtract current translation to get untransformed base)
        const baseCenterX = rect.left + rect.width / 2 - state.currentX;
        const baseCenterY = rect.top + rect.height / 2 - state.currentY;

        const dx = baseCenterX - mouse.x;
        const dy = baseCenterY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < PROXIMITY_RADIUS) {
          state.active = true;
          const safeDist = Math.max(dist, 1);
          const nx = dx / safeDist;
          const ny = dy / safeDist;

          // Non-linear proximity intensity
          const proximityRatio = 1 - dist / PROXIMITY_RADIUS;
          const intensity = Math.pow(proximityRatio, 1.15);

          // Dynamic evasion calculation + nervous panic flutter
          const flutterSpeed = 0.014;
          const flutter = Math.sin(now * flutterSpeed + state.seed) * (12 * intensity);
          const flutterY = Math.cos(now * flutterSpeed * 1.2 + state.seed) * (10 * intensity);

          const escapeX = nx * (intensity * MAX_ESCAPE_FORCE) + flutter;
          const escapeY = ny * (intensity * MAX_ESCAPE_FORCE) + flutterY;

          // Dynamic tilt away from approach direction
          const tilt = (nx * 22 - ny * 14) * intensity + Math.sin(now * 0.02 + state.seed) * (12 * intensity);
          const scale = 1 + intensity * 0.22;

          state.targetX = escapeX;
          state.targetY = escapeY;
          state.targetRot = tilt;
          state.targetScale = scale;
        } else {
          // Beyond proximity: return gently to origin
          state.targetX = 0;
          state.targetY = 0;
          state.targetRot = 0;
          state.targetScale = 1;
        }
      }

      // 2. Animate and apply transforms to all actively tracked icons
      trackedMap.forEach((state, icon) => {
        if (!icon.isConnected) {
          trackedMap.delete(icon);
          return;
        }

        // Lerp towards target
        state.currentX += (state.targetX - state.currentX) * LERP_FACTOR;
        state.currentY += (state.targetY - state.currentY) * LERP_FACTOR;
        state.currentRot += (state.targetRot - state.currentRot) * LERP_FACTOR;
        state.currentScale += (state.targetScale - state.currentScale) * LERP_FACTOR;

        const isNearZero =
          Math.abs(state.currentX) < 0.15 &&
          Math.abs(state.currentY) < 0.15 &&
          Math.abs(state.currentRot) < 0.15 &&
          Math.abs(state.currentScale - 1) < 0.01 &&
          state.targetX === 0 &&
          state.targetY === 0;

        if (isNearZero) {
          if (state.active) {
            // Reset cleanly to default
            icon.style.transform = '';
            icon.style.willChange = '';
            icon.style.pointerEvents = '';
            state.currentX = 0;
            state.currentY = 0;
            state.currentRot = 0;
            state.currentScale = 1;
            state.active = false;
          }
        } else {
          // Apply dynamic evasive transform
          icon.style.willChange = 'transform';
          icon.style.transform = `translate3d(${state.currentX.toFixed(2)}px, ${state.currentY.toFixed(2)}px, 0px) rotate(${state.currentRot.toFixed(2)}deg) scale(${state.currentScale.toFixed(3)})`;
        }
      });

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);

      // Clean up any remaining applied styles
      trackedIconsRef.current.forEach((state, icon) => {
        if (icon.isConnected) {
          icon.style.transform = '';
          icon.style.willChange = '';
        }
      });
      trackedIconsRef.current.clear();
    };
  }, []);

  return null; // Logic-only controller, mounts globally in App.tsx
};
