import CustomFeed from "@/components/CustomFeed";
import GeneralFeed from "@/components/GeneralFeed";
import { Button } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <main>
      <h1 className="font-bold text-3xl md:text-4xl">Your Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-6 py-6">
        {/* Feed of posts based on guest OR logged-in user */}
        {session ? <CustomFeed /> : <GeneralFeed />}

        {/* Community Info */}
        <div className="overflow-hidden h-fit rounded-lg shadow border-1  order-first md:order-last">
          <div className="bg-red-100 px-6 py-4 ">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="w-4 h-4 " />
              Home
            </p>
          </div>

          <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Threaddit homepage. Come here to check in with
                your favourite communities
              </p>
            </div>
            <Link href="/c/create">
              <Button className="w-full mt-4 mb-6">Create Community</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
