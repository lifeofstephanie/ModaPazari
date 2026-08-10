"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schema/loginSchema";
import { authService } from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const destinationFor = (role?: string) =>
    role === "vendor" ? "/vendor" : role === "admin" ? "/admin" : "/shop";

  useEffect(() => {
    if (user) router.replace(destinationFor(user.role));
  }, [user, router]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await authService.sigIn({
        email: data.email,
        password: data.password,
      });
      setUser({
        token: res.data.token,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        role: res.data.role,
        avatar: res.data.avatar,
        vendorStatus: res.data.vendorStatus,
        emailVerified: res.data.emailVerified,
      });
      // Fold the guest cart into the server cart so it follows the user.
      useCartStore.getState().mergeGuestCartOnLogin();
      toast.success("Logged in successfully");
      router.push(destinationFor(res.data.role));
    } catch (e) {
      console.error("Login error:", e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:grid-cols-2">
        {/* Visual */}
        <div className="relative hidden min-h-[560px] md:block">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
            alt="Fashion editorial"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-8 left-8 text-white">
            <p className="font-[MomoSignature] text-4xl">Welcome back</p>
            <p className="mt-1 max-w-xs text-sm text-white/80">
              Pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center px-6 py-10 md:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Moda Pazari
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your details to access your account.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 flex flex-col gap-4"
          >
            <Field label="Email">
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="input"
              />
              {errors.email && <Err>{errors.email.message}</Err>}
            </Field>

            <Field label="Password">
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {errors.password && <Err>{errors.password.message}</Err>}
            </Field>

            <Link
              href="/forgot-password"
              className="-mt-1 self-end text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-accent-solid py-3 font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Sign up
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

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);

const Err = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-red-500">{children}</span>
);
