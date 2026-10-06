function Svg({ children, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconBeer(props) {
  return (
    <Svg {...props}>
      <path d="M7 8h8v9a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V8Z" />
      <path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15" />
      <path d="M8 5c.8 1.2 2 1.8 4 1.8S15.2 6.2 16 5" />
    </Svg>
  );
}

export function IconStar({ filled = false, ...props }) {
  return (
    <Svg {...props} fill={filled ? "currentColor" : "none"}>
      <path d="m12 3.4 2.2 4.6 5.1.7-3.7 3.6.9 5.1L12 15l-4.5 2.4.9-5.1L4.7 8.7l5.1-.7L12 3.4Z" />
    </Svg>
  );
}

export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Svg>
  );
}

export function IconHistory(props) {
  return (
    <Svg {...props}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 5v4h4" />
      <path d="M12 8v4.5l3 1.8" />
    </Svg>
  );
}

export function IconTrophy(props) {
  return (
    <Svg {...props}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 9.2" />
      <path d="M16 6h2.5A2.5 2.5 0 0 1 16 9.2" />
      <path d="M12 12v3" />
      <path d="M9 20h6" />
      <path d="M10 17h4v3h-4z" />
    </Svg>
  );
}

export function IconChevron(props) {
  return (
    <Svg {...props}>
      <path d="m7 10 5 5 5-5" />
    </Svg>
  );
}

export function IconExternal(props) {
  return (
    <Svg size={16} {...props}>
      <path d="M10 5h9v9" />
      <path d="M19 5 9 15" />
      <path d="M13 19H6a1 1 0 0 1-1-1V8" />
    </Svg>
  );
}

export function IconPin(props) {
  return (
    <Svg size={16} {...props}>
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  );
}

export function IconLogin(props) {
  return (
    <Svg {...props}>
      <path d="M10 12h10" />
      <path d="m16 8 4 4-4 4" />
      <path d="M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
    </Svg>
  );
}

export function IconLogout(props) {
  return (
    <Svg {...props}>
      <path d="M14 12H4" />
      <path d="m8 8-4 4 4 4" />
      <path d="M10 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7" />
    </Svg>
  );
}

export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="m7 7 10 10" />
      <path d="M17 7 7 17" />
    </Svg>
  );
}

export function IconSun(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M3 12h2M19 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" />
    </Svg>
  );
}
