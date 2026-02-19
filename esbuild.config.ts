import esbuild from 'esbuild'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { yamlParse } from 'yaml-cfn'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface IAwsResource {
  Type: string
}

interface ILambdaFunction extends IAwsResource {
  Properties: {
    CodeUri: string
  }
}

const lambdasPath = 'src/lambdas'

const { Resources } = yamlParse(
  readFileSync(join(__dirname, 'template.yaml'), 'utf-8')
) as { Resources: Record<string, IAwsResource> }

const awsResources = Object.values(Resources)

const lambdas = awsResources.filter(
  (resource): resource is ILambdaFunction =>
    resource.Type === 'AWS::Serverless::Function'
)

const entries = lambdas.reduce((entryPoints: string[], lambda) => {
  const lambdaName = lambda.Properties.CodeUri.split('/')[1]
  if (!(lambdaName in entryPoints)) {
    entryPoints.push(`./${lambdasPath}/${lambdaName}/handler.ts`)
  }

  return entryPoints
}, [])

esbuild
  .build({
    bundle: true,
    entryPoints: entries,
    logLevel: 'info',
    minify: true,
    platform: 'node',
    format: 'esm',
    outdir: 'dist',
    sourcesContent: false,
    sourcemap: 'inline',
    target: 'es2022',
    banner: {
      js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);import { fileURLToPath } from 'url';import { dirname } from 'path';const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);"
    }
  })
  .catch(() => process.exit(1))
