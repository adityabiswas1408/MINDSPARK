import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreFraction } from './score-fraction';

describe('<ScoreFraction>', () => {
  it('renders got/total in lg size', () => {
    render(<ScoreFraction got={26} total={30} size="lg" />);
    expect(screen.getByText('26')).toBeDefined();
    expect(screen.getByText('/30')).toBeDefined();
    const root = screen.getByTestId('score-fraction');
    expect(root.className).toMatch(/size-lg/);
  });

  it('renders an em-dash when got is null', () => {
    render(<ScoreFraction got={null} total={null} size="md" />);
    expect(screen.getByText('—')).toBeDefined();
  });

  it('renders the .score-fraction class that owns DM Mono + tabular-nums in globals.css', () => {
    // jsdom does not load globals.css, so we verify the contract by class membership:
    // the .score-fraction class is the only thing that styles font-family DM Mono and
    // font-variant-numeric: tabular-nums. If the component renders this class, the
    // styling will apply in the real browser.
    const { container } = render(<ScoreFraction got={18} total={25} size="sm" />);
    const el = container.querySelector('[data-testid="score-fraction"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('score-fraction')).toBe(true);
    expect(el.classList.contains('size-sm')).toBe(true);
  });
});
