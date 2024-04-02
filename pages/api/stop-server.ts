import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('stop-server.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error: any}>
) {
  try {
    const sshClient = await getSSHClient()
  
    const response = await sshClient.execCommand('systemctl stop beammp')

    // if it was not successful, tell the user
    if (response.code !== 0) {
      logger.error({response}, 'server stop failed')
      return res.status(500).json(response)
    }
    
    logger.info({response}, 'server stopped')
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
