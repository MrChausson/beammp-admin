import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('config.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<String | {error: any}>
) {
  try {

    const { config }: { config: string } = req.body
    const file = '/home/beam/server/ServerConfig.toml'

    const sshClient = await getSSHClient()
    // do the command but using args to avoid shell injection
    const response = await sshClient.exec('echo', [config, '>', file])
    logger.info({response}, 'get config')
    res.status(200).json(response);
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
