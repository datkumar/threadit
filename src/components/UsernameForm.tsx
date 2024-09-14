"use client";

import { errorToast, successToast } from "@/hooks/use-custom-toast";
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

interface UsernameFormProps {
  user: Pick<User, "id" | "username">;
}

const UsernameForm: FC<UsernameFormProps> = ({ user }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      username: user.username ?? "",
    },
  });

  const oldUsername = user.username ?? "";
  const currentUsername = watch("username");

  const { mutate: changeUsername, isPending } = useMutation({
    mutationKey: ["new-username"],
    mutationFn: async ({ username }: UsernameRequest) => {
      const payload: UsernameRequest = { username };
      const { data } = await axios.patch("/api/username", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        return errorToast("Username taken", "Please choose another username");
      }
      return errorToast("An error occured", "Could not change your username");
    },
    onSuccess: () => {
      successToast("Success", "Your username has been updated");
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((val) => changeUsername(val))}>
      <Card>
        <CardHeader>
          <CardTitle>Change your Username</CardTitle>
          <CardDescription>
            Usernames can be 3-32 characters long comprising alphabets, numbers,
            underscores(_) and hyphens(-)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Label htmlFor="username">Enter new username</Label>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm  text-zinc-400">u/</span>
            </div>
            <Input
              id="username"
              className="w-[400px] h-10 pl-6 "
              size={32}
              {...register("username")}
            />
            {errors.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={currentUsername === oldUsername}
            isLoading={isPending}
          >
            Update
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UsernameForm;
