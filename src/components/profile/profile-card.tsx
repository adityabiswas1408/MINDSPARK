'use client';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { valueOrFallback } from './profile-helpers';

export type ProfileCardProps = {
  fullName: string;
  rollNumber: string;
  email: string;
  levelName: string;
  gradeSection: string | null;
  avatarUrl: string | null;
  initials: string;
  dob: string | null;
  gender: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
  consentVerified: boolean;
};

function FieldRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  const { node, isMuted } = valueOrFallback(value);
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      <div className={`field-value${mono ? ' mono' : ''}${isMuted ? ' muted' : ''}`}>
        {node}
      </div>
    </div>
  );
}

function ConsentField({ verified }: { verified: boolean }) {
  return (
    <div className="field-row">
      <div className="field-label">Consent</div>
      <div className={`field-value${verified ? '' : ' muted'}`}>
        {verified ? (
          <span className="verified-pill">
            <Check />
            Verified
          </span>
        ) : (
          'Not verified'
        )}
      </div>
    </div>
  );
}

export function ProfileCard(props: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="profile-card">
      <div className="profile-hero">
        <div className="profile-avatar">
          {props.avatarUrl ? (
            <img src={props.avatarUrl} alt={props.fullName} />
          ) : (
            props.initials
          )}
        </div>
        <div className="profile-identity">
          <div className="profile-name">{props.fullName}</div>
          <div className="profile-role">
            <span>Student</span>
            <span className="dot">·</span>
            <span>{props.levelName}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">School Info</div>
        <div className="field-grid">
          <FieldRow label="Email" value={props.email} />
          <FieldRow label="Roll Number" value={props.rollNumber} mono />
          <FieldRow label="Level" value={props.levelName} />
          <FieldRow label="Grade Section" value={props.gradeSection} />
        </div>
      </div>

      <button
        type="button"
        className={`more-info-toggle${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="label">More Info</span>
        <ChevronDown className="chevron" />
      </button>

      {expanded && (
        <div className="more-info-section">
          <div className="field-grid">
            <FieldRow label="Date of Birth" value={props.dob} mono />
            <FieldRow label="Gender" value={props.gender} />
            <FieldRow label="Guardian Name" value={props.guardianName} />
            <FieldRow label="Guardian Email" value={props.guardianEmail} />
            <FieldRow label="Guardian Phone" value={props.guardianPhone} mono />
            <ConsentField verified={props.consentVerified} />
          </div>
        </div>
      )}
    </div>
  );
}
