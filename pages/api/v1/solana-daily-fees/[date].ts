import { NextApiRequest, NextApiResponse } from 'next'

const ONE_DAY = 24 * 60 * 60 * 1000

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const startDate = new Date(req.query.date as string)
    const endDate = new Date(startDate.getTime() + ONE_DAY - 1)

    const apiRequest = await fetch('https://api.solana.fm/', {
      headers: {
        apikey: process.env.SOLANAFM_KEY,
        'Content-Type': "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        query: `{
          solana {
            totalFeesInTimeRange(time: { 
              from: "${startDate.toISOString()}", 
              to: "${endDate.toISOString()}", 
              resolution: ONE_DAY}) {
              time,
              value
            }
          }
        }`
      }),
    })
    const json = await apiRequest.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if (req.method == 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
      return res.status(200).json({})
    }

    if ((json?.data?.solana?.totalFeesInTimeRange || []).length > 0) {
      res.setHeader('Cache-Control', 'max-age=60, s-maxage=${60 * 60}, stale-while-revalidate');
      res.json({ statusCode: 200, value: json?.data?.solana?.totalFeesInTimeRange[0].value })
      return
    }

    res.status(500).json({ statusCode: 404, message: `Couldn't find data on ${req.query.date}`, error: json.errors })
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
