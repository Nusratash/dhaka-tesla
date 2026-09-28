import Link from 'next/link';
export default function DriverNotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-lg font-semibold">Tesla not found</p>
      <Link href="/driver/dashboard" className="btn btn-primary mt-4">Back to dashboard</Link>
    </div>
  );
}
