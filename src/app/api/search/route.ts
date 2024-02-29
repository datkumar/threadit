import { db } from "@/lib/db";

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);

    const text = url.searchParams.get("q");
    if (!text) {
      return new Response("Invalid query", { status: 400 });
    }

    const results = await db.community.findMany({
      where: {
        name: {
          startsWith: text,
        },
      },
      include: {
        _count: true,
      },
      take: 5,
    });
    return new Response(JSON.stringify(results), { status: 200 });
  } catch (err) {
    return new Response("Could not search communities", { status: 500 });
  }
};
