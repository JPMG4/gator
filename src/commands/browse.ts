import { getPostsForUser } from "../lib/db/queries/posts";
import { User } from "../lib/db/schema";

export async function handlerBrowse(
  _cmdName: string,
  user: User,
  ...args: string[]
) {
  let limit = 2;
  if (args.length > 1) {
    throw new Error("usage: browse [limit]");
  }
  if (args.length === 1) {
    limit = parseInt(args[0], 10);
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("limit must be a positive integer");
    }
  }

  const posts = await getPostsForUser(user.id, limit);
  if (posts.length === 0) {
    console.log("No posts found. Follow some feeds and run agg first.");
    return;
  }
  for (const post of posts) {
    console.log(`${post.title}`);
    console.log(`  ${post.url}`);
    console.log(`  ${post.feedName} - ${post.publishedAt ? post.publishedAt.toISOString() : "unknown date"}`);
  }
}
