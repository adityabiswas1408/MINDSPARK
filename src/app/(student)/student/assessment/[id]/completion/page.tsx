import Link from 'next/link';

export default function CompletionPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 text-center space-y-6 bg-card border rounded-lg shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Exam Submitted</h1>
          <p className="text-muted-foreground">
            Your exam has been successfully submitted and saved.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          {/* Note: In Phase 9.2, this can be linked to the actual result view */}
          <Link
            href="/student/results"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Results
          </Link>
          <Link
            href="/student/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
