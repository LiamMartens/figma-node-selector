# figma-selector
This library can be used to select Figma nodes in the plugin API using a CSS selector-like syntax.

## Usage
```js
import { select } from 'figma-node-selector';

const results = select('Frame[name="frame-name"]', figma.currentPage);
```

## More examples
```js
// selects the direct children of figma.currentPage, whose type is ELLIPSE and whose name contains "foo"
const results = select('> Ellipse[name*="foo"]', figma.currentPage);

// selects any direct frame, which is in itself a direct child frame of the currentpage whose ID is "100:100"
const results = select('> Frame > Frame[id="100:100"]', figma.currentPage);

// selects all direct children of the currentpage
const results = select('> *', figma.currentPage);

// selects all the nodes (basically findAll)
const results = select('*', figma.currentPage);
```
