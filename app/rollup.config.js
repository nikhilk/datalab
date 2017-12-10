// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// rollup.config.js
// Configuration for doing rollup to produce bundled scripts.

import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import * as fs from 'fs';
import * as plugins from 'rollup-pluginutils';

// NOTE: This is hopefully temporary, and we can switch to using rollup-plugin-json.
//       The plugin doesn't allow loading of specific manifest fields, and generates
//       several top-level fields.
//       See https://github.com/rollup/rollup-plugin-json/issues/37
function manifest() {
  const filter = plugins.createFilter(['./package.json']);

  return {
    name: 'manifest',
    load: function(id) {
      if (!filter(id)) {
        return null;
      }

      let manifestData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return `export default {
        name: '${manifestData.name}',
        fullName: '${manifestData.fullName}',
        description: '${manifestData.description}',
        version: '${manifestData.version}',
        homepage: '${manifestData.homepage}'
      }`;
    }
  }
}

// Script for electron main process.
const mainBundle = {
  context: 'global',
  input: 'build/main/main.js',
  output: {
    file: '../dist/main.js',
    format: 'cjs'
  },
  external: [
    'electron'
  ],
  plugins: [
    builtins(),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/electron/index.js': [ 'app', 'BrowserWindow', 'Menu' ]
      },
      sourceMap: false
    }),
    manifest()
  ]
};

// Scripts for electron renderer process (one per page).
// NOTE: When electron supports ES2015, we can switch format from iife to es.
const startPageBundle = {
  name: 'datalabWindow',
  context: 'window',
  input: 'build/pages/start.js',
  output: {
    file: '../dist/pages/start.js',
    format: 'iife'
  },
  plugins: [
    builtins(),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/electron/index.js': [ 'remote' ]
      },
      sourceMap: false
    })
  ]
}

export default [
  mainBundle,
  startPageBundle
];
