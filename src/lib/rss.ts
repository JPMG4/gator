import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
    title: string;
    link: string;
    description?: string;
    pubDate?: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
        "User-Agent": "gator",
        },
    }); 
    
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }
  const xmlData = await response.text();
  const parser = new XMLParser({ processEntities: false });
  const jsonData = parser.parse(xmlData);
  const channel = jsonData.rss.channel;
  if (!channel || !channel.title || !channel.link || !channel.description) {
    throw new Error("Invalid RSS feed: Missing required channel fields");
  }
const rawItems: any[] = Array.isArray(channel.item)
  ? channel.item
  : channel.item
  ? [channel.item]
  : [];
    const items: RSSItem[] = rawItems
    .filter((item: any) => item.title && item.link)
    .map((item: any) => ({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
    }));

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}