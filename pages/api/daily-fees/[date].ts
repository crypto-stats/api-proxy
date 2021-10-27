import { NextApiRequest, NextApiResponse } from 'next'

const ONE_DAY = 24 * 60 * 60 * 1000

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const startDate = new Date(req.query.date as string)
    const endDate = new Date(startDate.getTime() + ONE_DAY)

    const apiRequest = await fetch("https://solana.fm/graphql", {
      headers: {
        "authorization": `Bearer ${process.env.SOLANA_FM_BEARER}`,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        query: `{
          solana {
            totalFees(date: {from: "${startDate.toISOString()}", to: "${endDate.toISOString()}"})
          }
        }`
      }),
    })
    const json = await apiRequest.json()

    if (json?.data?.solana?.totalFees) {
      res.json({ statusCode: 200, value: json?.data?.solana?.totalFees })
      return
    }

    res.status(500).json({ statusCode: 404, message: `Couldn't find data on ${req.query.date}` })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
