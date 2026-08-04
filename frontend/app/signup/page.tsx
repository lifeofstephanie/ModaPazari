"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/schema/signupSchema";
import { authService } from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await authService.signUp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role,
      });
      toast.success("Account created successfully");
      router.push("/login");
    } catch (e) {
      console.error("Signup error:", e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:grid-cols-2">
        {/* Visual */}
        <div className="relative hidden min-h-[640px] md:block">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
            alt="Fashion editorial"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-8 left-8 text-white">
            <p className="font-[MomoSignature] text-4xl">Join the edit</p>
            <p className="mt-1 max-w-xs text-sm text-white/80">
              Create an account for a personalised experience.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center px-6 py-10 md:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Moda Pazari
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Welcome to Moda Pazari — let&apos;s get you started.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input {...register("firstName")} type="text" placeholder="First name" className="input" />
                {errors.firstName && <Err>{errors.firstName.message}</Err>}
              </Field>
              <Field label="Last name">
                <input {...register("lastName")} type="text" placeholder="Last name" className="input" />
                {errors.lastName && <Err>{errors.lastName.message}</Err>}
              </Field>
            </div>

            <Field label="Email">
              <input {...register("email")} type="email" placeholder="you@example.com" className="input" />
              {errors.email && <Err>{errors.email.message}</Err>}
            </Field>

            <Field label="Password">
              <input {...register("password")} type="password" placeholder="••••••••" className="input" />
              {errors.password && <Err>{errors.password.message}</Err>}
            </Field>

            <Field label="Account type">
              <select {...register("role")} className="input">
                <option value="buyer">Buyer — I want to shop</option>
                <option value="vendor">Vendor — I want to sell</option>
              </select>
              {errors.role && <Err>{errors.role.message}</Err>}
            </Field>

            <button
              disabled={isSubmitting}
              type="submit"
              className="mt-2 rounded-lg bg-accent-solid py-3 font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {isSubmitting ? "Signing up..." : "Create account"}
            </button>
            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 2.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0 0.85rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input::placeholder {
          color: var(--muted);
          opacity: 0.7;
        }
        .input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);

const Err = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-red-500">{children}</span>
);
