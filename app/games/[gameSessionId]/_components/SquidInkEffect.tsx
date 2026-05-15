"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/game.module.css";

export default function SquidInkEffect({ active }: { active: boolean }) {
  const [visible, setVisible]           = useState(false);
  const [showSquid, setShowSquid]       = useState(false);
  const [showSplatter, setShowSplatter] = useState(false);
  const [exiting, setExiting]           = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const after = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };


  useEffect(() => () => clearAll(), []);

  useEffect(() => {
    if (!active) return; 

    clearAll();
    setVisible(true);
    setShowSquid(true);
    setShowSplatter(false);
    setExiting(false);

    after(() => {
      setShowSplatter(true);

     
      after(() => {
        setExiting(true);
        after(() => {
          setVisible(false);
          setShowSplatter(false);
          setExiting(false);
        }, 600);
      }, 10000);
    }, 950);


    after(() => setShowSquid(false), 2600);


  }, [active]);

  if (!visible) return null;

  return (
    <>
      {showSquid && (
        <div className={styles.squidFlyWrapper}>
          <img src="/squid.png" alt="" className={styles.squidWobble} draggable={false} />
        </div>
      )}

      {showSplatter && (
        <div className={`${styles.splatterOverlay} ${exiting ? styles.splatterExit : ""}`}>
          <img src="/splatter1.svg" alt="" className={styles.splatterImg} draggable={false} />
        </div>
      )}
    </>
  );
}