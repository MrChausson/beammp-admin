import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('config.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error: any}>
) {
  try {

    const { config }: { config: string } = req.body
    const file = '/home/beam/server/ServerConfig.toml'

    const sshClient = await getSSHClient()
    const response = await sshClient.execCommand(`echo '${config}'> ${file}`)
    logger.info({response}, 'get config')
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
