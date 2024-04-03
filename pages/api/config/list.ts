import { NextApiRequest, NextApiResponse } from 'next'
import ServerConfig from '@classes/ServerConfig'

import { getLogger } from '@utils/loggerUtils'
import { getSSHClient } from '@utils/sshUtils'

const logger = getLogger('config/list.ts')

export type ConfigList = {
    files: string[]
    current: string | null
}

const beammp_server_dir = process.env.BEAMMP_SERVER_DIR

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ConfigList|{error: any}>
) {
    try {
        const sshClient = await getSSHClient();
        const files = [`${beammp_server_dir}/ServerConfig.toml`];
        const { stdout: mainConfStr } = await sshClient.execCommand('cat ' + files[0]);
        const mainConfig = new ServerConfig(mainConfStr);
        let current = null;

        for (const configFile of files) {
            const { stdout: configString } = await sshClient.execCommand('cat ' + configFile);
            const config = new ServerConfig(configString);
            if (config.equals(mainConfig)) {
                current = configFile;
                break;
            }
        }

        res.status(200).json({
            files,
            current
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({error});
    }
}
