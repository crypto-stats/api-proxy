import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.url.substring('/api/v1/osmosis'.length)

  const request = await fetch(`https://osmosis-1--lcd--full.datahub.figment.io${path}`, {
    headers: {
      Authorization: process.env.FIGMENT_OSMOSIS,
    }
  })
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
