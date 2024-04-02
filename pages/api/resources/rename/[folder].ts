import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('rename-resource/[folder].ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error:any}>
) {
  try {
    const sshClient = await getSSHClient()

    const { folder } = req.query
    const { file, newName } = req.body
  
    const response = await sshClient.execCommand(`cd beammp-server/${folder}/Client; mv ${file} ${newName}`)

    logger.info({response, folder, file, newName}, 'rename file')

    if (response.stderr) return res.status(500).json({error: response.stderr}) 
  
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
