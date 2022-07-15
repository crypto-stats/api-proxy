import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const dateReversed = (req.query.date as string).split('-').reverse().join('-')
  const apiRequest = await fetch(`https://hyper.solana.fm/v3/tx-fees?date=${dateReversed}`)

  // The endpoint is currently returning an incorrect content-type. Once fixed, this check should be reenabled
  // if (!apiRequest.headers.get('Content-Type').startsWith('application/json')) {
  //   const value = await apiRequest.text()
  //   throw new Error(`Invalid response: ${value}`)
  // }

  const json = await apiRequest.json()

  if (json.total_tx_fees) {
    res.setHeader('Cache-Control', `max-age=${60 * 60}, s-maxage=${24 * 60 * 60}, stale-while-revalidate`);
    res.json({ success: true, value: json.total_tx_fees })
    return
  }
  console.warn(json)

  res.status(404).json({ success: false, error: `Couldn't find data on ${req.query.date}` })
}

export default wrapHandler(handler)
