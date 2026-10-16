// import { rgbToHex } from "@cornerstonejs/core/utilities/color";
import { rgbaToHex } from "../../../lib/rgbToHex";

interface StylePreviewProps {
    color: string;
    outlineWidth: number;
    outlineOpacity: number;
    dash: number[];
    renderOutline: boolean;
    renderFill: boolean;
    fillAlpha: number;
}

export default function StylePreview({
    color,
    outlineWidth,
    outlineOpacity,
    dash,
    renderOutline,
    renderFill,
    fillAlpha,
}: StylePreviewProps) {
    return (
        <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden="true" className="cs-preview">
            <rect width="44" height="30" rx="3" fill="var(--cs-preview-bg)" />
            <path
                d="M8 20 C6 10, 14 5, 23 7 C33 8, 39 14, 34 22 C30 27, 14 27, 8 20Z"
                fill={renderFill ? color : 'none'}
                fillOpacity={renderFill ? fillAlpha : 0}
                stroke={renderOutline ? color : 'none'}
                strokeOpacity={outlineOpacity}
                strokeWidth={Math.min(outlineWidth, 5)}
                strokeDasharray={dash ? dash.join(' ') : undefined}
                strokeLinejoin="round"
            />
        </svg>
    );
}