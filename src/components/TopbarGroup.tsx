import type { ReactNode } from "react";

interface TopbarGroupProps {
    children?: ReactNode;
    spacing?: string;
}

export default function TopbarGroup({ children, spacing = '2rem' }: TopbarGroupProps) {
    return (
        <div className="top-bar-group"
          style={{
            display: 'flex', 
            flexDirection: 'row',
            gap: spacing,
            alignItems: 'center',
            justifyContent: 'left'
            }}
        >
            {children}
        </div>
    )
}