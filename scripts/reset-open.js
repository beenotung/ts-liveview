import fs from 'fs'

fs.writeFileSync('.open', new Date().toISOString())
