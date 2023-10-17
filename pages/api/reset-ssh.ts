import type { NextApiRequest, NextApiResponse } from 'next'
import { SSHExecCommandResponse } from 'node-ssh'
import { getSession } from 'next-auth/react'
import { getLogger } from '@utils/loggerUtils'
import { resetSSHClient } from '@utils/sshUtils'

const admins = process.env.ADMIN_EMAILS!.split(',');

const logger = getLogger('reset-ssh.ts')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SSHExecCommandResponse | {error: any}>
) {
  try {
    const session = await getSession({ req })

    if (!session) return res.status(401).json({error: 'Unauthorized'})

    if (!session.user?.email || !admins.includes(session.user?.email)) return res.status(403).json({error: 'Forbidden'})

    const sshClient = await resetSSHClient()
  
    const response = await sshClient.execCommand('echo ok')

    logger.info({response, user: session.user.email}, 'reset ssh connection')
  
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({error})
  }
}
