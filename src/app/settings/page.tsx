import UsernameForm from "@/components/UsernameForm";
import { authOptions, getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FC } from "react";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings",
};

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages!.signIn!);
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid items-start gap-6">
        <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>

        <div className="grid gap-10">
          <UsernameForm
            user={{
              id: session.user.id,
              username: session.user.username ?? "",
            }}
          ></UsernameForm>
        </div>
      </div>
    </div>
  );
};

export default page;
