import Link from 'next/link';

// Landing page - the Banani rush-hour story, framing the product for a
// first-time visitor before they pick passenger or driver sign-up.
export default function HomePage() {
  return (
    <div className="hero">
      <div className="hero-content flex-col lg:flex-row-reverse gap-10">
        <div className="mockup-phone border-primary hidden lg:block">
          <div className="camera" />
          <div className="display">
            <div className="artboard artboard-demo phone-1 bg-gradient-to-br from-primary to-brand-dark text-white p-6">
              <p className="text-xs opacity-80">8:41 AM · Banani Road 11</p>
              <p className="mt-4 font-semibold">Bullet · Jashim</p>
              <p className="text-sm mt-2">Nusrat → Mohakhali</p>
              <p className="text-sm">Rafiq → Gulshan 1</p>
              <div className="mt-6 badge badge-secondary">2/3 seats taken</div>
            </div>
          </div>
        </div>
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold">Dhaka Tesla Pool</h1>
          <p className="py-4 text-base-content/70">
            Share a seat. Split the fare. Survive Dhaka traffic. Request a ride on a shared
            three-wheeler &ldquo;Tesla&rdquo;, get pooled with someone heading your way, and track
            every seat and every taka in real time.
          </p>
          <div className="flex gap-3">
            <Link href="/register?role=passenger" className="btn btn-primary">
              I need a ride
            </Link>
            <Link href="/register?role=driver" className="btn btn-outline">
              I drive a Tesla
            </Link>
          </div>
          <p className="mt-4 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
