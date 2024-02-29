import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export const PATCH = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { username } = UsernameValidator.parse(body);

    const usernameExists = await db.user.findFirst({
      where: {
        username,
      },
    });
    if (usernameExists) {
      return new Response(
        "Username already taken",
        { status: 409 } // Conflict
      );
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username,
      },
    });
    // Successfully updated username
    return new Response(username, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        "Username is not valid",
        { status: 422 } // Unprocessable Content
      );
    }
    return new Response(
      "Could not update username",
      { status: 500 } // Internal Server error
    );
  }
};
