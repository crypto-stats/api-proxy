import { NextApiRequest, NextApiResponse } from 'next'

export function wrapHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  { allowedMethods }: { allowedMethods?: string[] } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
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

      if (allowedMethods && allowedMethods.indexOf(req.method) === -1) {
        return res.status(400).json({ error: `Only ${allowedMethods.join(', ')} methods allowed`})
      }
      
      await handler(req, res)
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message })
    }
  }
}
