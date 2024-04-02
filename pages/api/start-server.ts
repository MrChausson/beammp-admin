import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('start-server.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse|{error:string}>
) {
  const sshClient = await getSSHClient()

  const response: SSHExecCommandResponse = {
    stdout: 'stdout ignored, see Server.log',
    stderr: 'stderr redirected to logger.error',
    code: 0,
    signal: null
  }

  try {
    sshClient.exec('systemctl',["stop", "beammp"], {
      onStderr(chunk) {
        logger.error('stderrChunk', chunk.toString('utf8'))
      }
    })
    logger.info({response}, 'server started')
  } catch (error) {
    logger.error(error)
  } finally {
  
    res.status(200).json(response)
  }

}
