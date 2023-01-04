import { NextApiRequest, NextApiResponse } from "next";
import { wrapHandler } from "utils/requests";
import EventSource from "eventsource";
import { CryptoStatsSDK, Context } from "@cryptostats/sdk";

const TIMEOUT = 5000;

const generateUrl = (addresses: string[]) => {
  let url = `https://api.zapper.fi/v2/balances?`;
  addresses.forEach((address, _index) => {
    url += `addresses[]=${address}${
      _index === addresses.length - 1 ? "" : "&"
    }`;
  });
  return encodeURI(url);
};

const generateEventSourceDict = (apiKey: string) => {
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "text/event-stream",
      "User-Agent": "Mozilla/5.0",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
  };
};

function getBalances(eventSource: EventSource): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const result: any[] = [];
    let completed = false;

    eventSource.addEventListener("open", () => {
      console.log("Open ...");
    });

    eventSource.addEventListener("error", (err) => {
      console.log(`Error querying: ${err.message}`);
      eventSource.close();
      reject(new Error(err.message));
    });

    eventSource.addEventListener("balance", ({ data }) => {
      const parsedData = JSON.parse(data);
      const { appId, app, balance } = parsedData;

      if (appId !== "nft") {
        if (appId === "tokens") {
          const { wallet } = balance;
          if (Object.keys(wallet).length > 0) {
            Object.keys(wallet).forEach((value) => {
              result.push(wallet[value]);
              const { key, balanceUSD, context, network } = wallet[value];
              const { symbol } = context;
              console.log(`${balanceUSD} $ of ${symbol} on ${network} wallet`);
            });
          }
        } else if (app.meta.total > 0) {
          console.log(`${app.meta.total} $ deployed in ${appId}`);
        }
      }
    });

    eventSource.addEventListener("end", () => {
      completed = true;
      eventSource.close();
      resolve(result);
    });

    setTimeout(() => {
      if (!completed) {
        eventSource.close();
        reject(new Error('Query timed out'));
      }
    }, TIMEOUT);
  });
}

function setupZapper(sdk: Context) {
  async function getPortfolio(addresses: string[]) {
    const url = generateUrl(addresses);
    const eventSourceDict = generateEventSourceDict(process.env.ZAPPER_API_KEY);
    const eventSource = new EventSource(url, eventSourceDict);
    const balances = await getBalances(eventSource);

    return balances;
  }

  sdk.register({
    id: "zapper",
    queries: {
      getPortfolio: getPortfolio,
    },
    metadata: {},
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const addresses = (req.query.addresses as string).split(",");

  const sdk = new CryptoStatsSDK({
    mongoConnectionString: process.env.MONGO_KEY,
  });

  const zapperCollection = sdk.getCollection("zapper-collection");
  zapperCollection.setCacheKeyResolver(
    (id, query,addresses) => addresses + Math.floor(Date.now() / 60 / 60 / 1000)
  );
  zapperCollection.addAdaptersWithSetupFunction(setupZapper);
  const adapter = zapperCollection.getAdapter("zapper");

  const balances = await adapter.query("getPortfolio", addresses);

  if (balances) {
    res.setHeader(
      "Cache-Control",
      `max-age=${12 * 60 * 60}, s-maxage=${
        5 * 24 * 60 * 60
      }, stale-while-revalidate`
    );
    res.json({ success: true, value: balances });
    return;
  }
  res
    .status(404)
    .json({ success: false, error: `Couldn't find data on ${req.query.date}` });

  res.json(balances);
}

export default wrapHandler(handler);
