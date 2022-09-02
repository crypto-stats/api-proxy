import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const request = await fetch('https://api.axelarscan.io/cross-chain/tvl', {
    method: 'POST',
    body: JSON.stringify({
      asset: req.query.asset as string,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  })
  const json = await request.json()

  res.setHeader('Cache-Control', `max-age=${60}, s-maxage=${24 * 60 * 60}, stale-while-revalidate`);
  res.status(request.status).json(json)
}

export default wrapHandler(handler)
