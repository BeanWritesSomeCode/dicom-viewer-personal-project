import { useState, useRef, useReducer, useId, useCallback } from 'react';
import { useViewerStore } from '../../stores/viewerStore';
import { useSegmentationStore } from '../../stores/segmentationStore';
import segmentationService from '../../services/segmentationService';
import { rgbaToHex, hexToRgba } from '../../lib/rgbToHex';
import StylePreview from './components/StylePreview';
import Lock from './icons/LockIcon';
import Eye from './icons/EyeIcon';
import Chevron from './icons/ChevronIcon';
import  {utilities, type Types as coreTypes } from '@cornerstonejs/core';
import type { Types as toolTypes } from '@cornerstonejs/tools';

const DEFAULT_DASH = [6, 4];
const { hexToRgb, rgbToHex } = utilities.color;

const parseDash = (dash: string | undefined) => {
    if (!dash) return null;
    const parts = dash
        .split('/[,\s]+/')
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 0);
    return parts.length ? parts : null;
}

interface SegmentRowProps {
    segmentationId: string,
    segmentIndex: number;
}

export default function SegmentRow({ segmentationId, segmentIndex }: SegmentRowProps) {
    const uid = useId();
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const activeViewport = useViewerStore((s) => s.activeViewport);
    const seg = useSegmentationStore((s) => s.segmentations[segmentationId].segments[segmentIndex]);
    console.log(`Segment ${segmentIndex}`, seg);

    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const rawColor = segmentationService.getSegmentIndexColor(activeViewport ?? 'v1', segmentationId, segmentIndex);
    const color = rgbToHex(rawColor[0], rawColor[1], rawColor[2]);
    const visible = segmentationService.getSegmentIndexVisibility(activeViewport ?? 'v1', segmentationId, segmentIndex);
    const style: toolTypes.ContourStyle = segmentationService.getSegmentStyle(segmentationId, segmentIndex);

    const hexColor = rgbToHex(color[0], color[1], color[2]);

    const renderOutline = style.renderOutline ?? false;
    const renderFill = style.renderFill ?? false;
    const outlineWidth = style.outlineWidth ?? 0.3;
    const outlineOpacity = style.outlineOpacity ?? 1;
    const fillAlpha = style.fillAlpha ?? 0.3;
    const dashed = style.outlineDash; // empty / undefined means solid
    const outlineDash = parseDash(style.outlineDash) ?? [];

    const handleVisibilityChange = useCallback((v: boolean) => {
      const success = segmentationService.setSegmentIndexVisibility(activeViewport ?? 'v1', segmentationId, segmentIndex, v);
      if (success) forceUpdate();
    }, []);

    const handleColorChange = useCallback((color: string) => {
      const newColor = hexToRgb(color);
      const success = segmentationService.setSegmentIndexColor(activeViewport ?? 'v1', segmentationId, segmentIndex, [newColor.r, newColor.g, newColor.b, 1] as coreTypes.Color);
      if (success) forceUpdate();
    }, []);

    const handleStyleChange = useCallback((newStyle: Partial<toolTypes.ContourStyle>) => {
      const success = segmentationService.setSegmentIndexStyle(activeViewport ?? 'v1', segmentationId, segmentIndex, newStyle);
      if (success) forceUpdate();
    }, []);

    return (
      <li className={`cs-item${seg.active ? ' is-active' : ''}${visible ? '': ' is-hidden'}`}>
        <style>{CSS}</style>

        <div className="cs-header">
          <label className="cs-swatch" title="Change color" style={{ background: hexColor }}>
            <input
              type="color"
              value={hexColor}
              aria-label={`Color for ${seg.label}`}
              disabled={false}
              onChange={(e) => {handleColorChange(e.target.value)}}
            />
          </label>

          <div className="cs-label-wrap">
            {editing ? (
              <input
                ref={inputRef}
                className="cs-label-input"
                value={draft}
                aria-label="Segment label"
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {}}
                onKeyDown={(e) => {if (e.key === 'Enter') () => {}; if (e.key === 'Escape') { setDraft('PLACEHOLDER'); setEditing(false) }}}
              />
            ) : (
              <button
                type="button"
                className="cs-label"
                onDoubleClick={() => setEditing(true)}
                title="Double-click to rename"
                >
                  <span className="cs-label-text">{seg.label}</span>
                  <span className="cs-index">#{segmentIndex}</span>
                  {false && <Lock />}
                </button>
            )}
          </div>

          <StylePreview
            color={hexColor}
            outlineWidth={outlineWidth}
            outlineOpacity={outlineOpacity}
            dash={outlineDash}
            renderOutline={renderOutline}
            renderFill={renderFill}
            fillAlpha={fillAlpha}
          />

          <button
            type="button"
            className="cs-icon-btn"
            aria-label={visible ? `Hide ${seg.label}` : `Show ${seg.label}`}
            aria-pressed={visible}
            onClick={() => handleVisibilityChange(!visible)}
          >
            <Eye off={!visible}/>
          </button>

          <button
            type="button"
            className="cs-icon-btn"
            aria-label={expanded ? 'Hide style options' : 'Show style options'}
            aria-expanded={expanded}
            aria-controls={`${uid}-panel`}
            onClick={() => setExpanded((v) => !v)}
          >
            <Chevron open={expanded} />
          </button>
        </div>

        {expanded && (<></>)}
      </li>
    );
}

const CSS = `
.cs-item {
  --cs-bg: #14181d;
  --cs-bg-hover: #1a1f26;
  --cs-panel: #10141a;
  --cs-line: #2a313b;
  --cs-text: #e6e9ed;
  --cs-dim: #8b95a3;
  --cs-accent: #5aa9e6;
  --cs-preview-bg: #0a0c0f;
  list-style: none;
  margin: 0;
  background: var(--cs-bg);
  color: var(--cs-text);
  border-bottom: 1px solid var(--cs-line);
  border-left: 3px solid transparent;
  font: 13px/1.3 system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.cs-item.is-active { border-left-color: var(--cs-accent); background: var(--cs-bg-hover); }
.cs-item.is-hidden .cs-label-text,
.cs-item.is-hidden .cs-preview { opacity: 0.45; }

.cs-header { display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 8px; min-height: 44px; }

.cs-swatch {
  position: relative; flex: none; width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.85); box-shadow: 0 0 0 1px var(--cs-line); cursor: pointer; overflow: hidden;
}
.cs-swatch input { position: absolute; inset: -6px; width: 40px; height: 40px; opacity: 0; cursor: pointer; }
.cs-swatch:focus-within { outline: 2px solid var(--cs-accent); outline-offset: 2px; }

.cs-label-wrap { flex: 1; min-width: 0; }
.cs-label {
  display: flex; align-items: baseline; gap: 6px; width: 100%; padding: 4px 2px; background: none; border: 0;
  color: inherit; font: inherit; text-align: left; cursor: pointer; border-radius: 3px;
}
.cs-label-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.cs-index { color: var(--cs-dim); font-size: 11px; font-variant-numeric: tabular-nums; }
.cs-label svg { align-self: center; color: var(--cs-dim); }
.cs-label-input {
  width: 100%; padding: 3px 5px; font: inherit; color: inherit; background: var(--cs-preview-bg);
  border: 1px solid var(--cs-accent); border-radius: 3px;
}

.cs-preview { flex: none; border-radius: 3px; box-shadow: 0 0 0 1px var(--cs-line); }

.cs-icon-btn {
  flex: none; display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  background: none; border: 0; border-radius: 4px; color: var(--cs-dim); cursor: pointer;
}
.cs-icon-btn:hover { background: rgba(255,255,255,0.07); color: var(--cs-text); }
.cs-icon-btn[aria-pressed='true'] { color: var(--cs-text); }

.cs-item button:focus-visible, .cs-item input:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 1px; }

.cs-panel { padding: 10px 12px 12px 41px; background: var(--cs-panel); border-top: 1px solid var(--cs-line); display: grid; gap: 12px; }

.cs-seg { display: inline-flex; justify-self: start; border: 1px solid var(--cs-line); border-radius: 5px; overflow: hidden; }
.cs-seg button { padding: 4px 12px; background: none; border: 0; color: var(--cs-dim); font: inherit; cursor: pointer; }
.cs-seg button.on { background: var(--cs-accent); color: #08131d; font-weight: 600; }

.cs-group { display: grid; gap: 8px; }
.cs-row { display: grid; grid-template-columns: 74px 1fr 44px; align-items: center; gap: 8px; }
.cs-row > label { color: var(--cs-dim); }
.cs-row output { text-align: right; font-variant-numeric: tabular-nums; color: var(--cs-dim); }
.cs-row input[type='range'] { width: 100%; accent-color: var(--cs-accent); }
.cs-row input:disabled { opacity: 0.4; }

.cs-check { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; }
.cs-check input { accent-color: var(--cs-accent); }
.cs-row .cs-check { grid-column: 1 / 2; }
.cs-dash { grid-column: 2 / 4; display: flex; gap: 12px; }
.cs-dash label { display: flex; align-items: center; gap: 6px; color: var(--cs-dim); }
.cs-dash input { width: 52px; padding: 2px 4px; background: var(--cs-preview-bg); color: var(--cs-text); border: 1px solid var(--cs-line); border-radius: 3px; font: inherit; }

@media (prefers-reduced-motion: reduce) { .cs-item * { transition: none !important; } }
`;