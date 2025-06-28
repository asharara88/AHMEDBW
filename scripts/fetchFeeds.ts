import fs from 'fs';

interface FeedSource {
  name: string;
  url: string;
}

const feeds: FeedSource[] = [
  { name: 'hn', url: 'https://hnrss.org/frontpage' }
];

async function fetchFeed(feed: FeedSource) {
  const { name, url } = feed;
  if (!name || !url) {
    console.error(`Invalid feed configuration: ${JSON.stringify(feed)}`);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const text = await response.text();
    fs.writeFileSync(`public/feeds/${name}.xml`, text);
    console.log(`Fetched feed ${name}`);
  } catch (err) {
    console.error(`Error fetching feed ${name}:`, err);
  }
}

async function run() {
  for (const feed of feeds) {
    await fetchFeed(feed);
  }
}

run();
