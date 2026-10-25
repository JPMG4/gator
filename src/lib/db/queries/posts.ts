import { desc, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts } from "../schema";

export type NewPost = typeof posts.$inferInsert;

// Returns the inserted post, or undefined if a post with that URL already exists.
export async function createPost(post: NewPost) {
  const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({ target: posts.url })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit: number) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(feedFollows.feedId, posts.feedId))
    .innerJoin(feeds, eq(feeds.id, posts.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(sql`${posts.publishedAt} DESC NULLS LAST`, desc(posts.createdAt))
    .limit(limit);
}
