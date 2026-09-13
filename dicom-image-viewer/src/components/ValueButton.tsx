interface ValueButtonProps {
    value: any;
    label?: string;
    action: (a: any) => void;
}

export default function ValueButton({value, label, action}: ValueButtonProps) {
    
    return (
        <div>
            <button
              onClick={() => action(value)}
            >
                {label ?? ((typeof value === 'string') ? value : 'Button')}
            </button>
        </div>
    )
}
