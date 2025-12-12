import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-linear-to-b from-[#e0ebf5] to-white min-h-screen flex justify-center items-center pt-5 md:pt-10">
      <div
        className="w-[90%] md:w-[80%] bg-white shadow-md h-auto md:h-[70vh] rounded-md p-5 
        flex gap-5 flex-col md:flex-row my-5 md:my-0"
      >
        {/* LEFT SIDE */}
        <div className="bg-[#7A2048] w-full md:w-[40%] h-[260px] md:h-full rounded-md relative overflow-hidden">
          {/* brush icon */}
          <img
            src={"/images/brush.png"}
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] 
            absolute top-3 md:top-10 rounded-full left-3 md:left-[5%] 
            z-10 animate-bounce [animation-duration:2s]"
          />

          {/* MAIN IMAGE – responsive on mobile */}
          <img
            src={"/images/about1.jpg"}
            className="w-[85%] md:max-w-[350px] h-[180px] md:h-[350px]
            absolute top-10 md:top-15 rounded-md left-[7%] md:left-[10%] 
            z-0 object-cover"
          />

          {/* bottom icon – corrected positioning */}
          <img
            src={"/images/accessories.png"}
            className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]
            absolute bottom-3 md:bottom-10 
            right-3 md:right-[10%] rounded-full z-10 
            animate-bounce [animation-duration:2s]"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="py-5 px-5 flex-1 md:flex md:flex-col md:justify-center">
          <p className="uppercase bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold mb-5">
            Moda Pazari
          </p>
          {/* <p>Create an Account</p> */}
          <p className="text-2xl md:text-4xl uppercase font-semibold mt-2">
            Welcome Back
          </p>

          <form action="" className="mt-10 md:w-[80%]">
            <label>Email</label>
            <input
              type="email"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="email"
            />
            <label>Password</label>
            <input
              type="password"
              className="border border-[#ccc] w-full rounded-md h-10 my-3 px-3 placeholder:text-[#D7D7D7] focus:ring-2 focus:ring-[#7A2048] outline-none text-sm"
              placeholder="password"
            />
          </form>

          <button
            className="bg-[#7A2048] text-white px-5 py-3 rounded-md mt-5 hover:bg-black transition w-full md:w-[80%]"
            type="submit"
          >
            Login
          </button>
          <p className="text-center mt-2">
            Do not have an account?{" "}
            <Link href={"/signup"} className="text-[#7A2048]">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
