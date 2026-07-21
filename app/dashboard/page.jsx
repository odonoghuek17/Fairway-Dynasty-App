"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function LeagueHomePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id;

  const [user, setUser] = useState(null);
  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const currentMembership = useMemo(
    () => members.find((member) => member.user_id === user?.id),
    [members, user]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: authData } = await supabase.auth.getUser();

      if (!active) return;

      if (!authData.user) {
        router.replace("/login");
        return;
      }

      setUser(authData.user);

      const { data, error } = await supabase.rpc("get_league_home", {
        p_league_id: leagueId
      });

      if (!active) return;

      if (error) {
        setMessage(error.message);
      } else {
        setLeague(data.league);
        setMembers(data.members || []);
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [leagueId, router]);

  async function copyInviteCode() {
    if (!league?.invite_code) return;
    await navigator.clipboard.writeText(league.invite_code);
    setMessage(`Invite code ${league.invite_code} copied.`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return <main className="loading-screen">Opening your league clubhouse…</main>;
  }

  if (!league) {
    return (
      <main className="league-error-page">
        <div className="empty-state compact">
          <div className="crest">♛</div>
          <h2>League unavailable.</h2>
          <p>{message || "You may not have access to this league."}</p>
          <Link className="primary-button" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const isCommissioner = currentMembership?.role === "commissioner";

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <img src="/fairway-dynasty-logo.png" alt="Fairway Dynasty" />
          <span>FAIRWAY <b>DYNASTY</b></span>
        </Link>

        <nav>
          <Link href="/dashboard">Overview</Link>
          <a className="active">League Home</a>
          <a>Members</a>
          <a>Draft Room</a>
          <a>Settings</a>
        </nav>

        <button className="ghost-button" onClick={signOut}>
          Sign Out
        </button>
      </aside>

      <section className="dashboard-content">
        <header className="league-hero">
          <div>
            <Link className="back-link" href="/dashboard">
              ← All leagues
            </Link>
            <p className="eyebrow">
              {isCommissioner ? "Commissioner Clubhouse" : "League Clubhouse"}
            </p>
            <h1>{league.name}</h1>
            <p className="muted">
              Manage your members, prepare for the draft, and build your dynasty.
            </p>
          </div>

          <div className="league-code-panel">
            <small>Invite code</small>
            <strong>{league.invite_code}</strong>
            <button onClick={copyInviteCode}>Copy Code</button>
          </div>
        </header>

        {message && <div className="dashboard-message">{message}</div>}

        <div className="stats-grid league-stats">
          <article className="stat-card">
            <span>Members</span>
            <strong>{members.length}</strong>
            <small>League managers</small>
          </article>
          <article className="stat-card">
            <span>Your role</span>
            <strong className="role-stat">
              {isCommissioner ? "Commissioner" : "Member"}
            </strong>
            <small>
              {isCommissioner ? "Full league controls" : "League participant"}
            </small>
          </article>
          <article className="stat-card">
            <span>Draft status</span>
            <strong>Not Set</strong>
            <small>Commissioner setup coming next</small>
          </article>
        </div>

        <section className="league-home-grid">
          <article className="members-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">League membership</p>
                <h2>Clubhouse Members</h2>
              </div>
              <span>{members.length} joined</span>
            </div>

            <div className="member-list">
              {members.map((member, index) => (
                <div className="member-row" key={member.user_id}>
                  <div className="member-avatar">
                    {(member.display_name || member.email || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="member-info">
                    <strong>
                      {member.display_name || member.email?.split("@")[0] || "Manager"}
                    </strong>
                    <span>
                      {member.role === "commissioner"
                        ? "Commissioner"
                        : `Member ${index + 1}`}
                    </span>
                  </div>
                  <span className={`role-badge ${member.role}`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <aside className="league-sidebar-panel">
            <p className="eyebrow">Next milestone</p>
            <h2>Prepare the draft room.</h2>
            <p>
              Next we’ll add league settings, roster size, draft order, and a live
              snake-draft board.
            </p>

            <div className="setup-list">
              <div><span>1</span><p><b>Members</b><small>Invite managers with your code.</small></p></div>
              <div><span>2</span><p><b>League settings</b><small>Choose roster and scoring rules.</small></p></div>
              <div><span>3</span><p><b>Draft room</b><small>Set the order and begin drafting.</small></p></div>
            </div>

            <button className="primary-button" disabled>
              Draft setup coming next
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}

