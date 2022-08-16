import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const request = await fetch('https://polygon.furadao.org/subgraphs/name/quickswap', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Content-type': 'application/json',
    },
  })
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
