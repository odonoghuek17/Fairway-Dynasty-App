"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { display_name: form.name },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
        } else {
          setMessage("Account created. Check your email to confirm it, then log in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });

        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link href="/" className="brand">
          <img src="/fairway-dynasty-logo.png" alt="Fairway Dynasty" />
          <span>FAIRWAY <b>DYNASTY</b></span>
        </Link>
        <div>
          <p className="eyebrow">Premium Dynasty Fantasy Golf</p>
          <h1>{isSignup ? "Start your dynasty." : "Welcome back."}</h1>
          <p className="muted">
            Build a roster that lasts, compete through the majors, and create your golf legacy.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">{isSignup ? "Create account" : "Member login"}</p>
          <h2>{isSignup ? "Join Fairway Dynasty" : "Log in to your account"}</h2>

          {isSignup && (
            <label>
              Display name
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Kevin"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              placeholder="At least 6 characters"
              minLength={6}
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>

          {message && <div className="message">{message}</div>}

          <button className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
          </button>

          <p className="switch-copy">
            {isSignup ? "Already have an account?" : "New to Fairway Dynasty?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create one"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
