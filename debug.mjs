import { exec, spawn, spawnSync } from 'child_process';
import { cpSync, existsSync, rmSync } from 'fs';
import { homedir } from 'os';
import path, { basename } from 'path';
import { exit } from 'process';

if (process.platform != "darwin") {
  console.error("This only works on macos")
  exit(1)
}

const plugins = [
  "dist/ColorSameNotes",
  "dist/VoiceRemover"
]


plugins.forEach(i => {
  if (!existsSync(i)) return

  const pluginName = basename(i)
  const pluginFolder = path.resolve(homedir(), "Library/Application Support/MuseScore/MuseScore4/extensions/", pluginName)
  if (existsSync(pluginFolder)) {
    rmSync(pluginFolder, {recursive: true, force: true})
  }

  cpSync(i, pluginFolder, {recursive: true})
    
})


spawn('/Applications/MuseScore 4.app/Contents/MacOS/mscore', ["-d"], {
  stdio: "inherit"
})
