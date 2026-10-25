import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { getFeedByURL } from "./feeds";

export async function createFeedFollow(userId: string, feedId: string) {
  // 1. Insert and get the row back
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  // 2. Select with joins to pull in the names
  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await getFeedByURL(feedUrl);
  if (!feed) {
    throw new Error(`Feed with URL ${feedUrl} not found`);
  }

  const deleted = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
    .returning();

  if (deleted.length === 0) {
    throw new Error(`You are not following ${feedUrl}`);
  }
  return deleted[0];
}
