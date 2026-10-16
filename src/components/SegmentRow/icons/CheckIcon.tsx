interface CheckProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (a: any) => void;
}

export default function Check({ id, label, checked, onChange }: CheckProps) {
    return (
        <label className="cs-check" htmlFor={id}>
            <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>{label}</span>
        </label>
    );
}