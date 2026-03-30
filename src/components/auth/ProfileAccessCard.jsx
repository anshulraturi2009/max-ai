import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  name: "",
  dob: "",
  email: "",
  phoneNumber: "",
};

function normalizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

export default function ProfileAccessCard() {
  const { user, authConfigured, signInWithProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = location.state?.from || "/app";

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.displayName || "",
      dob: user.dob || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    });
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: field === "phoneNumber" ? normalizePhone(value) : value,
    }));
  }

  function validateForm() {
    if (!form.name.trim() || !form.dob || !form.email.trim() || !form.phoneNumber.trim()) {
      return "Name, DOB, email aur phone number sab required hain.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      return "Valid email enter karo.";
    }

    if (form.phoneNumber.replace(/\D/g, "").length < 10) {
      return "Valid phone number enter karo.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!authConfigured) {
      setError("Firebase setup missing hai. Pehle project config check karo.");
      return;
    }

    try {
      setPending(true);
      setError("");
      await signInWithProfile({
        displayName: form.name.trim(),
        dob: form.dob,
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
      });
      navigate(redirectPath);
    } catch (profileError) {
      setError(profileError?.message || "Profile save nahi hua. Ek baar phir try karo.");
    } finally {
      setPending(false);
    }
  }

  const inputClassName =
    "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-600";

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Personal detail auth
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          Continue to MAX AI
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Name, DOB, email aur phone number enter karo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-400">
                Full name
              </span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-400">
                Date of birth
              </span>
              <input
                type="date"
                value={form.dob}
                onChange={(event) => updateField("dob", event.target.value)}
                autoComplete="bday"
                className={inputClassName}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              Phone number
            </span>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              placeholder="+91..."
              autoComplete="tel"
              className={inputClassName}
            />
          </label>

          <p className="text-xs leading-5 text-slate-500">
            Basic detail auth only. No extra graphics, no extra steps.
          </p>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Opening..." : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
