import esbuild from "esbuild";

// Start the build with watch mode
/** @type {esbuild.BuildOptions} */
const options = {
  entryPoints: [
    'src/ColorSameNotes/main.ts',
    'src/VoiceRemover/main.ts',
    "src/utils/update.ts"
  ],
  bundle: true,
  platform: 'neutral',
  format: 'esm',
  outdir: 'dist',
  banner: {
    js: 'var main;',
  },
  outbase: "src"
}

const args = process.argv.slice(2)
if (args[0] == "watch") {
  let ctx = await esbuild.context(options)

  await ctx.watch()
  console.log("watching")
} else {
  await esbuild.build(options)
}

