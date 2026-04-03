import { requireRole } from '@/lib/auth/rbac';
import { AlertCircle, CheckCircle2, ShieldAlert, BadgeCheck } from 'lucide-react';

export default async function StudentConsentPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;

  const resolvedParams = await props.searchParams;
  const status = resolvedParams.status as string || 'pending';

  return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-6">
      {status === 'verified' && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Consent Verified</h1>
          <p className="text-green-700">Your guardian consent has been successfully verified.</p>
        </div>
      )}
      
      {status === 'expired' && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
          <h1 className="text-2xl font-bold text-amber-800 mb-2">Link Expired</h1>
          <p className="text-amber-700">This verification link has expired. Please request a new one.</p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Invalid Link</h1>
          <p className="text-red-700">The consent link provided is corrupted or invalid.</p>
        </div>
      )}

      {status === 'already_verified' && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-md">
          <BadgeCheck className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Already Verified</h1>
          <p className="text-blue-700">Your consent was previously verified. No further action needed.</p>
        </div>
      )}

      {status === 'pending' && (
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">Guardian Consent</h1>
          <p className="text-secondary">Please have your guardian confirm permission to store your offline results.</p>
        </div>
      )}
    </div>
  );
}
