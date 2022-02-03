import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.url.substring('/api/v1/cosmos'.length)

  const request = await fetch(`https://cosmoshub-4--lcd--full.datahub.figment.io${path}`, {
    headers: {
      Authorization: process.env.FIGMENT_COSMOS,
    }
  })
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
