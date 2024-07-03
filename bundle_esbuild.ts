import * as esbuild from 'esbuild'

// esbuild でバンドルするファイルのリスト
const files = [
  // main code
  'src/wnako3.mts',
  // mjs
  'src/wnako3webworker.mjs',
  'src/plugin_webworker.mjs',
  'src/plugin_kansuji.mjs',
  'src/plugin_markup.mjs',
  'src/plugin_datetime.mjs',
  'src/plugin_caniuse.mjs',
  // mts
  'src/plugin_three.mts',
  'src/plugin_turtle.mts',
  'src/plugin_weykturtle3d.mts',
  'editor/edit_main.jsx',
  'editor/version_main.jsx'
]

// bundle
for (const file of files) {
  // output filename
  const out = file
    .replace(/\.(mts|mjs|jsx)$/, '.js')
    .replace(/^(src|editor)\//, 'release/')
  console.log('-', out)
  // build
  await esbuild.build({
    entryPoints: [file],
    bundle: true,
    outfile: out,
    minify: true,
    sourcemap: true
  })
}