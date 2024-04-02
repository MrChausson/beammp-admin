import { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'

const logger = getLogger('switch-config.ts')

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SSHExecCommandResponse|{error: any}>
) {
    const sshClient = await getSSHClient()

    const { selected, saveCurrent }: { selected: string, saveCurrent: boolean } = req.body

    if (saveCurrent) {
        await sshClient.execCommand('cp beammp-server/ServerConfig.toml beammp-server/ServerConfigUnsaved.toml')
    }
  
    const response = await sshClient.execCommand(`cp beammp-server/${selected} beammp-server/ServerConfig.toml`)

    logger.info({selected, response}, 'switch config')
  
    res.status(200).json(response)
}
