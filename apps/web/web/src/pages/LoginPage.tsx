import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const redirect = sp.get("redirect") ?? "/account";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate(redirect),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not sign in. Check your details and try again.",
          ),
      },
    );
  };

  return (
    <div className="container-px flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl font-extrabold uppercase tracking-tight">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="underline hover:text-fg">
            Create an account
          </Link>
        </p>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {error && <p className="text-[13px] text-sale">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={login.isPending}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-line bg-bg px-3 text-sm outline-none focus-visible:border-fg focus-visible:ring-2"
      />
    </label>
  );
}
