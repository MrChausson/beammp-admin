import { NextApiRequest, NextApiResponse } from 'next'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'
import path from 'path'

const logger = getLogger('switch-config.ts')

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<String|{error: any}>
) {
    const sshClient = await getSSHClient()

    const { selected, saveCurrent }: { selected: string, saveCurrent: boolean } = req.body

    if (saveCurrent) {
        await sshClient.execCommand(`cp ${beammp_server_dir}/ServerConfig.toml ${beammp_server_dir}/ServerConfigUnsaved.toml`)
    }

    const sanitizedSelected = path.basename(selected);
  
    const response = await sshClient.exec('cp', [`${beammp_server_dir}/${sanitizedSelected}`, `${beammp_server_dir}/ServerConfig.toml`])

    logger.info({selected, response}, 'switch config')
  
    res.status(200).json(response)
}
