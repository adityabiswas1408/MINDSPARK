'use client';

interface QuestionNavItem {
  /** Unique question ID */
  questionId: string;
  /** 1-based question number */
  index: number;
  /** Whether the student has answered this question */
  isAnswered: boolean;
  /** Whether this is the currently active question */
  isCurrent: boolean;
  /** Whether the student explicitly skipped this question */
  isSkipped: boolean;
}

interface QuestionNavigatorProps {
  /** All questions with their current states */
  items: QuestionNavItem[];
  /** Called when student clicks a dot to navigate (EXAM type only) */
  onNavigate: (questionId: string) => void;
  /** Whether navigation is allowed (disabled during cooldown) */
  disabled?: boolean;
}

/**
 * Question dot navigator — EXAM type only.
 *
 * Parent controls mounting:
 *   {phase !== 'PHASE_2_FLASH' && <QuestionNavigator ... />}
 *
 * This component has NO phase awareness — it renders if mounted,
 * doesn't render if unmounted. The parent is responsible for
 * conditional rendering.
 */
export function QuestionNavigator({
  items,
  onNavigate,
  disabled = false,
}: QuestionNavigatorProps) {
  return (
    <nav
      data-testid="question-navigator"
      aria-label="Question navigation"
      className="flex flex-col gap-1.5 p-3"
    >
      {items.map((item) => {
        let bgColor = '#E2E8F0'; // default: unanswered (slate-200)
        let borderColor = 'transparent';
        let ariaLabel = `Question ${item.index}, unanswered`;

        if (item.isCurrent) {
          borderColor = '#1A3829';
          ariaLabel = `Question ${item.index}, current`;
        }

        if (item.isAnswered) {
          bgColor = '#DCFCE7'; // success bg — green-100
          ariaLabel = `Question ${item.index}, answered`;
        }

        if (item.isSkipped) {
          bgColor = '#FEF9C3'; // warning bg — yellow-100
          ariaLabel = `Question ${item.index}, skipped`;
        }

        return (
          <button
            key={item.questionId}
            data-testid="question-nav-dot"
            data-question-id={item.questionId}
            aria-label={ariaLabel}
            aria-current={item.isCurrent ? 'step' : undefined}
            disabled={disabled}
            onClick={() => onNavigate(item.questionId)}
            className="flex items-center justify-center rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: bgColor,
              border: `2px solid ${borderColor}`,
              fontFamily: 'var(--font-mono), monospace',
              fontVariantNumeric: 'tabular-nums',
              color: '#0F172A',
            }}
          >
            {item.index}
          </button>
        );
      })}
    </nav>
  );
}
