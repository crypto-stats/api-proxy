import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.url.substring('/api/v1/secret'.length)

  const request = await fetch(`https://lcd-secret.keplr.app${path}`)
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
