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
import * as BpmnModeler from "bpmn-js/lib/Modeler";


//TODO: fix the tsc path error
import "../style/index.css";

// cf https://www.iana.org/assignments/media-types/text/vnd.graphviz
const TYPES: {[key: string]: {name: string, extensions: string[]}} = {
  'application/bpmn+xml': {
    name: 'bpmn viewer',
    extensions: ['.bpmn']
  }
};

// Allow some console.log and window kludge
const DEBUG: boolean = true;

// Use the bpmn modeler widget
const USE_MODELER: boolean = false;

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
    this.addClass('jp-bpmn');
    this.div = document.createElement('div');
    this.div.classList.add('jp-bpmn-content');

    if (DEBUG) {
      console.log('jupyterlab_bpmn debug mode is on (build 83)');
      this.div.innerHTML = '<h2>Waiting for bpmn content ...</h2>';
      (<any>window).mydiv = this.div;
    }

    this.node.appendChild(this.div);

  }

  /**
   * Render into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    // Clear previous content
    this.div.innerHTML = "";
    // Instanciate and link to the bpmn-js component
    if (USE_MODELER) {
      this.bpmn = new BpmnModeler();
    } else {
      this.bpmn = new Bpmn();
    }
    this.bpmn.attachTo(this.div);
    let data = model.data[this._mimeType];
    if (DEBUG) {
      (<any>window).Bpmn = this.bpmn;
      console.log(this.bpmn);
      (<any>window).mydata = data;
      //console.log(data);
    }

    // ask bpmn-js to render the XML data
    this.bpmn.importXML(data, function(err: any) {
      if (err) {
        console.log('error rendering', err);
      } else {
        if (DEBUG) {
          console.log('bpmn content rendered');
        }
      }
    });

    return Promise.resolve();
  }

  bpmn: any;
  div: any;
  private _mimeType: string;
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
