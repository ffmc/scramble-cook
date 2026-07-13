import { readFileSync, writeFileSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'

const svg = readFileSync('./public/icon.svg', 'utf8')

for (const [size, name] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png']]) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  writeFileSync(`./public/${name}`, resvg.render().asPng())
  console.log(`generated public/${name}`)
}
