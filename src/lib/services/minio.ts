import * as Minio from 'minio'

const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'play.min.io',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
})

export default minio;