import esbuild from "esbuild";
import fs from "fs";
import path from 'path';

const plugins = [
  "src/ColorSameNotes/",
  "src/VoiceRemover/"
]


// Start the build with watch mode
/** @type {esbuild.BuildOptions} */
const options = {
  entryPoints: [
    ...plugins.map(i => i + "main.ts"),
    "src/lib/utils/update.ts"
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

const paths = [...plugins, "src/lib/components/"]
fs.mkdirSync("dist/lib", {recursive: true})

function copyFileToDist(folder, filename) {
  if (!filename.endsWith(".qml") && filename != "manifest.json" && !filename.endsWith(".png")) return

  const src = path.join(folder, filename)
  const dest = src.replace(/^src\//, "dist/")

  fs.mkdirSync(path.dirname(dest), {
    recursive: true
  })
  fs.copyFileSync(src, dest)
}

function copyLibToPluginDist() {
  plugins.map(i => i.replace(/^src\//, "dist/")).forEach(i => {
    fs.cpSync("dist/lib/", path.join(i, "lib"), {recursive: true})
  })
}



const args = process.argv.slice(2)
const watch = args[0] == "watch"
if (watch) {
  let ctx = await esbuild.context(options)

  await ctx.watch()
  console.log("watching")

  // watch src/[plugin] folder and copy qml, png files
  // to the dist folder
  paths.forEach(i => {
    fs.watch(i, {recursive: true}, (event, filename) => {
      copyFileToDist(i, filename)
    })
  })

  // monitor compiled lib folder and copy content
  // to the each dist plugin folder
  fs.watch("dist/lib/", {recursive: true}, (e, filename) => {
    copyLibToPluginDist()
  })

} else {
  await esbuild.build(options)
}


// do the same as the watch operations, but do it once when everything is compiled
paths.forEach(i => {
  walkDirectory(i, (dir, file) => {
    copyFileToDist(dir, file)
  })
})

copyLibToPluginDist()



/**
 * Recursively walks through all files in a folder.
 * @param {string} dir - The directory to start walking.
 * @param {function} callback - A function to call for each file.
 */
function walkDirectory(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // If it's a directory, recurse into it
      walkDirectory(fullPath, callback);
    } else {
      // If it's a file, call the callback
      callback(dir, file);
    }
  });
}

