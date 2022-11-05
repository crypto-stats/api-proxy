import { NextApiRequest, NextApiResponse } from 'next'

const ONE_DAY = 24 * 60 * 60

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if (req.method == 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
      return res.status(200).json({})
    }

    const dateStr = req.query.date as string;
    const date = new Date(dateStr)
    const startTimestamp = date.getTime() / 1000
    const endTimestamp = startTimestamp + ONE_DAY + 1
    const url = `https://api.cosmoscan.net/transactions/fee/agg?by=day&from=${startTimestamp}&to=${endTimestamp}`
    
    const request = await fetch(url)
    const json = await request.json()

    if (json && json.length === 1) {
      res.setHeader('Cache-Control', `max-age=60, s-maxage=${60 * 60}, stale-while-revalidate`);
      res.json({ statusCode: 200, value: json[0].value })
    } else {
      res.status(500).json({ statusCode: 404, message: `Couldn't find ATOM on ${dateStr}` })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
