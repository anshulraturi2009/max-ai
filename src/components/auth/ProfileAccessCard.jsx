import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  name: "",
  gender: "",
  phoneNumber: "",
};

function normalizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

const genderOptions = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
];

export default function ProfileAccessCard() {
  const { user, authConfigured, completeGoogleProfile, signOutUser } = useAuth();
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
      gender: user.gender || "",
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
    if (!form.name.trim() || !form.gender.trim() || !form.phoneNumber.trim()) {
      return "Name, gender, and phone number are required.";
    }

    if (form.phoneNumber.replace(/\D/g, "").length < 10) {
      return "Enter a valid phone number.";
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
      setError("Firebase setup is missing. Please review the project config.");
      return;
    }

    try {
      setPending(true);
      setError("");
      await completeGoogleProfile({
        displayName: form.name.trim(),
        gender: form.gender.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      navigate(redirectPath, { replace: true });
    } catch (profileError) {
      setError(profileError?.message || "Your profile could not be saved. Please try again.");
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
          Google onboarding
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          One last step
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Save your name, gender, and phone number so MAX AI can personalize
          your first greeting.
        </p>

        {user?.email ? (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            Signed in as <span className="font-medium text-white">{user.email}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div>
            <span className="mb-2 block text-xs font-medium text-slate-400">
              Gender
            </span>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((option) => {
                const selected = form.gender === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField("gender", option.id)}
                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                      selected
                        ? "border-orange-400 bg-orange-500/15 text-white shadow-[0_0_24px_rgba(249,115,22,0.16)]"
                        : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

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
            Your greeting will adapt to the time of day and your selected profile.
          </p>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Saving..." : "Continue to MAX AI"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOutUser()}
          className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Use another Google account
        </button>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
