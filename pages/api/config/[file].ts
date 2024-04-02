import type { NextApiRequest, NextApiResponse } from 'next'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'
import ServerConfig, { ServerConfigType } from '@classes/ServerConfig'



const logger = getLogger('config.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServerConfigType | {error: any}>
) {
  try {
    const sshClient = await getSSHClient()

    const { file } = req.query
    const response = await sshClient.execCommand(`cat beammp-server/${file}`)
    logger.info({response}, 'get config')
    const configString = response.stdout
    const config = new ServerConfig(configString)
    res.status(200).json(config.config)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
