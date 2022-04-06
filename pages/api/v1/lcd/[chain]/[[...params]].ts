import { NextApiRequest, NextApiResponse } from 'next'
import { wrapHandler } from 'utils/requests'

const endpoints: { [chain: string]: string } = {
  cosmos: 'https://cosmoshub-4--lcd--full.datahub.figment.io',
  gravity: 'https://lcd-gravity-bridge.cosmostation.io',
  juno: 'https://juno-lcd.stakely.io',
  osmosis: 'https://osmosis-1--lcd--full.datahub.figment.io',
  secret: 'https://lcd-secret.keplr.app',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const chain = req.query.chain as string
  const endpoint = endpoints[chain]

  if (!endpoint) {
    throw new Error(`No endpoint for ${chain}`)
  }

  const path = req.url.substring(`/api/v1/lcd/${chain}`.length)

  const options = endpoint.indexOf('figment.io') === -1 ? {} : {
    headers: {
      Authorization: process.env.FIGMENT_OSMOSIS,
    }
  }

  const request = await fetch(`${endpoint}${path}`, options)
  const json = await request.json()

  res.status(request.status).json(json)
}

export default wrapHandler(handler)
