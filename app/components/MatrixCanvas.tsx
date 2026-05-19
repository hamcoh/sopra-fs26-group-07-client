"use client";
import { useEffect, useRef } from "react";

export default function MatrixCanvas({ opacity = 0.18 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;

    const context = canvasEl.getContext("2d");
    if (!context) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    let animId: number;
    const sz = 18;
    const chars =
      "アイウエオカキクケコサシスセソタナニヌネ0123456789ABCDEF<>{}[]();+-*/\\|";

    let drops: number[] = [];

    function resize() {
      const prevCols = drops.length;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const cols = Math.floor(canvas.width / sz);
      // Only reinitialise when the column count actually changes — this prevents
      // the ResizeObserver firing multiple times during page layout from causing
      // repeated "burst → pause → burst" waves at startup.
      if (cols !== prevCols) {
        drops = Array.from(
          { length: cols },
          () => Math.random() * (canvas.height / sz)   // spread across full height so first frame looks like rain already in progress
        );
      }
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      ctx.fillStyle = "rgba(26,26,46,.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${sz}px "JetBrains Mono", monospace`;

      drops.forEach((y, i) => {
        const x = i * sz;

        ctx.fillStyle = "rgba(99,120,255,.85)";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y * sz);

        if (y > 1) {
          ctx.fillStyle = "rgba(67,97,238,.22)";
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, (y - 1) * sz);
        }

        if (y * sz > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.2;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
