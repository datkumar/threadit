import axios from "axios";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const href = url.searchParams.get("url");

  if (!href) {
    return new Response("Invalid href", { status: 400 });
  }

  const res = await axios.get(href);
  const dataString = res.data as String;

  // Capture contents from the link data via Regex pattern-matching
  // The elements in the capture group (.*?) would be at index 1

  const titleMatch = dataString.match(RegExp("<title>(.*?)</title>"));
  const title = titleMatch ? titleMatch[1] : "";

  const descriptionMatch = dataString.match(
    RegExp(`<meta name="description" content="(.*?)"`)
  );
  const description = descriptionMatch ? descriptionMatch[1] : "";

  const imageMatch = dataString.match(
    RegExp(`<meta property="og:image" content="(.*?)"`)
  );
  const imageUrl = imageMatch ? imageMatch[1] : "";

  // Send data in the format EditorJS expects for LinkTool
  return new Response(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl,
        },
      },
    })
  );
};
