"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (checking) {
    return <main className="loading-screen">Loading your clubhouse…</main>;
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0];

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <img src="/fairway-dynasty-logo.png" alt="Fairway Dynasty" />
          <span>FAIRWAY <b>DYNASTY</b></span>
        </Link>
        <nav>
          <a className="active">Overview</a>
          <a>My Team</a>
          <a>League</a>
          <a>Transactions</a>
          <a>Majors</a>
        </nav>
        <button className="ghost-button" onClick={signOut}>Sign Out</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Clubhouse</p>
            <h1>Welcome, {displayName}</h1>
            <p className="muted">Your account is working. League features come next.</p>
          </div>
          <span className="account-chip">{user.email}</span>
        </header>

        <div className="stats-grid">
          <article className="stat-card"><span>League Rank</span><strong>—</strong><small>Join a league to begin</small></article>
          <article className="stat-card"><span>Roster</span><strong>0 / 10</strong><small>No golfers drafted</small></article>
          <article className="stat-card"><span>Season Points</span><strong>0.0</strong><small>Ready for competition</small></article>
        </div>

        <section className="empty-state">
          <div className="crest">♛</div>
          <p className="eyebrow">Next milestone</p>
          <h2>Create or join your first league.</h2>
          <p>Account creation and login are now live. Our next build will add league creation, invite codes, and member lists.</p>
          <button className="primary-button" disabled>League tools coming next</button>
        </section>
      </section>
    </main>
  );
}
