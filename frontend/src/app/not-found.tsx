import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero py-24">
      <div className="hero-content text-center">
        <div>
          <div className="text-5xl mb-4">🛺💨</div>
          <h1 className="text-2xl font-bold">Bullet took a wrong turn</h1>
          <p className="py-4 text-base-content/60">We couldn&apos;t find that page.</p>
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
