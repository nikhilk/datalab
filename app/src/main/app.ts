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

// app.ts
// Electron application implementation.

import * as electron from 'electron';
import * as path from 'path';

export class Application {

  private static _instance: Application;

  private readonly _config: Configuration;
  private readonly _app: electron.App;
  private _window: electron.BrowserWindow|null;

  private constructor(config: Configuration, app: electron.App) {
    this._config = config;
    this._app = app;
    this._window = null;

    this._app.on('ready', this._onReady.bind(this));
    this._app.on('window-all-closed', this._onClosed.bind(this));

    console.log(this._config.version);
  }

  static get instance(): Application {
    return Application._instance;
  }

  private _onClosed() {
    this._app.quit();
  }

  private _onReady() {
    let rootPath = path.join(__dirname, 'pages', 'start.html');
    let url = `file://${rootPath}`

    let windowOptions = {
      show: false
    };

    this._window = new electron.BrowserWindow(windowOptions);
    this._window.on('closed', this._onWindowClosed.bind(this));
    this._window.on('ready-to-show', this._onWindowReady.bind(this));
    this._window.loadURL(url);
  }

  private _onWindowClosed() {
    this._window = null;
  }

  private _onWindowReady() {
    if (this._window) {
      this._window.webContents.toggleDevTools();
      this._window.show();
    }
  }

  public static run(config: Configuration): void {
    Application._instance = new Application(config, electron.app);
  }
}
