# figma-selector
This library can be used to select Figma nodes in the plugin API using a CSS selector-like syntax.

## Usage
```js
import { select } from 'figma-node-selector';

const results = select('Frame[name="frame-name"]', figma.currentPage);
```

## More examples

