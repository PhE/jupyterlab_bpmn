/*-----------------------------------------------------------------------------
| Copyright (c) Philippe Entzmann
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';

//import * as Viz from "viz.js";
import * as Bpmn from "bpmn-js";

//TODO: fix the tsc path error
//import "../style/index.css";

// cf https://www.iana.org/assignments/media-types/text/vnd.graphviz
const TYPES: {[key: string]: {name: string, extensions: string[], engine: any}} = {
  'application/bpmn+xml': {
    name: 'bpmn',
    extensions: ['.bpmn'],
    engine: 'dot'
  }
};

/**
 * A widget for rendering data, for usage with rendermime.
 */
export
class RenderedData extends Widget implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering Vega/Vega-Lite.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this._engine = TYPES[this._mimeType].engine;
    this.addClass('jp-bpmn');
    this.div = document.createElement('div');

    //this.viz = Viz(`digraph { "loading ..."; }`);
    //this.div.innerHTML = this.viz;
    this.div.innerHTML = '<h2>Waiting for bpmn content ...</h2>';
    //console.log(this.viz);


    this.node.appendChild(this.div);
    (<any>window).mydiv22 = this.div;

    this.bpmn = new Bpmn();
    (<any>window).Bpmn = this.bpmn;
    //this.bpmn.attachTo('.jp-bpmn');
    console.log(this.bpmn);
    console.log('dbg 58');
  }

  /**
   * Render into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let data = model.data[this._mimeType];
    this.div.innerHTML = '<h2>Bpmn content arrived !</h2>';
    console.log(data);
    return Promise.resolve();
  }

  bpmn: any;
  div: any;
  private _mimeType: string;
  private _engine: any;
}

/**
 * A mime renderer factory for data.
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: Object.keys(TYPES),
  createRenderer: options => new RenderedData(options)
};

const extensions = Object.keys(TYPES).map(k => {
  const name = TYPES[k].name;
  return {
    name,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [{
      name,
      extensions: TYPES[k].extensions,
      mimeTypes: [k]
    }],
    documentWidgetFactoryOptions: {
      name,
      primaryFileType: name,
      fileTypes: [name],
      defaultFor: [name],
    }
  } as IRenderMime.IExtension;
});

export default extensions;
