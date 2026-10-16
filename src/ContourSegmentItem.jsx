import React, { useState, useRef, useEffect, useId } from 'react';

/**
 * ContourSegmentItem
 *
 * A list row for one segment of a Cornerstone3D contour segmentation.
 * Fully controlled: it renders what you pass in and reports changes through
 * callbacks. It never calls Cornerstone itself, so you decide how to wire it up
 * (see the example at the bottom of this file).
 *
 * segment: {
 *   segmentIndex: number,
 *   label: string,
 *   color: [r, g, b, a],   // 0-255, same shape Cornerstone uses
 *   visible: boolean,
 *   active?: boolean,      // is this the active segment index
 *   locked?: boolean,
 * }
 *
 * style: contour representation style for this segment. Property names match
 * Cornerstone's contour segmentation style:
 *   renderOutline, outlineWidth, outlineOpacity, outlineDash,
 *   renderFill, fillAlpha
 *   + the same keys suffixed with "Inactive" (renderOutlineInactive,
 *     outlineWidthInactive, outlineOpacityInactive, outlineDashInactive,
 *     renderFillInactive, fillAlphaInactive)
 *   outlineDash is a string such as "6,4"; empty / undefined means solid.
 */

const DEFAULT_DASH = [6, 4];

const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const parseDash = (dash) => {
  if (!dash) return null;
  const parts = String(dash)
    .split(/[,\s]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 0);
  return parts.length ? parts : null;
};

const EyeIcon = ({ off }) => (
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

const Chevron = ({ open }) => (
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

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Locked">
    <rect x="2" y="5.5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** Small preview of how the contour will look: outline, dash and fill. */
function StylePreview({ color, outlineWidth, outlineOpacity, dash, renderOutline, renderFill, fillAlpha }) {
  const hex = rgbToHex(color);
  return (
    <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden="true" className="cs-preview">
      <rect width="44" height="30" rx="3" fill="var(--cs-preview-bg)" />
      <path
        d="M8 20 C6 10, 14 5, 23 7 C33 8, 39 14, 34 22 C30 27, 14 27, 8 20Z"
        fill={renderFill ? hex : 'none'}
        fillOpacity={renderFill ? fillAlpha : 0}
        stroke={renderOutline ? hex : 'none'}
        strokeOpacity={outlineOpacity}
        strokeWidth={Math.min(outlineWidth, 5)}
        strokeDasharray={dash ? dash.join(' ') : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Slider({ id, label, value, min, max, step, onChange, format, disabled }) {
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
  );
}

function Check({ id, label, checked, onChange }) {
  return (
    <label className="cs-check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function ContourSegmentItem({
  segment = { segmentIndex: 1, label: 'Segment 1', color: [220, 80, 60, 255], visible: true },
  style = {},
  defaultExpanded = false,
  onSelect,
  onLabelChange,
  onVisibilityChange,
  onColorChange,
  onStyleChange,
}) {
  const uid = useId();
  const { segmentIndex, label, color, visible, active, locked } = segment;

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const [mode, setMode] = useState('active'); // 'active' | 'inactive'
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  // Resolve style keys for the chosen mode (active vs inactive segmentation).
  const sfx = mode === 'inactive' ? 'Inactive' : '';
  const key = (k) => `${k}${sfx}`;
  const read = (k, fallback) => style[key(k)] ?? fallback;

  const renderOutline = read('renderOutline', true);
  const renderFill = read('renderFill', mode === 'active' ? false : false);
  const outlineWidth = read('outlineWidth', mode === 'active' ? 3 : 1);
  const outlineOpacity = read('outlineOpacity', 1);
  const fillAlpha = read('fillAlpha', mode === 'active' ? 0.5 : 0.3);
  const dashArr = parseDash(read('outlineDash', undefined));
  const dashed = !!dashArr;

  const set = (k, v) => onStyleChange?.(segmentIndex, { [key(k)]: v });

  const setDashed = (on) => set('outlineDash', on ? (dashArr ?? DEFAULT_DASH).join(',') : undefined);
  const setDashPart = (i, v) => {
    const next = [...(dashArr ?? DEFAULT_DASH)];
    next[i] = Math.max(0, v);
    set('outlineDash', next.join(','));
  };

  const commitLabel = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) onLabelChange?.(segmentIndex, trimmed);
    else setDraft(label);
  };

  const hex = rgbToHex(color);
  const panelId = `${uid}-panel`;

  return (
    <li className={`cs-item${active ? ' is-active' : ''}${visible ? '' : ' is-hidden'}`}>
      <style>{CSS}</style>

      <div className="cs-header">
        <label className="cs-swatch" title="Change color" style={{ background: hex }}>
          <input
            type="color"
            value={hex}
            aria-label={`Color for ${label}`}
            disabled={locked}
            onChange={(e) => onColorChange?.(segmentIndex, [...hexToRgb(e.target.value), color[3] ?? 255])}
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
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitLabel();
                if (e.key === 'Escape') {
                  setDraft(label);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              className="cs-label"
              onClick={() => onSelect?.(segmentIndex)}
              onDoubleClick={() => !locked && setEditing(true)}
              title={locked ? label : 'Click to select, double-click to rename'}
              aria-pressed={!!active}
            >
              <span className="cs-label-text">{label}</span>
              <span className="cs-index">#{segmentIndex}</span>
              {locked && <LockIcon />}
            </button>
          )}
        </div>

        <StylePreview
          color={color}
          outlineWidth={outlineWidth}
          outlineOpacity={outlineOpacity}
          dash={dashArr}
          renderOutline={renderOutline}
          renderFill={renderFill}
          fillAlpha={fillAlpha}
        />

        <button
          type="button"
          className="cs-icon-btn"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          onClick={() => onVisibilityChange?.(segmentIndex, !visible)}
        >
          <EyeIcon off={!visible} />
        </button>

        <button
          type="button"
          className="cs-icon-btn"
          aria-label={expanded ? 'Hide style options' : 'Show style options'}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((v) => !v)}
        >
          <Chevron open={expanded} />
        </button>
      </div>

      {expanded && (
        <div className="cs-panel" id={panelId}>
          <div className="cs-seg" role="group" aria-label="Style applies to">
            {['active', 'inactive'].map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                className={mode === m ? 'on' : ''}
                onClick={() => setMode(m)}
              >
                {m === 'active' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>

          <div className="cs-group">
            <Check
              id={`${uid}-outline`}
              label="Outline"
              checked={renderOutline}
              onChange={(v) => set('renderOutline', v)}
            />
            <Slider
              id={`${uid}-width`}
              label="Width"
              value={outlineWidth}
              min={0.5}
              max={10}
              step={0.5}
              disabled={!renderOutline}
              onChange={(v) => set('outlineWidth', v)}
              format={(v) => `${v}px`}
            />
            <Slider
              id={`${uid}-oop`}
              label="Opacity"
              value={outlineOpacity}
              min={0}
              max={1}
              step={0.05}
              disabled={!renderOutline}
              onChange={(v) => set('outlineOpacity', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <div className="cs-row">
              <Check id={`${uid}-dash`} label="Dashed" checked={dashed} onChange={setDashed} />
              <div className="cs-dash" aria-hidden={!dashed}>
                <label>
                  <span>Dash</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!dashed || !renderOutline}
                    value={(dashArr ?? DEFAULT_DASH)[0]}
                    onChange={(e) => setDashPart(0, Number(e.target.value))}
                  />
                </label>
                <label>
                  <span>Gap</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!dashed || !renderOutline}
                    value={(dashArr ?? DEFAULT_DASH)[1] ?? DEFAULT_DASH[1]}
                    onChange={(e) => setDashPart(1, Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="cs-group">
            <Check id={`${uid}-fill`} label="Fill" checked={renderFill} onChange={(v) => set('renderFill', v)} />
            <Slider
              id={`${uid}-alpha`}
              label="Fill alpha"
              value={fillAlpha}
              min={0}
              max={1}
              step={0.05}
              disabled={!renderFill}
              onChange={(v) => set('fillAlpha', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        </div>
      )}
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

/* -------------------------------------------------------------------------
 * Example wiring (Cornerstone3D). Verify the exact function signatures
 * against the v5.0 docs/changelog before shipping; the segmentation config
 * API has been reorganized between major versions.
 *
 * import { segmentation, Enums } from '@cornerstonejs/tools';
 * const { Contour } = Enums.SegmentationRepresentations;
 *
 * <ContourSegmentItem
 *   segment={{ segmentIndex, label, color, visible, active }}
 *   style={segmentStyle}
 *   onVisibilityChange={(idx, visible) =>
 *     segmentation.config.visibility.setSegmentIndexVisibility(
 *       viewportId, { segmentationId, type: Contour }, idx, visible)}
 *   onColorChange={(idx, rgba) =>
 *     segmentation.config.color.setSegmentIndexColor(
 *       viewportId, segmentationId, idx, rgba)}
 *   onStyleChange={(idx, partial) =>
 *     segmentation.config.style.setStyle(
 *       { type: Contour, segmentationId, segmentIndex: idx }, partial)}
 *   onLabelChange={(idx, label) =>
 *     segmentation.updateSegmentations([{ segmentationId, payload: {
 *       segments: { [idx]: { label } } } }])}
 *   onSelect={(idx) =>
 *     segmentation.segmentIndex.setActiveSegmentIndex(segmentationId, idx)}
 * />
 * ----------------------------------------------------------------------- */
