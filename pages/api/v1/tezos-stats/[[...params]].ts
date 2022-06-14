import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.url.substring('/api/v1/tezos-stats'.length)

  const request = await fetch(`https://api.tzstats.com${path}`)
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
