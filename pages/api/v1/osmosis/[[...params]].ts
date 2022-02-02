import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const path = req.url.substring('/api/v1/osmosis'.length)
    
    const request = await fetch(`https://osmosis-1--lcd--full.datahub.figment.io${path}`, {
      headers: {
        Authorization: process.env.FIGMENT_OSMOSIS,
      }
    })
    const json = await request.json()

    res.status(request.status).json(json)
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
