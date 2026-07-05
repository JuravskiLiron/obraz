import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Field } from "./LoginPage";
import { ApiError } from "@/lib/api";

export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const redirect = sp.get("redirect") ?? "/account";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    register.mutate(
      { firstName, lastName, email, password },
      {
        onSuccess: () => navigate(redirect),
        onError: (err) =>
          setError(
            err instanceof ApiError ? err.message : "Could not create account.",
          ),
      },
    );
  };

  return (
    <div className="container-px flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl font-extrabold uppercase tracking-tight">
          Create account
        </h1>
        <p className="mb-6 text-sm text-muted">
          Already have one?{" "}
          <Link to="/login" className="underline hover:text-fg">
            Sign in
          </Link>
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <Field label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <p className="text-[12px] text-muted">At least 8 characters.</p>
          {error && <p className="text-[13px] text-sale">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={register.isPending}>
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
}
