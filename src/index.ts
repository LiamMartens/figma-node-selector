import { tokenize } from '@csstools/tokenizer';

abstract class Selector {
  public params: string[];

  constructor(params: string[]) {
    this.params = params;
  }

  abstract when(node: cleSceneNode): boolean;
}

class AllSelector extends Selector {
  when = () => true;
}

class ByIdSelector extends Selector {
  when = (node: SceneNode): boolean => {
    return node.id === this.params[0];
  };
}

class ByTypeSelector extends Selector {
  when = (node: SceneNode): boolean => {
    return node.type === this.params[0].toUpperCase();
  };
}

class ByAttributeSelector extends Selector {
  public closed: boolean = false;

  when = (node: SceneNode): boolean => {
    return node[this.params[0] as keyof typeof node] === this.params[1];
  };
}

class SelectorGroup {
  public selectors: Selector[] = [];
  public options: {
    directChildrenOnly?: boolean;
  } = {};
}

export function select(selector: string, node: PageNode | SceneNode) {
  const selectorGroups: SelectorGroup[] = [];
  let nextGroup: SelectorGroup = new SelectorGroup();

  const tokens = tokenize(selector);
  for (const token of tokens) {
    if (token.type === 3) {
      // space -> push group
      if (nextGroup.selectors.length) {
        selectorGroups.push(nextGroup);
        nextGroup = new SelectorGroup();
      }
    } else if (token.type === 7) {
      // hash token
      nextGroup.selectors.push(new ByIdSelector([token.data]));
    } else if (token.type === 1) {
      // symbol
      if (token.data === '>') {
        nextGroup.options.directChildrenOnly = true;
      } else if (token.data === '[') {
        nextGroup.selectors.push(new ByAttributeSelector([]));
      } else if (
        token.data === ']' &&
        nextGroup.selectors.length &&
        nextGroup.selectors[nextGroup.selectors.length - 1] instanceof
          ByAttributeSelector
      ) {
        (
          nextGroup.selectors[
            nextGroup.selectors.length - 1
          ] as ByAttributeSelector
        ).closed = true;
      } else if (token.data === '*') {
        nextGroup.selectors.push(new AllSelector([]));
      }
    } else if (token.type === 4) {
      if (
        // word and last selector in group is a non-closed attribute selector
        nextGroup.selectors.length &&
        nextGroup.selectors[nextGroup.selectors.length - 1] instanceof
          ByAttributeSelector &&
        !(
          nextGroup.selectors[
            nextGroup.selectors.length - 1
          ] as ByAttributeSelector
        ).closed
      ) {
        nextGroup.selectors[nextGroup.selectors.length - 1].params.push(
          token.data
        );
      } else {
        nextGroup.selectors.push(new ByTypeSelector([token.data]));
      }
    } else if (token.type === 8) {
      // string
      if (
        nextGroup.selectors.length &&
        nextGroup.selectors[nextGroup.selectors.length - 1] instanceof
          ByAttributeSelector &&
        !(
          nextGroup.selectors[
            nextGroup.selectors.length - 1
          ] as ByAttributeSelector
        ).closed
      ) {
        nextGroup.selectors[nextGroup.selectors.length - 1].params.push(
          token.data.substring(1)
        );
      }
    }
  }

  // push final group if it has selectors
  if (nextGroup.selectors.length) {
    selectorGroups.push(nextGroup);
  }

  let matches: Set<PageNode | SceneNode> = new Set([node]);
  while (selectorGroups.length) {
    const group = selectorGroups.splice(0, 1)[0];
    if (!group.options.directChildrenOnly) {
      const next: Set<PageNode | SceneNode> = new Set();
      matches.forEach((node) => {
        if ('findAll' in node) {
          node
            .findAll((node) => group.selectors.every(({ when }) => when(node)))
            .forEach((n) => next.add(n));
        }
      });
      matches = next;
    } else if (group.options.directChildrenOnly) {
      const next: Set<SceneNode> = new Set();
      matches.forEach((node) => {
        if ('children' in node) {
          node.children
            .filter((node) => group.selectors.every(({ when }) => when(node)))
            .forEach((n) => next.add(n));
        }
      });
      matches = next;
    }
  }

  if (matches) {
    return Array.from(matches.values());
  }

  return [];
}
