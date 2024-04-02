import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getSedFilterString } from '@utils/configUtils'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'


const beammp_server_dir = process.env.BEAMMP_SERVER_DIR
const logger = getLogger('logs.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error:any}>
) {
  try {
    const sshClient = await getSSHClient()
  
    const response = await sshClient.execCommand(`sed '${getSedFilterString()}' ${beammp_server_dir}/Server.log`)
  
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
