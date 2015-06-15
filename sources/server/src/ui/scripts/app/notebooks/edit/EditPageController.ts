/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */


/**
 * Top-level page controller for the notebook edit page.
 */
/// <reference path="../../../../../../../../externs/ts/angularjs/angular.d.ts" />
/// <amd-dependency path="app/components/clientapi/ClientApi" />
/// <amd-dependency path="app/components/notebooktitle/NotebookTitleDirective" />
/// <amd-dependency path="app/components/notebooktoolbar/NotebookToolbarDirective" />
/// <amd-dependency path="app/components/sessions/ClientNotebook" />
/// <amd-dependency path="app/components/sessions/SessionEventDispatcher" />
/// <amd-dependency path="app/components/worksheeteditor/WorksheetEditorDirective" />
import actions = require('app/shared/actions');
import constants = require('app/common/Constants');
import logging = require('app/common/Logging');
import _app = require('app/App');


var log = logging.getLogger(constants.scopes.notebooks.edit.page);

export class EditPageController {

  notebook: app.IClientNotebook;
  tab: string; // Name of the currently active tab (e.g., 'deploy').

  _clientApi: app.IClientApi;
  _rootScope: ng.IRootScopeService;
  _sessionEventDispatcher: app.ISessionEventDispatcher;

  static $inject: string[] = [
      '$rootScope',
      constants.clientApi.name,
      constants.clientNotebook.name,
      constants.sessionEventDispatcher.name];

  /**
   * Constructor.
   *
   * @param rootScope The root scope for the page.
   * @param clientApi Client-side API object.
   * @param clientNotebook Client's notebook session.
   * @param sessionEventDispatcher The session event dispatcher.
   */
  constructor (
      rootScope: ng.IRootScopeService,
      clientApi: app.IClientApi,
      clientNotebook: app.IClientNotebook,
      sessionEventDispatcher: app.ISessionEventDispatcher) {

    this._clientApi = clientApi;
    this._rootScope = rootScope;
    this._sessionEventDispatcher = sessionEventDispatcher;

    this.notebook = clientNotebook;
    this.tab = 'outline'; // Default tab selection.
  }
}

_app.registrar.controller(constants.notebooks.edit.pageControllerName, EditPageController);
log.debug('Registered ', constants.notebooks.edit.pageControllerName);
