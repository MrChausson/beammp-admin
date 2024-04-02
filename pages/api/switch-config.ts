import { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'

const logger = getLogger('switch-config.ts')

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SSHExecCommandResponse|{error: any}>
) {
    const sshClient = await getSSHClient()

    const { selected, saveCurrent }: { selected: string, saveCurrent: boolean } = req.body

    if (saveCurrent) {
        await sshClient.execCommand(`cp ${beammp_server_dir}/ServerConfig.toml ${beammp_server_dir}/ServerConfigUnsaved.toml`)
    }
  
    const response = await sshClient.execCommand(`cp ${beammp_server_dir}/${selected} ${beammp_server_dir}/ServerConfig.toml`)

    logger.info({selected, response}, 'switch config')
  
    res.status(200).json(response)
}
