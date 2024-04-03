import type { NextApiRequest, NextApiResponse } from 'next'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'
import ServerConfig, { ServerConfigType } from '@classes/ServerConfig'
import path from 'path'



const logger = getLogger('config.ts')

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServerConfigType | {error: any}>
) {
  try {
    const sshClient = await getSSHClient()

    const { file } = req.query as { file: string };
    const sanitizedFile = path.basename(file);
    const response = await sshClient.exec('cat', [`${beammp_server_dir}/${sanitizedFile}`])
    logger.info({response}, 'get config')
    const configString = response;
    const config = new ServerConfig(configString)
    res.status(200).json(config.config)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
