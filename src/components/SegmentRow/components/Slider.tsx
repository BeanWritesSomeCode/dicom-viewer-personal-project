interface SliderProps {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (e: any) => void;
    format: (n: number) => number;
    disabled: boolean;
}

export default function Slider({
    id,
    label,
    value,
    min,
    max,
    step,
    onChange,
    format,
    disabled,
}: SliderProps) {
    return (
        <div className="cs-row">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <output htmlFor={id}>{format ? format(value) : value}</output>
        </div>
    )
}