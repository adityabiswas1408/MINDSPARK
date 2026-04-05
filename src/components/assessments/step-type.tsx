'use client';

import { Layers, Zap } from 'lucide-react';
import { AssessmentType } from './wizard-types';

interface StepTypeProps {
  onSelect: (type: AssessmentType) => void;
  selected: AssessmentType | null;
  loading: boolean;
}

export function StepType({ onSelect, selected, loading }: StepTypeProps) {
  const cards: { type: AssessmentType; icon: React.ReactNode; title: string; description: string; tag: string }[] = [
    {
      type: 'EXAM',
      icon: <Layers size={28} />,
      title: 'EXAM',
      description: 'Vertical equations + MCQ. Structured formal examination.',
      tag: 'HIGH PRECISION',
    },
    {
      type: 'TEST',
      icon: <Zap size={28} />,
      title: 'TEST',
      description: 'Flash Anzan sequence + MCQ. Speed and accuracy drill.',
      tag: 'SPEED & ACCURACY',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {cards.map((card) => {
        const isSelected = selected === card.type;
        return (
          <button
            key={card.type}
            type="button"
            disabled={loading}
            onClick={() => onSelect(card.type)}
            style={{
              border: isSelected ? '2px solid #1A3829' : '1px solid #E2E8F0',
              backgroundColor: isSelected ? 'rgba(26,56,41,0.05)' : '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.15s, background-color 0.15s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSelected && !loading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !loading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
              }
            }}
          >
            <div style={{ color: '#1A3829', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#0F172A', marginBottom: '6px' }}>
              {card.title}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
              {card.description}
            </div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#1A3829' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#475569',
              }}
            >
              {card.tag}
            </span>
          </button>
        );
      })}
    </div>
  );
}
