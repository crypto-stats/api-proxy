import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.BITQUERY_KEY) {
    throw new Error('BITQUERY_KEY not set')
  }

  const request = await fetch('https://graphql.bitquery.io/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.BITQUERY_KEY,
    },
    body: JSON.stringify(req.body),
  })
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler, { allowedMethods: ['POST'] })
