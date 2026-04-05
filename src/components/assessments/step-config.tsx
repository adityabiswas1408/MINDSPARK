'use client';

import { AssessmentType, WizardConfig } from './wizard-types';

interface StepConfigProps {
  config: WizardConfig;
  assessment_type: AssessmentType;
  levels: { id: string; name: string }[];
  onChange: (config: Partial<WizardConfig>) => void;
}

const DELAY_OPTIONS = [300, 500, 750, 1000, 1500, 2000];

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: '14px',
  border: '1px solid #CBD5E1',
  borderRadius: '6px',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#0F172A',
  display: 'block',
  marginBottom: '4px',
};

export function StepConfig({ config, assessment_type, levels, onChange }: StepConfigProps) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <label style={labelStyle}>Assessment title *</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Q3 Mental Arithmetic"
          style={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Level *</label>
        <select
          value={config.level_id}
          onChange={(e) => onChange({ level_id: e.target.value })}
          style={fieldStyle}
        >
          <option value="">Select a level…</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Duration (minutes) *</label>
        <input
          type="number"
          min={1}
          max={180}
          value={config.duration_minutes}
          onChange={(e) => onChange({ duration_minutes: Number(e.target.value) })}
          style={fieldStyle}
        />
      </div>

      {assessment_type === 'TEST' && (
        <>
          <div>
            <label style={labelStyle}>Flash delay</label>
            <select
              value={config.delay_ms}
              onChange={(e) => onChange({ delay_ms: Number(e.target.value) })}
              style={fieldStyle}
            >
              {DELAY_OPTIONS.map((ms) => (
                <option key={ms} value={ms}>
                  {ms} ms
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Digit count</label>
              <input
                type="number"
                min={1}
                max={6}
                value={config.digit_count}
                onChange={(e) => onChange({ digit_count: Number(e.target.value) })}
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Row count</label>
              <input
                type="number"
                min={2}
                max={20}
                value={config.row_count}
                onChange={(e) => onChange({ row_count: Number(e.target.value) })}
                style={fieldStyle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
