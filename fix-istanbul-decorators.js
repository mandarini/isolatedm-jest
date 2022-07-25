/**
 *
 * The script below builds on/extends code found here:
 *
 * https://github.com/istanbuljs/istanbuljs/issues/70#issuecomment-1116051398
 *
 * https://github.com/istanbuljs/istanbuljs/issues/70#issuecomment-975654329
 *
 * https://github.com/kulshekhar/ts-jest/issues/1166#issuecomment-975650682
 *
 * So thanks to all these people for creating the initial scripts.
 */

const { default: tsJest } = require('jest-preset-angular');
const ts = require('typescript');

module.exports = fixIstanbulDecoratorCoverageTransformer();

function fixIstanbulDecoratorCoverageTransformer() {
  const transformer = tsJest.createTransformer();
  const process = transformer.process.bind(transformer);
  const textToAdd = '/* istanbul ignore next */ ';
  transformer.process = (...args) => {
    // Add /* istanbul ignore next */ before the constructor dynamically
    const fileContent = args?.[0];
    const filePath = args?.[1];
    if (
      typeof fileContent === 'string' &&
      filePath?.endsWith('.component.ts')
    ) {
      const source = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );
      findNodes(source, ts.SyntaxKind.ConstructorKeyword).forEach(
        (node, index) => {
          args[0] = insertChangeToString(fileContent, [
            {
              index: node.getStart() + textToAdd.length * index,
              text: textToAdd,
            },
          ]);
        }
      );
    }
    let result = process(...args);
    if (typeof result === 'string') {
      result = result.replace(/__decorate/g, `${textToAdd}__decorate`);
      result = result.replace(
        /(__metadata\)\("design:paramtypes".*?)(\[typeof \(_\w\s*=)/g,
        `${textToAdd}$1${textToAdd}$2`
      );
      // Add /* istanbul ignore next */ before every constructor parameter
      const source2 = ts.createSourceFile(
        './',
        result,
        ts.ScriptTarget.Latest,
        true
      );
      findNodes(source2, ts.SyntaxKind.ExpressionStatement).forEach(
        (expressionStatement) => {
          // Make sure we only apply changes to constructor
          if (
            expressionStatement.getText().includes('__decorate') &&
            expressionStatement.getText().includes('design:paramtypes')
          ) {
            findNodes(
              expressionStatement,
              ts.SyntaxKind.ConditionalExpression
            ).forEach((condexpr, index) => {
              result = insertChangeToString(result, [
                {
                  index: condexpr.getStart() + textToAdd.length * index,
                  text: textToAdd,
                },
              ]);
            });
          }
        }
      );
    }

    if (result.code) {
      result.code = result.code.replace(
        /__decorate/g,
        `${textToAdd}__decorate`
      );
      result.code = result.code.replace(
        /(__metadata\)\("design:paramtypes".*?)(\[typeof \(_\w\s*=)/g,
        `${textToAdd}$1${textToAdd}$2`
      );

      // Add /* istanbul ignore next */ before every constructor parameter
      const source2 = ts.createSourceFile(
        './',
        result.code,
        ts.ScriptTarget.Latest,
        true
      );
      findNodes(source2, ts.SyntaxKind.ExpressionStatement).forEach(
        (expressionStatement) => {
          // Make sure we only apply changes to constructor
          if (
            expressionStatement.getText().includes('__decorate') &&
            expressionStatement.getText().includes('design:paramtypes')
          ) {
            findNodes(
              expressionStatement,
              ts.SyntaxKind.ConditionalExpression
            ).forEach((condexpr, index) => {
              result.code = insertChangeToString(result.code, [
                {
                  index: condexpr.getStart() + textToAdd.length * index,
                  text: textToAdd,
                },
              ]);
            });
          }
        }
      );
    }

    return result;
  };

  return transformer;
}

/**
 * Code taken from Nx:
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utilities/typescript/find-nodes.ts
 *
 */
function findNodes(node, kind, max = Infinity) {
  if (!node || max == 0) {
    return [];
  }
  const arr = [];
  const hasMatch = Array.isArray(kind)
    ? kind.includes(node.kind)
    : node.kind === kind;
  if (hasMatch) {
    arr.push(node);
    max--;
  }
  if (max > 0) {
    for (const child of node.getChildren()) {
      findNodes(child, kind, max).forEach((node) => {
        if (max > 0) {
          arr.push(node);
        }
        max--;
      });
      if (max <= 0) {
        break;
      }
    }
  }
  return arr;
}


/**
  * Code taken from Nx:
  * https://github.com/nrwl/nx/blob/master/packages/devkit/src/utils/string-change.ts
 */
function insertChangeToString(text, changes) {
  const sortedChanges = changes.sort((a, b) => {
    const diff = a.index - b.index;
    if (diff === 0) {
      return 0;
    }
    return diff;
  });
  let offset = 0;
  for (const change of sortedChanges) {
    const index = change.index + offset;
    text = text.slice(0, index) + change.text + text.slice(index);
    offset += change.text.length;
  }
  return text;
}
