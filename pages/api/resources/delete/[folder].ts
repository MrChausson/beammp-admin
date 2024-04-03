import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'
import path from 'path'


const logger = getLogger('delete-resource/[folder].ts')

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<String | {error:any}>
) {
  try {
    const sshClient = await getSSHClient()

    const { folder } = req.query
    const { file } = req.body
    
    if (folder != 'Client' && folder != 'Server') {
        res.status(400).json({error: 'Invalid folder'})
    }

    const sanitizedFolder = path.basename(folder as string);
    const sanitizedFile = path.basename(file);

    const response = await sshClient.exec('rm', [`${beammp_server_dir}/Resources/${sanitizedFolder}/${sanitizedFile}`])

    logger.info({response, folder, file}, 'delete resource')
  
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
