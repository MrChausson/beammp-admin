import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('download-resource/[folder].ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error:any}>
) {
  try {
    const sshClient = await getSSHClient()

    const { folder } = req.query
    const { url } = req.body
  
    const response = await sshClient.execCommand(`cd beammp-server/${folder}/Client; wget ${url}`)

    logger.info({response, folder}, 'download resource')
  
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
