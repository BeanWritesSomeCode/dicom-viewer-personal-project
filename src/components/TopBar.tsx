import type { ReactNode } from "react";
import './TopBar.css';


interface TopBarProps {
    children: ReactNode;
};


export default function TopBar({ children }: TopBarProps) {


    return (
        <div className="top-bar">
            <div className="top-bar-content">
                {children}
            </div>
        </div>
    )
}