import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body =
        mode === "login" ? { email, password } : { fullName, email, password };
      const res = await api.post(endpoint, body);
      const token = res.data.accessToken || res.data.token;
      const userId = res.data.user?.id || res.data.userId;
      login(token, { id: userId, email });
      navigate("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-panel">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">
            JobPilot AI
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink/70">
                Full Name
              </span>
              <input
                className="input w-full"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Shreya Jain"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink/70">
              Email
            </span>
            <input
              className="input w-full"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink/70">
              Password
            </span>
            <input
              className="input w-full"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="button-primary w-full"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold text-ember hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-ember hover:underline"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
