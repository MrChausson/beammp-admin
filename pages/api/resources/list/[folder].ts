import { NextApiRequest, NextApiResponse } from 'next'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'

const logger = getLogger('list-resources/[folder].ts')

export type ResourceItem = {
    file: string
    size: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResourceItem[]|{error: any}>
) {
    try {
        const { folder } = req.query

        const sshClient = await getSSHClient()
        
        const response = await sshClient.execCommand(`cd beammp-server/${folder}/Client; for FILE in \`ls -S\`; do du -sh $FILE ; done`)

        logger.info({response, folder}, 'list resources')
        
        if (response.stderr) return res.status(500).json({error: response.stderr})
        
        res.status(200).json(response.stdout.split('\n').map(l => l.split('\t')).map(t => ({
            file: t[1],
            size: t[0]
        })))
    } catch (error) {
        logger.error(error)
        res.status(500).json({error})
    }
}
