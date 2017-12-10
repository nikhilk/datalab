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

// commands.ts
// Command handling implementation.

import * as electron from 'electron';

export class CommandSet {

  private readonly _config: Configuration;

  constructor(config: Configuration) {
    this._config = config;
  }

  private _onHelpAbout(command: electron.MenuItem) {
    let messageText = `${this._config.name}\n${this._config.description}\n\nVersion: ${this._config.version}`;
    let messageOptions = {
      type: 'info',
      buttons: ['Product Information ...', 'OK'],
      defaultId: 1,
      cancelId: 1,
      noLink: true,
      title: `About ${this._config.name}`,
      message: messageText
    };
    let action =
      electron.dialog.showMessageBox(electron.BrowserWindow.getFocusedWindow(), messageOptions);

    if (action === 0) {
      electron.shell.openExternal(this._config.productUrl);
    }
  }

  updateCommands(): void {
    let menuTemplate = [
      {
        role: 'help',
        id: 'help',
        submenu: [
          { label: `About ${this._config.name} ...`, click: this._onHelpAbout.bind(this) }
        ]
      },
      {
        label: 'Develop',
        id: 'develop',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' }
        ]
      }
    ];

    let menu = electron.Menu.buildFromTemplate(menuTemplate);
    electron.Menu.setApplicationMenu(menu);
  }
}
