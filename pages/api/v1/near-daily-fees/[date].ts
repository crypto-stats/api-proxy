import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'
import { wrapHandler } from 'utils/requests'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const date = new Date(req.query.date as string)

  const pool = new Pool({
    connectionString: 'postgres://public_readonly:nearprotocol@34.78.19.198/indexer_analytics_mainnet',
  })

  const queryString = 'SELECT * FROM daily_tokens_spent_on_fees where collected_for_day = $1::date;'
  const response = await pool.query(queryString, [req.query.date])

  if (response.rowCount == 1) {
    res.setHeader('Cache-Control', 'max-age=60, s-maxage=${60 * 60}, stale-while-revalidate');
    res.json({ statusCode: 200, value: response.rows[0].tokens_spent_on_fees })
    return
  }

  res.status(500).json({ statusCode: 404, message: `Couldn't find data on ${req.query.date}`, error: 'No data' })
}

export default wrapHandler(handler)
