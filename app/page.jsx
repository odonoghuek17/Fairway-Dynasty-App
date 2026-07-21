import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="site-header">
        <Link href="/" className="brand">
          <img src="/fairway-dynasty-logo.png" alt="Fairway Dynasty" />
          <span>FAIRWAY <b>DYNASTY</b></span>
        </Link>
        <nav>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <Link className="text-link" href="/login">Log In</Link>
          <Link className="nav-button" href="/signup">Create Account</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Premium Dynasty Fantasy Golf</p>
          <h1>Draft. Keep. Trade. <span>Conquer the majors.</span></h1>
          <p className="hero-text">Build a roster that lasts, compete through golf’s biggest events, and create a legacy season after season.</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/signup">Create Account</Link>
            <Link className="secondary-button" href="/login">Member Login</Link>
          </div>
        </div>
        <div className="hero-card">
          <span className="live-tag">ACCOUNT SYSTEM LIVE</span>
          <h3>Your clubhouse awaits.</h3>
          <p>Create an account, confirm your email, and enter your protected dashboard.</p>
          <div className="score-row"><span>Phase 1</span><strong>Auth ✓</strong></div>
        </div>
      </section>

      <section id="features" className="feature-grid">
        <article><b>01</b><h3>Dynasty Rosters</h3><p>Keep your golfers and build for the long term.</p></article>
        <article><b>02</b><h3>League Competition</h3><p>Compete with friends through the full season.</p></article>
        <article><b>03</b><h3>Major Focus</h3><p>The biggest championships carry the biggest stakes.</p></article>
        <article><b>04</b><h3>Real Strategy</h3><p>Draft, trade, manage, and build a lasting winner.</p></article>
      </section>

      <section id="how" className="home-cta">
        <p className="eyebrow">Your legacy starts here</p>
        <h2>Fairway Dynasty is now more than a mockup.</h2>
        <p>The first real feature—secure account creation and login—is ready to connect to Supabase.</p>
        <Link className="primary-button" href="/signup">Start Your Dynasty</Link>
      </section>
    </main>
  );
}
