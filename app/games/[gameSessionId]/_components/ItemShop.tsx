"use client";

import { useState } from "react";
import styles from "@/styles/itemShop.module.css";

const SABOTAGE_DURATION_S = 10; // backend hardcodes 10s for all items
const ITEM_COST = 5;            // backend hardcodes 5 coins for all items

const ITEMS = [
  {
    id: "ink",
    enumValue: "SQUID_INK_SABOTAGE",
    name: "Squid Ink",
    description: "Blacks out opponent's screen",
    emoji: "🦑",
    accentColor: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#c4b5fd",
  },
  {
    id: "jitter",
    enumValue: "JITTER_SABOTAGE",
    name: "Earthquake",
    description: "Shakes opponent's screen",
    emoji: "⚡",
    accentColor: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fcd34d",
  },
  {
    id: "rotate",
    enumValue: "ROTATE_SABOTAGE",
    name: "Flip Screen",
    description: "Flips opponent's view upside down",
    emoji: "🌀",
    accentColor: "#0891b2",
    bgColor: "#ecfeff",
    borderColor: "#67e8f9",
  },
];

interface ItemShopProps {
  coinBalance: number;
  onBuyItem: (itemId: string, enumValue: string) => Promise<boolean>;
}

export default function ItemShop({ coinBalance, onBuyItem }: ItemShopProps) {
  const [cooldowns, setCooldowns] = useState<Set<string>>(new Set());
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuy = async (item: typeof ITEMS[number]) => {
    if (coinBalance < ITEM_COST || cooldowns.has(item.id) || buyingId !== null) return;
    setBuyingId(item.id);
    const success = await onBuyItem(item.id, item.enumValue);
    setBuyingId(null);
    if (success) {
      setCooldowns(prev => new Set(prev).add(item.id));
      setTimeout(() => {
        setCooldowns(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, SABOTAGE_DURATION_S * 1000);
    }
  };

  return (
    <div className={styles.shopCard}>
      <div className={styles.shopHeader}>
        <span className={styles.shopTitle}>Item Shop</span>
        <div className={styles.coinBalance}>
          <span>🪙</span>
          <span className={styles.coinAmount}>{coinBalance}</span>
        </div>
      </div>

      <div className={styles.itemsGrid}>
        {ITEMS.map(item => {
          const canAfford = coinBalance >= ITEM_COST;
          const onCooldown = cooldowns.has(item.id);
          const isLoading = buyingId === item.id;
          const disabled = !canAfford || onCooldown || buyingId !== null;

          return (
            <div
              key={item.id}
              className={styles.itemCard}
              style={{
                background: item.bgColor,
                borderColor: onCooldown ? "#9ca3af" : item.borderColor,
                opacity: !canAfford && !onCooldown ? 0.55 : 1,
              }}
            >
              <div className={styles.itemEmoji} style={{ background: item.accentColor }}>
                {item.emoji}
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemDesc}>{item.description}</span>
                <span className={styles.itemDuration}>{SABOTAGE_DURATION_S}s</span>
              </div>
              <button
                className={styles.buyButton}
                disabled={disabled}
                onClick={() => handleBuy(item)}
                style={{
                  background: onCooldown ? "#6b7280" : canAfford ? item.accentColor : "#d1d5db",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "..." : onCooldown ? "⏳ Active" : `🪙 ${ITEM_COST}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}