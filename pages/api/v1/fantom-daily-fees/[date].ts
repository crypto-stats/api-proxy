import { NextApiRequest, NextApiResponse } from 'next'

async function getFeeDataFromFTMscan(): Promise<any[]> {
  const response = await fetch('https://ftmscan.com/chart/transactionfee?output=csv');
  const csv = await response.text();

  const parsed = csv
    .trim()
    .split('\n')
    .map((row: string) =>
      row
        .trim()
        .split(',')
        .map((cell: string) => JSON.parse(cell))
    );

  return parsed;
}

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

    const feeData = await getFeeDataFromFTMscan();

    const date = req.query.date as string;
    const [year, month, day] = date.split('-');
    const dateInCSVFormat = `${parseInt(month)}/${parseInt(day)}/${year}`;

    // Yay binary search!
    let ftmFees = 0;
    let low = 0;
    let high = feeData.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (dateInCSVFormat == feeData[mid][0]) {
        ftmFees = feeData[mid][2] / 1e18;
        break;
      } else if (new Date(date) < new Date(feeData[mid][0])) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    if (low > high) {
      res.status(500).json({ statusCode: 404, message: `Couldn't find FTM on ${req.query.date}` })
    } else {
      res.setHeader('Cache-Control', 'max-age=60, s-maxage=${60 * 60}, stale-while-revalidate');
      res.json({ statusCode: 200, value: ftmFees })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
