import { getUserById } from "../lib/db/queries/users";
import { createFeed, getFeeds } from "../lib/db/queries/feeds";
import { Feed, User } from "../lib/db/schema";
import { createFeedFollow } from "../lib/db/queries/feed-follows";

export async function handlerAddFeed(
    _cmdName: string,
    user: User,
    ...args: string[]
) {
    const name = args[0];
    const url = args[1];
    if (!name || !url) {
        throw new Error("usage: addfeed <name> <url>");
    }
    const feed = await createFeed(name, url, user.id);
    printFeed(feed, user);
    const ff = await createFeedFollow(user.id, feed.id);
    console.log(`Feed follow created:`);
    console.log(`* Feed: ${ff.feedName}`);
    console.log(`* User: ${ff.userName}`);
}

function printFeed(feed: Feed, user: User) {
    console.log(`* ID:      ${feed.id}`);
    console.log(`* Name:    ${feed.name}`);
    console.log(`* URL:     ${feed.url}`);
    console.log(`* UserID:  ${feed.userId}`);
    console.log(`* UserName:  ${user.name}`);
}

export async function handlerListFeeds() {
  const feeds = await getFeeds();
  if (feeds.length === 0) {
    console.log("No feeds found.");
    return;
  }
  for (const feed of feeds) {
    const user = await getUserById(feed.userId);
printFeed(feed, user);
  }
}