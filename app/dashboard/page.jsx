"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [checking, setChecking] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState("");

  const loadLeagues = useCallback(async (userId) => {
    setLoadingLeagues(true);

    const { data, error } = await supabase
      .from("league_members")
      .select(`
        role,
        joined_at,
        leagues (
          id,
          name,
          invite_code,
          commissioner_id,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLeagues([]);
    } else {
      setLeagues((data || []).filter((item) => item.leagues));
    }

    setLoadingLeagues(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      await loadLeagues(data.user.id);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, loadLeagues]);

  async function createLeague(event) {
    event.preventDefault();
    const name = createName.trim();

    if (name.length < 3) {
      setMessage("League names must be at least 3 characters.");
      return;
    }

    setWorking("create");
    setMessage("");

    const { data, error } = await supabase.rpc("create_league", {
      p_name: name
    });

    if (error) {
      setMessage(error.message);
    } else {
      setCreateName("");
      setMessage(`League created. Invite code: ${data.invite_code}`);
      await loadLeagues(user.id);
    }

    setWorking("");
  }

  async function joinLeague(event) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6) {
      setMessage("Enter the complete 6-character invite code.");
      return;
    }

    setWorking("join");
    setMessage("");

    const { data, error } = await supabase.rpc("join_league_by_code", {
      p_code: code
    });

    if (error) {
      setMessage(error.message);
    } else {
      setJoinCode("");
      setMessage(`You joined ${data.name}.`);
      await loadLeagues(user.id);
    }

    setWorking("");
  }

  async function copyCode(code) {
    await navigator.clipboard.writeText(code);
    setMessage(`Invite code ${code} copied.`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (checking) {
    return <main className="loading-screen">Loading your clubhouse…</main>;
  }

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0];

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

        <button className="ghost-button" onClick={signOut}>
          Sign Out
        </button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Clubhouse</p>
            <h1>Welcome, {displayName}</h1>
            <p className="muted">
              Create a league or join one using a commissioner’s invite code.
            </p>
          </div>
          <span className="account-chip">{user.email}</span>
        </header>

        {message && <div className="dashboard-message">{message}</div>}

        <section className="league-action-grid">
          <form className="league-action-card" onSubmit={createLeague}>
            <p className="eyebrow">Commissioner tools</p>
            <h2>Create a league</h2>
            <p>Start a new dynasty and receive a code to invite friends.</p>
            <label>
              League name
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Sunday Pins Dynasty"
                minLength={3}
                maxLength={50}
                required
              />
            </label>
            <button className="primary-button" disabled={working === "create"}>
              {working === "create" ? "Creating…" : "Create League"}
            </button>
          </form>

          <form className="league-action-card" onSubmit={joinLeague}>
            <p className="eyebrow">Have an invitation?</p>
            <h2>Join a league</h2>
            <p>Enter the six-character code shared by the commissioner.</p>
            <label>
              Invite code
              <input
                className="code-input"
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="FD2026"
                minLength={6}
                maxLength={6}
                required
              />
            </label>
            <button className="secondary-button" disabled={working === "join"}>
              {working === "join" ? "Joining…" : "Join League"}
            </button>
          </form>
        </section>

        <section className="league-list-section">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Your leagues</p>
              <h2>Dynasties</h2>
            </div>
            <span>{leagues.length} total</span>
          </div>

          {loadingLeagues ? (
            <div className="empty-state compact">Loading leagues…</div>
          ) : leagues.length === 0 ? (
            <div className="empty-state compact">
              <div className="crest">♛</div>
              <h2>No leagues yet.</h2>
              <p>Create one above or ask a commissioner for an invite code.</p>
            </div>
          ) : (
            <div className="league-grid">
              {leagues.map(({ role, leagues: league }) => (
                <article className="league-card" key={league.id}>
                  <div className="league-card-top">
                    <span className={`role-badge ${role}`}>
                      {role === "commissioner" ? "Commissioner" : "Member"}
                    </span>
                    <span className="member-count">Season setup</span>
                  </div>
                  <h3>{league.name}</h3>
                  <p>
                    {role === "commissioner"
                      ? "Share this code to invite league members."
                      : "You are officially part of this dynasty."}
                  </p>
                  <div className="invite-code-row">
                    <div>
                      <small>Invite code</small>
                      <strong>{league.invite_code}</strong>
                    </div>
                    <button onClick={() => copyCode(league.invite_code)}>
                      Copy
                    </button>
                  </div>
                  <button className="league-enter-button" disabled>
                    League home coming next
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
