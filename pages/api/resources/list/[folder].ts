import { NextApiRequest, NextApiResponse } from 'next'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'

const logger = getLogger('list-resources/[folder].ts')

export type ResourceItem = {
    file: string
    size: string
}

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResourceItem[]|{error: any}>
) {
    try {
        const { folder } = req.query

        const sshClient = await getSSHClient()
        
        const response = await sshClient.execCommand(`cd ${beammp_server_dir}/${folder}/Client && for FILE in \`ls -d -S *\`; do if [ -r "$FILE" ]; then du -sh $FILE; fi; done`)
        logger.info({response, folder}, 'list resources')
                
        res.status(200).json(response.stdout.split('\n').map(l => l.split('\t')).map(t => ({
            file: t[1],
            size: t[0]
        })))
    } catch (error) {
        logger.error(error)
        res.status(500).json({error})
    }
}
