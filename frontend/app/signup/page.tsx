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
  });

  const onSubmit = async (data: SignupInput) => {
    console.log("Validated data:", data);
    try {
      await authService.signUp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: "buyer",
      });
      toast.success("Account created successfully");
      router.push("/login");
    } catch (e) {
      console.error("Signup error:", e);
    }
  };
  return (
    <div className="bg-linear-to-b from-[#e0ebf5] to-white min-h-screen flex justify-center items-center pt-5 md:pt-10">
      <div
        className="w-[90%] md:w-[80%] bg-white shadow-md h-auto md:h-[100vh] rounded-md p-5 
        flex gap-5 flex-col md:flex-row my-5 md:my-0"
      >
        <div className="bg-[#7A2048] w-full md:w-[40%] h-[260px] md:h-full rounded-md relative overflow-hidden">
          <img
            src={"/images/brush.png"}
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] 
            absolute top-3 md:top-20 rounded-full left-3 md:left-3 
            z-10 animate-bounce [animation-duration:2s]"
          />

          <img
            src={"/images/about1.jpg"}
            className="
    w-[85%] h-[180px]
    md:w-[90%] md:h-[70%]
    absolute 
    top-10 md:top-1/2
    left-1/2 
    -translate-x-1/2 md:-translate-y-1/2  
    rounded-md 
    z-0 
    object-cover
  "
          />

          <img
            src={"/images/accessories.png"}
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]
            absolute bottom-3 md:bottom-15 
            right-3 md:right-3 rounded-full z-10 
            animate-bounce [animation-duration:2s]"
          />
        </div>

        <div className="py-5 px-5 flex-1 md:flex md:flex-col md:justify-center">
          <p className="uppercase bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold mb-10">
            Moda Pazari
          </p>
          <p>Create an Account</p>
          <p className="text-2xl md:text-4xl uppercase font-semibold mt-2">
            Welcome To Moda Pazari
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 md:w-[80%]">
            <label>First Name</label>
            <input
              {...register("firstName")}
              type="text"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
            <label>Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
            {/* <label>Phone Number</label>
            <input
              {...register("phone")}
              type="text"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )} */}
            <label>Email</label>
            <input
              {...register("email")}
              type="email"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
            <label>Password</label>
            <input
              {...register("password")}
              type="password"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
            <button
              disabled={isSubmitting}
              className="bg-[#7A2048] text-white px-5 py-3 rounded-md mt-5 hover:bg-black transition w-full"
              type="submit"
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
            <p className="text-center mt-2">
              Already have an account?{" "}
              <Link href={"/login"} className="text-[#7A2048]">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
