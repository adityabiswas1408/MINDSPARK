import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ProfileCard } from '@/components/profile/profile-card';
import { computeInitials, formatBirthDate } from '@/components/profile/profile-helpers';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type ProfileRow = {
  email: string;
  full_name: string;
  avatar_url: string | null;
  student: {
    roll_number: string;
    grade_section: string | null;
    dob: string | null;
    date_of_birth: string | null;
    gender: string | null;
    guardian_name: string | null;
    guardian_email: string | null;
    guardian_phone: string | null;
    consent_verified: boolean;
    level: { name: string };
  };
};

export default async function StudentProfilePage() {
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      `
      email,
      full_name,
      avatar_url,
      student:students!inner (
        roll_number,
        grade_section,
        dob,
        date_of_birth,
        gender,
        guardian_name,
        guardian_email,
        guardian_phone,
        consent_verified,
        level:levels!inner ( name )
      )
    `,
    )
    .eq('id', auth.userId)
    .maybeSingle<ProfileRow>();

  if (error || !profile) notFound();

  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Profile
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          Your school record. Contact your teacher to update any of these details.
        </p>
      </header>

      <ProfileCard
        fullName={profile.full_name}
        rollNumber={profile.student.roll_number}
        email={profile.email}
        levelName={profile.student.level.name}
        gradeSection={profile.student.grade_section}
        avatarUrl={profile.avatar_url}
        initials={computeInitials(profile.full_name)}
        dob={formatBirthDate(profile.student.dob, profile.student.date_of_birth)}
        gender={profile.student.gender}
        guardianName={profile.student.guardian_name}
        guardianEmail={profile.student.guardian_email}
        guardianPhone={profile.student.guardian_phone}
        consentVerified={profile.student.consent_verified}
      />
    </main>
  );
}
