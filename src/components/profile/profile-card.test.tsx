import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileCard } from './profile-card';

const fullProps = {
  fullName: 'Aditi Sharma',
  rollNumber: '2024-A-15',
  email: 'aditi.sharma@stxavier.edu.in',
  levelName: 'Level 3',
  gradeSection: 'Grade 8 — Section A',
  avatarUrl: null,
  initials: 'AS',
  dob: '14 Aug 2012',
  gender: 'Female',
  guardianName: 'Rajesh Sharma',
  guardianEmail: 'rajesh.sharma@gmail.com',
  guardianPhone: '+91 98765 43210',
  consentVerified: true,
};

const sparseProps = {
  ...fullProps,
  fullName: 'Rohan Kumar',
  initials: 'RK',
  email: 'rohan.kumar@stxavier.edu.in',
  rollNumber: '2026-B-04',
  gradeSection: null,
  dob: null,
  gender: null,
  guardianName: null,
  guardianEmail: null,
  guardianPhone: null,
  consentVerified: false,
};

describe('<ProfileCard>', () => {
  it('renders the hero strip with initials when avatarUrl is null', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.getByText('AS')).toBeDefined();
    expect(screen.getByText('Aditi Sharma')).toBeDefined();
    // "Level 3" appears in both the role line AND the School Info field grid
    expect(screen.getAllByText(/Level 3/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders an <img> for the avatar when avatarUrl is set', () => {
    const { container } = render(
      <ProfileCard {...fullProps} avatarUrl="https://example.com/me.jpg" />
    );
    const img = container.querySelector('.profile-avatar img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.src).toContain('me.jpg');
  });

  it('renders all four School Info fields by default', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.getByText('aditi.sharma@stxavier.edu.in')).toBeDefined();
    expect(screen.getByText('2024-A-15')).toBeDefined();
    expect(screen.getByText('Grade 8 — Section A')).toBeDefined();
    // The role line already contains "Level 3", so we look inside the field grid:
    const fieldValues = screen.getAllByText(/Level 3/);
    expect(fieldValues.length).toBeGreaterThanOrEqual(2);
  });

  it('starts with More Info collapsed (DOB not visible)', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.queryByText('14 Aug 2012')).toBeNull();
  });

  it('expands More Info when the toggle is clicked', () => {
    render(<ProfileCard {...fullProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('14 Aug 2012')).toBeDefined();
    expect(screen.getByText('Female')).toBeDefined();
    expect(screen.getByText('Rajesh Sharma')).toBeDefined();
  });

  it('collapses More Info on a second click', () => {
    render(<ProfileCard {...fullProps} />);
    const toggle = screen.getByRole('button', { name: /more info/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(screen.queryByText('14 Aug 2012')).toBeNull();
  });

  it('renders the green Verified pill when consentVerified is true', () => {
    render(<ProfileCard {...fullProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('Verified')).toBeDefined();
  });

  it('renders "Not verified" muted when consentVerified is false', () => {
    render(<ProfileCard {...sparseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('Not verified')).toBeDefined();
    expect(screen.queryByText('Verified')).toBeNull();
  });

  it('renders "Not mentioned" for null More Info fields', () => {
    render(<ProfileCard {...sparseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    // sparseProps has 6 nulls total that render as "Not mentioned":
    // - 1 in School Info (gradeSection)
    // - 5 in More Info (dob, gender, guardianName, guardianEmail, guardianPhone)
    // Consent renders as "Not verified", which is NOT counted here.
    const muted = screen.getAllByText('Not mentioned');
    expect(muted.length).toBe(6);
  });

  it('renders "Not mentioned" for a null gradeSection in School Info', () => {
    render(<ProfileCard {...sparseProps} />);
    expect(screen.getByText('Not mentioned')).toBeDefined();
  });
});
