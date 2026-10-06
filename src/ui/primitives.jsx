import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button type={type} className={`btn ${className}`} data-variant={variant} data-size={size} {...props} />
  );
}

export function IconButton({
  active = false,
  pop = false,
  className = "",
  type = "button",
  href,
  ...props
}) {
  const shared = {
    className: `icon-btn ${className}`,
    "data-active": active,
    "data-pop": pop,
    ...props,
  };
  if (href) {
    return <a href={href} {...shared} />;
  }
  return <button type={type} {...shared} />;
}

export function Card({ padding = "md", active = false, className = "", as: Tag = "section", ...props }) {
  return <Tag className={`card ${className}`} data-padding={padding} data-active={active} {...props} />;
}

export function Chip({ tone, active = false, as: Tag = "span", className = "", ...props }) {
  return <Tag className={`chip ${className}`} data-tone={tone} data-active={active} {...props} />;
}

export function Badge({ children, className = "" }) {
  if (children == null || children === 0) return null;
  return <span className={`badge ${className}`}>{children}</span>;
}

export function Input({ icon, className = "", ...props }) {
  return (
    <label className={`input-wrap ${className}`}>
      {icon}
      <input {...props} />
    </label>
  );
}

export function Slider({ value = 0, min = 0, max = 5, step = 0.25, onChange, label = "Rating" }) {
  const pct = ((Number(value) - min) / (max - min)) * 100;
  return (
    <div className="slider" style={{ "--pct": `${pct}%` }}>
      <div className="slider-row">
        <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>
          {label}
        </span>
        <strong className="slider-value">{Number(value).toFixed(2)}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </div>
  );
}

export function Segmented({ options, value, onChange, className = "" }) {
  return (
    <div className={`segmented ${className}`} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          data-active={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.icon}
          <span>{option.label}</span>
          <Badge>{option.badge}</Badge>
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="sheet-panel">
        {title ? (
          <h2 className="display" style={{ margin: "0 0 1rem", fontSize: "var(--fs-2xl)" }}>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, celebrate = false, children }) {
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal-panel" data-celebrate={celebrate}>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ src, alt, size = "md", className = "" }) {
  return (
    <span className={`avatar ${className}`} data-size={size}>
      <img src={src} alt={alt} />
    </span>
  );
}

export function EmptyState({ title, body, action, icon }) {
  return (
    <div className="empty">
      {icon}
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className = "" }) {
  const id = useId();
  return (
    <label className={`field-label ${className}`} htmlFor={id}>
      <input
        id={id}
        className="check"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      {label}
    </label>
  );
}

const ToastContext = createContext({ push: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = "info") => {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" data-tone={toast.tone}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("beerFest.theme", "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
