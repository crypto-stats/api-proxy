import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'
import EventSource from 'eventsource'

const generateUrl = (addresses: string[]) => {
  let url = `https://api.zapper.fi/v2/balances?`;
  addresses.forEach((address, _index) => {
    url += `addresses[]=${address}${
      _index === addresses.length - 1 ? "" : "&"
    }`
  })
  return encodeURI(url)
};

const generateEventSourceDict = (apiKey: string) => {
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "text/event-stream",
      "User-Agent": "Mozilla/5.0",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
  }
}

function getBalances(eventSource: EventSource): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const result: any[] = []

    eventSource.addEventListener("open", () => {
      console.log("Open ...")
    });
    
    eventSource.addEventListener("error", (err) => {
      reject(new Error(err.message))
    });
    
    eventSource.addEventListener("balance", ({ data }) => {
      const parsedData = JSON.parse(data);
      const { appId, app, balance } = parsedData;
      
      if (appId !== "nft") {
        if (appId === "tokens") {
          const { wallet } = balance;
          if (Object.keys(wallet).length > 0) {
            Object.keys(wallet).forEach((value) => {
              result.push(wallet[value])
              const { key, balanceUSD, context, network } = wallet[value]
              const { symbol } = context
              console.log(`${balanceUSD} $ of ${symbol} on ${network} wallet`)
            });
          }
        } else if (app.meta.total > 0) {
          console.log(`${app.meta.total} $ deployed in ${appId}`)
        }
      }
    })
    
    eventSource.addEventListener("end", () => {
      eventSource.close();
      resolve(result)
    })
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const addresses = (req.query.addresses as string).split(',')

  const url = generateUrl(addresses)
  const eventSourceDict = generateEventSourceDict(process.env.ZAPPER_API_KEY)
  const eventSource = new EventSource(url, eventSourceDict)

  const balances = await getBalances(eventSource)

  if (balances) {
    res.setHeader('Cache-Control', `max-age=${12 * 60 * 60}, s-maxage=${5 * 24 * 60 * 60}, stale-while-revalidate`)
    res.json({ success: true, value: balances })
    return
  }
  res.status(404).json({ success: false, error: `Couldn't find data on ${req.query.date}` })
}

export default wrapHandler(handler)
