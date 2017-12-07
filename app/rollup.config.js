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
import json from 'rollup-plugin-json';

const mainBundle = {
  input: 'build/main/main.js',
  output: {
    file: '../dist/main.js',
    format: 'cjs'
  },
  external: [
    'electron'
  ],
  plugins: [
    json(),
    builtins(),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/electron/index.js': [ 'app', 'BrowserWindow' ]
      },
      sourceMap: false
    })
  ]
};

// NOTE: When electron supports ES2015, we can switch format from iife to es.

const windowBundle = {
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
        'node_modules/electron/index.js': [ 'app', 'BrowserWindow' ]
      },
      sourceMap: false
    })
  ]
}

export default [
  mainBundle,
  windowBundle
];
