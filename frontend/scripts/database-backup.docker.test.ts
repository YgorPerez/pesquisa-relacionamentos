// Local-only drill: TEST_DATABASE_BACKUP=1 TEST_S3_ENDPOINT=http://127.0.0.1:<moto-port>
// Requires Docker, aws on PATH, and a running moto_server. No cloud credentials.
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vite-plus/test'

it.skipIf(process.env.TEST_DATABASE_BACKUP !== '1')(
  'uploads an encrypted snapshot to local S3 and restores it to a new Docker volume',
  () => {
    const endpoint = process.env.TEST_S3_ENDPOINT ?? ''
    if (new URL(endpoint).hostname !== '127.0.0.1')
      throw new Error('The drill only accepts local S3.')
    const id = randomBytes(8).toString('hex')
    const image = `temestudo-app:sha-${id}`
    const volume = `ticket557-${id}`
    const restored = `${volume}-restore`
    const bucket = `ticket557-${id}`
    const work = mkdtempSync(join(tmpdir(), 's3-restore-'))
    const env = {
      ...process.env,
      AWS_ACCESS_KEY_ID: 'local',
      AWS_SECRET_ACCESS_KEY: 'local',
      AWS_DEFAULT_REGION: 'us-east-1',
      AWS_EC2_METADATA_DISABLED: 'true',
      DATABASE_BACKUP_HOME: work,
    }
    const run = (command: string, args: string[], input?: Buffer) => {
      const result = spawnSync(command, args, {
        env,
        input,
        maxBuffer: 16 * 1024 * 1024,
      })
      if (result.status !== 0)
        throw new Error(`${command} failed: ${result.stderr.toString()}`)
      return result.stdout
    }
    const aws = (...args: string[]) =>
      run('aws', ['--endpoint-url', endpoint, ...args])
    const config = join(work, 'database-backup.env')
    const withVolume = (name: string) => [
      'run',
      '--rm',
      '--env-file',
      config,
      '-v',
      `${name}:/data`,
      image,
      'node',
    ]
    try {
      mkdirSync(join(work, 'server'))
      mkdirSync(join(work, 'public'))
      writeFileSync(join(work, 'server/index.mjs'), '')
      writeFileSync(join(work, 'nitro.json'), '{}')
      copyFileSync(
        join(import.meta.dirname, 'database-maintenance.ts'),
        join(work, 'database-maintenance.ts'),
      )
      copyFileSync(
        join(import.meta.dirname, '../src/platform/database.ts'),
        join(work, 'database.ts'),
      )
      writeFileSync(join(work, 'no-ar'), id)
      writeFileSync(
        config,
        `DATABASE_BACKUP_BUCKET=${bucket}\nDATABASE_BACKUP_ENDPOINT=${endpoint}\nDATABASE_BACKUP_KEY=${'ab'.repeat(32)}\nDATABASE_VOLUME=${volume}\nAWS_ACCESS_KEY_ID=local\nAWS_SECRET_ACCESS_KEY=local\nAWS_DEFAULT_REGION=us-east-1\n`,
        { mode: 0o600 },
      )
      run('docker', [
        'build',
        '-q',
        '-f',
        join(import.meta.dirname, '../Dockerfile'),
        '-t',
        image,
        work,
      ])
      run('docker', [
        ...withVolume(volume),
        'scripts/database-maintenance.ts',
        'init',
        '/data/app.sqlite',
      ])
      run('docker', [
        ...withVolume(volume),
        '--input-type=module',
        '-e',
        `import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('/data/app.sqlite'); db.exec("CREATE TABLE evidence (value TEXT); INSERT INTO evidence VALUES ('S3 restore worked')"); db.close()`,
      ])
      aws('s3', 'mb', `s3://${bucket}`)
      run('bash', [join(import.meta.dirname, 'database-backup.sh')])
      const listing = JSON.parse(
        aws('s3api', 'list-objects-v2', '--bucket', bucket).toString(),
      ) as { Contents: { Key: string }[] }
      expect(listing.Contents).toHaveLength(1)
      const bytes = aws(
        's3',
        'cp',
        `s3://${bucket}/${listing.Contents[0].Key}`,
        '-',
      )
      expect(bytes.includes(Buffer.from('S3 restore worked'))).toBe(false)
      run(
        'docker',
        [
          'run',
          '-i',
          '--rm',
          '--env-file',
          config,
          '-v',
          `${restored}:/data`,
          image,
          'node',
          'scripts/database-maintenance.ts',
          'restore',
          '/data/app.sqlite',
        ],
        bytes,
      )
      const result = run('docker', [
        ...withVolume(restored),
        '--input-type=module',
        '-e',
        `import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('/data/app.sqlite'); console.log(db.prepare('SELECT value FROM evidence').get().value); console.log(db.prepare('PRAGMA integrity_check').get().integrity_check); db.close()`,
      ])
      expect(result.toString()).toBe('S3 restore worked\nok\n')
    } finally {
      spawnSync('docker', ['volume', 'rm', volume, restored])
      spawnSync('docker', ['image', 'rm', image])
      spawnSync(
        'aws',
        ['--endpoint-url', endpoint, 's3', 'rb', `s3://${bucket}`, '--force'],
        { env },
      )
      rmSync(work, { recursive: true, force: true })
    }
  },
  120_000,
)
