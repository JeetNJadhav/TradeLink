// The TradeLink mark (two linked rings) with the wordmark next to it.
const TradeLinkLogo = () => (
  <span className="tradelink-logo">
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="28" height="28" rx="7" fill="#2563eb" />
      <circle
        cx="11"
        cy="14"
        r="5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
      />
      <circle
        cx="17"
        cy="14"
        r="5"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="2.2"
      />
    </svg>

    <span className="tradelink-wordmark">TradeLink</span>
  </span>
);

export default TradeLinkLogo;
