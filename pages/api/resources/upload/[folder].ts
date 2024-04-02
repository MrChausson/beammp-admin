import { NextApiRequest, NextApiResponse } from 'next'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const beammp_server_dir = '/home/beam/server/Resources'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string } | { error: any }>
) {
    const { folder } = req.query
    if (folder != "Client" && folder != "Server") {
        return res.status(400).json({ error: 'Invalid folder' })
    }

    if (!req.headers['file-name']) {
        return res.status(400).json({ error: 'Missing file name in header' })
    }

    const targetPath = path.join(beammp_server_dir, folder, 'Client', req.headers['file-name'] as string)

    const pipelineAsync = promisify(pipeline)

    try {
        await pipelineAsync(req, fs.createWriteStream(targetPath))
        res.status(200).json({ message: 'File uploaded successfully' })
    } catch (err) {
        return res.status(500).json({ error: err })
    }
}