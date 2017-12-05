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

// framework.ts
// Defines the XElement base class for defining custom elements.

import * as lit from 'lit-html';

declare interface Indexable<T> {
  [key: string]: T;
}

declare interface PropertyMetadata {
  name: string;
  value: any;
  attribute: string|null;
  bool: boolean;
  render: boolean;
  notify: boolean;
}

declare interface XElementType extends Function {
  $meta: XElementMetadata;
}

export interface PropertyOptions {
  value?: any;
  attr?: string|boolean;
  notify?: boolean;
  render?: boolean;
}

export function element(tagName: string): any {
  return function(target: XElementType, name: string, descriptor: any) {
    let metadata = target.$meta || (target.$meta = new XElementMetadata());

    metadata.defineElement(tagName, target);
  }
}

export function property(options: PropertyOptions): any {
  return function(target: XElementType, name: string, descriptor: any) {
    let propertyMetadata: PropertyMetadata = {
      name: name,
      value: options.value,
      bool: (options.value === true) || (options.value === false),
      render: options.render || false,
      notify: options.notify || false,
      attribute: options.attr ? (options.attr === true ? name : options.attr) : null
    }

    if (propertyMetadata.attribute && (options.value === null || options.value === undefined)) {
      throw new Error('Properties that are mapped to attributes must have an initial value.');
    }

    let type = <XElementType>target.constructor;
    let metadata = type.$meta || (type.$meta = new XElementMetadata());
    metadata.props[name] = propertyMetadata;
  }
}

class XElementMetadata {

  tag: string;
  props: Indexable<PropertyMetadata>;
  attrs: Indexable<PropertyMetadata>;

  constructor() {
    this.tag = '';
    this.props = {};
    this.attrs = {}
  }

  get observedAttributes() {
    return Object.keys(this.attrs);
  }

  defineElement(tagName: string, type: Function) {
    let prototype = type.prototype;
    let metadata = this;
    for (let propKey in this.props) {
      let prop = this.props[propKey];

      if (prop.attribute) {
        metadata.attrs[prop.attribute] = prop;
      }

      XElementMetadata.defineProperty(prototype, propKey, prop);
    }

    let baseType = Object.getPrototypeOf(type);
    if (baseType !== XElement) {
      let baseMetadata = (<XElementType>baseType).$meta;
      this.props = Object.assign({}, baseMetadata.props, this.props);
      this.attrs = Object.assign({}, baseMetadata.attrs, this.attrs);
    }

    this.tag = tagName;
    customElements.define(tagName, type);
  }

  static defineProperty(prototype: any, name: string, prop: PropertyMetadata) {
    Object.defineProperty(prototype, prop.name, {
      get(): any {
        return (<XElement>this).$$[prop.name];
      },
      set(value: any): void {
        let oldValue: any = (<XElement>this).$$[prop.name];
        if (oldValue === value) {
          return;
        }
        (<XElement>this).$$[prop.name] = value;

        if (prop.notify) {
          (<Indexable<Function>>this)['_' + prop.name + 'Changed'].call(this, oldValue, value);
        }
        if (prop.attribute) {
          if (prop.bool) {
            if (value) {
              (<XElement>this).setAttribute(prop.attribute, '');
            }
          }
          else {
            (<XElement>this).setAttribute(prop.attribute, String(value));
          }
        }
        if (prop.render) {
          (<XElement>this).update();
        }
      }
    });
  }

  initializeElement(instance: XElement): void {
    for (let propKey in this.props) {
      let prop = this.props[propKey];
      let value = prop.value;

      if (prop.attribute && instance.hasAttribute(prop.attribute)) {
        if (prop.bool) {
          value = true;
        }
        else {
          value = prop.value.constructor(instance.getAttribute(prop.attribute));
        }
      }

      if (value !== undefined) {
        instance.$$[propKey] = value;

        if (prop.attribute) {
          if (prop.bool) {
            if (value) {
              instance.setAttribute(prop.attribute, '');
            }
          }
          else {
            instance.setAttribute(prop.attribute, String(value));
          }
        }
      }
    }
  }
}


export type HTMLContentFactory = (strings: TemplateStringsArray, ...values: any[]) => HTMLContent;

export declare class HTMLContent {
  template: any;
  values: any[];
}

export declare interface HTMLContentInstance {
  readonly [id: string]: HTMLElement;
}

export interface XElementState {
  [key: string]: any;
}


export abstract class XElement extends HTMLElement {

  private readonly _root: ShadowRoot;
  private readonly _state: XElementState;

  private _initialized: Boolean;
  private _updateCookie: number;

  constructor() {
    super();

    this._initialized = false;
    this._updateCookie = 0;
    this._state = {};
    this._root = this.attachShadow({ mode: 'open' });
  }

  get $(): HTMLContentInstance {
    let elements = this._root.querySelectorAll('[id]');
    let map: any = {};

    for (let el of elements) {
      map[el.id] = <HTMLElement>el;
    }

    return <HTMLContentInstance>map;
  }

  get $$(): XElementState {
    return this._state;
  }

  static get observedAttributes(): string[] {
    return (<any>this).$meta.observedAttributes;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue == newValue) {
      return;
    }

    let metadata = (<XElementType>this.constructor).$meta;
    let attr = metadata.attrs[name];
    if (!attr) {
      return;
    }

    if (newValue !== undefined) {
      let value = attr.value.constructor(newValue);
      (<Indexable<any>>this)[attr.name] = value;
    }
  }

  connectedCallback(): void {
    this.onAttached();

    if (!this._initialized) {
      (<XElementType>this.constructor).$meta.initializeElement(this);
      this._initialized = true;
    }
    this.update(/* immediate */ true);
  }

  disconnectedCallback(): void {
    this.onDetached();
  }

  abstract createContent(html: HTMLContentFactory): HTMLContent;

  onAttached() {
  }

  onDetached() {
  }

  onUpdated() {
  }

  onUpdating() {
  }

  render(): void {
    let content = this.createContent(lit.html);
    lit.render(content, this._root);
  }

  update(immediate?: boolean) {
    if (!this._initialized) {
      return;
    }

    if (immediate) {
      if (this._updateCookie !== 0) {
        clearTimeout(this._updateCookie);
      }
      this._update();
    }
    else {
      if (this._updateCookie !== 0) {
        return;
      }
      this._updateCookie = setTimeout(() => {
        this._update();
      }, 0);
    }
  }

  _update() {
    this._updateCookie = 0;
    this.onUpdating();
    this.render();
    this.onUpdated();
  }
}
