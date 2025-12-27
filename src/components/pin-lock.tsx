import React, { useEffect, useRef, useState } from "react";
import {
  hasPin,
  setPin,
  verifyPin,
  getEncryptionKeyFromPin,
} from "../lib/pinAuth";
// @ts-ignore - side-effect import for CSS without type declarations
import "./pin-lock.css";

type Props = { onUnlock: (key: CryptoKey) => void };

export const PinLock: React.FC<Props> = ({ onUnlock }) => {
  const [creating, setCreating] = useState(!hasPin());
  const [pin, setPinState] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [creating]);

  function onDigit(d: string) {
    if (pin.length >= 6) return;
    setPinState((p) => p + d);
  }

  function onBack() {
    setPinState((p) => p.slice(0, -1));
  }

  async function submit() {
    try {
      if (creating) {
        if (!/^[0-9]{4,6}$/.test(pin)) {
          setError("PIN must be 4–6 digits");
          setShakeOnce();
          return;
        }
        await setPin(pin);
        setCreating(false);
        setPinState("");
        setError("");
        return;
      }
      const ok = await verifyPin(pin);
      if (!ok) {
        setError("Incorrect PIN");
        setShakeOnce();
        setPinState("");
        return;
      }
      const key = await getEncryptionKeyFromPin(pin);
      setPinState("");
      onUnlock(key);
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    }
  }

  function setShakeOnce() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  return (
    <div
      className={`pin-lock-root ${shake ? "shake" : ""}`}
      role="dialog"
      aria-label="Unlock"
    >
      <div className="pin-card">
        <div className="lock-icon">🔒</div>
        <h2>{creating ? "Create PIN" : "Enter PIN"}</h2>
        <div className="pin-dots" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`dot ${i < pin.length ? "filled" : ""} ${
                i >= 4 && i < 6 ? "optional" : ""
              }`}
            ></div>
          ))}
        </div>
        {error && <div className="pin-error">{error}</div>}
        <input
          ref={inputRef}
          className="visually-hidden"
          title="PIN"
          placeholder="Enter PIN"
          aria-label="PIN"
          value={pin}
          onChange={(e) => setPinState(e.target.value.replace(/[^0-9]/g, ""))}
          maxLength={6}
          inputMode="numeric"
        />
        <div className="pin-pad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
            <button key={d} className="pad-btn" onClick={() => onDigit(d)}>
              {d}
            </button>
          ))}
          <button className="pad-btn back" onClick={onBack}>
            ⌫
          </button>
          <button className="pad-btn submit" onClick={submit}>
            {creating ? "Save" : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinLock;
