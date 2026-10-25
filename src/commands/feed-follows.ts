import { getFeedByURL } from "src/lib/db/queries/feeds";
import { createFeedFollow, deleteFeedFollow } from "../lib/db/queries/feed-follows";
import { feedFollows, feeds, User } from "src/lib/db/schema";
import { db } from "src/lib/db";
import { eq } from "drizzle-orm";

export async function handlerFollow(
  _cmdName: string,
  user: User,
  ...args: string[]
) {
  // 1. Validate: exactly one arg (the feed URL)
  if (args.length !== 1) {
    throw new Error(`usage: follow <feed_url>`);;
  }

  // 3. Look up the feed by URL
  const feedURL = args[0];
  const feed = await getFeedByURL(feedURL);
  if (!feed) {
    throw new Error(`Feed not found: ${feedURL}`);
  }

  // 4. Create the follow record
  const ffRow = await createFeedFollow(user.id, feed.id);

  // 5. Print the feed name and current user
  console.log(`Feed follow created:`);
  console.log(`* Feed: ${ffRow.feedName}`);
  console.log(`* User: ${ffRow.userName}`);
}

export async function getFeedFollowsForUser(userId: string) {
  const result = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));

  return result;
}

export async function handlerListFeedFollows(
  _cmdName: string,
  user: User,
  ..._args: string[]
) {
  const follows = await getFeedFollowsForUser(user.id);
  if (follows.length === 0) {
    console.log("You are not following any feeds.");
    return;
  }
  for (const ff of follows) {
    console.log(`* ${ff.feedName}`);
  }
}

export async function handlerUnfollow(
  _cmdName: string,
  user: User,
  ...args: string[]
) {
  // 1. Validate: exactly one arg (the feed URL)
  if (args.length !== 1) {
    throw new Error(`usage: unfollow <feed_url>`);
  }

  // 2. Get the feed URL from args
  const feedURL = args[0];

  // 3. Call deleteFeedFollow with user.id and feedURL
  await deleteFeedFollow(user.id, feedURL);

  // 4. Print a confirmation message
  console.log(`You have unfollowed the feed with URL: ${feedURL}`);
}
