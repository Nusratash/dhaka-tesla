'use client';

import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-16 flex flex-col gap-4">
      <ErrorAlert message={error.message || 'Something went wrong.'} />
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
