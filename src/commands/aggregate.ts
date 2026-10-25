import { fetchFeed } from "../lib/rss";
import { createPost } from "../lib/db/queries/posts";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";

const MIN_INTERVAL_MS = 1000;

export function parseDuration(durationStr: string): number {
  const match = durationStr.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) {
    throw new Error(`Invalid duration "${durationStr}" (use e.g. 500ms, 30s, 1m, 1h)`);
  }
  const units: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000 };
  return parseInt(match[1], 10) * units[match[2]];
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = (ms % 60_000) / 1000;
  return `${h > 0 ? `${h}h` : ""}${h > 0 || m > 0 ? `${m}m` : ""}${s}s`;
}

function handleError(err: unknown) {
  console.error(`Error scraping feeds: ${err instanceof Error ? err.message : err}`);
}

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) {
    console.log("No feeds to fetch.");
    return;
  }
  console.log(`Fetching ${feed.name} (${feed.url})...`);
  // Mark first so a feed that keeps failing still moves to the back of the queue.
  await markFeedFetched(feed.id);
  const data = await fetchFeed(feed.url);
  let saved = 0;
  for (const item of data.channel.item) {
    try {
      const inserted = await createPost({
        title: String(item.title),
        url: String(item.link),
        description: item.description ? String(item.description) : null,
        publishedAt: parsePubDate(item.pubDate),
        feedId: feed.id,
      });
      if (inserted) saved++;
    } catch (err) {
      console.error(`Failed to save post ${item.link}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`Saved ${saved} new posts from ${feed.name} (${data.channel.item.length} in feed)`);
}

function parsePubDate(raw?: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

export async function handlerAgg(_cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error("usage: agg <time_between_reqs> (e.g. 30s, 1m)");
  }
  const timeBetweenRequests = parseDuration(args[0]);
  if (timeBetweenRequests < MIN_INTERVAL_MS) {
    throw new Error("time_between_reqs must be at least 1s");
  }
  console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

  scrapeFeeds().catch(handleError);
  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}
