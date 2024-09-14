import Image from "next/image";
import Link from "next/link";
import UserAuthForm from "./UserAuthForm";

export const SignUp = () => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Image
          src="/favicon.svg"
          alt="Favicon"
          width="50"
          height="50"
          className="mx-auto h-6 w-6"
        />
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Account
        </h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are agreeing to our User&nbsp;Agreement and
          Privacy&nbsp;Policy
        </p>

        {/* Sign-in form (runs on client) */}
        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          Have an existing account?{" "}
          <Link
            href="/sign-in"
            className="hover-text-zinc-800 text-sm underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
