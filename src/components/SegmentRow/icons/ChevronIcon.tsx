interface ChevronProps {
    open: boolean;
}

const Chevron = ({ open }: ChevronProps) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}
    >
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default Chevron;