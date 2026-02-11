"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Router } from "next/router";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schema/loginSchema";
import { authService } from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

// 1️⃣ Define your validation schema with Zod

// 2️⃣ Infer TypeScript type from schema
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

  useEffect(() => {
    if (user) {
      router.replace("/shop"); // redirect to shop if already logged in
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormInputs) => {
    console.log("Login data:", data);
    try {
      const res = await authService.sigIn({
        email: data.email,
        password: data.password,
      });
      setUser({ token: res.data.token, firstName: res.data.email });
      toast.success("Logged in successfully");
      router.push("/shop");
    } catch (e) {
      console.error("Login error:", e);
    }
  };

  return (
    <div className="bg-linear-to-b from-[#e0ebf5] to-white min-h-screen flex justify-center items-center pt-5 md:pt-10">
      <div className="w-[90%] md:w-[80%] bg-white shadow-md h-auto md:h-[70vh] rounded-md p-5 flex gap-5 flex-col md:flex-row my-5 md:my-0">
        {/* LEFT SIDE */}
        <div className="bg-[#7A2048] w-full md:w-[40%] h-[260px] md:h-full rounded-md relative overflow-hidden">
          <img
            src="/images/brush.png"
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] absolute top-3 md:top-10 rounded-full left-3 md:left-[5%] z-10 animate-bounce [animation-duration:2s]"
          />
          <img
            src="/images/about1.jpg"
            className="w-[85%] md:max-w-[350px] h-[180px] md:h-[350px] absolute top-10 md:top-15 rounded-md left-[7%] md:left-[10%] z-0 object-cover"
          />
          <img
            src="/images/accessories.png"
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] absolute bottom-3 md:bottom-10 right-3 md:right-[10%] rounded-full z-10 animate-bounce [animation-duration:2s]"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="py-5 px-5 flex-1 md:flex md:flex-col md:justify-center">
          <p className="uppercase bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold mb-5">
            Moda Pazari
          </p>
          <p className="text-2xl md:text-4xl uppercase font-semibold mt-2">
            Welcome Back
          </p>

          {/* 3️⃣ React Hook Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 md:w-[80%] flex flex-col gap-3"
          >
            <label>Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="email"
              className="border border-[#ccc] w-full rounded-md h-10 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}

            <label>Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="password"
              className="border border-[#ccc] w-full rounded-md h-10 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7A2048] text-white px-5 py-3 rounded-md mt-5 hover:bg-black transition w-full "
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <p className="text-center mt-2">
              Do not have an account?{" "}
              <Link href={"/signup"} className="text-[#7A2048]">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
