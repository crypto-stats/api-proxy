import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.LOOPRING_KEY) {
    throw new Error('Loopring key not set')
  }

  const [accountId, accountKey] = process.env.LOOPRING_KEY.split(':')
  
  const url = `https://api3.loopring.io/api/v3/user/offchainFee?accountId=${accountId}&requestType=3&tokenSymbol=ETH&amount=10000000000`;
  const apiRequest = await fetch(url, {
    headers: {
      'X-API-KEY': accountKey,
    },
  });

  if (!apiRequest.headers.get('Content-Type').startsWith('application/json')) {
    const value = await apiRequest.text()
    throw new Error(`Invalid response: ${value}`)
  }

  const json = await apiRequest.json()
  res.json(json)
}

export default wrapHandler(handler)
