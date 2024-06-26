import type { NextApiRequest, NextApiResponse } from 'next'
import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'



const logger = getLogger('resources-folders.ts')

const server_dir_folder = process.env.SERVER_DIR_FOLDER;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | {error:any}>
) {
  try {
    const sshClient = await getSSHClient()
  
    const response = await sshClient.execCommand(`ls -d ${server_dir_folder}/Resources | cut -f1 -d'/' | grep Resources`)

    logger.info({response}, 'list resources folders')
  
    res.status(200).json(response.stdout.split('\n'))
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
