import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1 }}>
          Empowering the <span style={{ color: 'var(--primary)' }}>Future Workforce</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '2rem auto' }}>
          SkillBridge is an end-to-end attendance management system designed for 
          state-level skilling programmes. Seamlessly manage sessions, batches, and real-time tracking.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem' }}>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Get Started
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Go to Dashboard
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '4rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Multi-Role Support</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tailored views for Students, Trainers, Institutions, PMs, and Monitoring Officers.
          </p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Real-time Tracking</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Instant attendance marking and automated summaries across institutions.
          </p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Secure & Scalable</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Role-based access control verified at the API level for every request.
          </p>
        </div>
      </div>
    </main>
  );
}
