import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { buttonVariants } from "./ui/Button";
import IconImage from "./ui/IconImage";

export const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-10 py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        {/* Home */}
        <Link href="/" className="flex gap-2 items-center">
          <span className="h-8 w-8 sm:h-6 sm:w-6">
            <IconImage src="/favicon.svg" alt="favicon" />
            {/* <FavIcon /> */}
          </span>
          {/* Hide below text on smaller devices */}
          <p className="hidden text-zinc-700 text-sm font-medium sm:block">
            Threadit
          </p>
        </Link>

        {/* Search Bar */}

        {/* Sign-in / Sign-up */}

        {session ? (
          <p>Logged-in</p>
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign-in
          </Link>
        )}
      </div>
    </div>
  );
};
