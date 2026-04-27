import * as fs from 'node:fs'
import * as path from 'node:path'

function findEnvExamples(dir: string): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)

  for (let file of list) {
    file = path.join(dir, file)
    const stat = fs.statSync(file)

    if (stat?.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(findEnvExamples(file))
      }
    } else if (file.endsWith('.env.example')) {
      results.push(file)
    }
  }

  return results
}

const examples = findEnvExamples('.')

for (const example of examples) {
  const envPath = example.replace('.env.example', '.env')
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(example, envPath)
    console.log(`Created ${envPath} from ${example}`)
  }
}
