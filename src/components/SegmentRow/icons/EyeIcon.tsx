interface EyeProps {
    off: boolean;
}

const Eye = ({ off }: EyeProps) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
        d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
        {off && <path d="M2.5 13.5l11-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
  </svg>
);

export default Eye;