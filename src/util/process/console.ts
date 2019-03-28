import * as fs from 'fs';
import {Console} from 'console';

/**
 * Module used to redirect console stdout/stderr streams.
 *
 * Implementation heavilly inspired from nodejs's source code for console.
 * https://github.com/nodejs/node/blob/master/lib/console.js
 *
 * @author: Dragos Sebestin
 */
export function consoleRedirect (logFilePath?: string, errFilePath?: string) {
  let outStream = process.stdout as any as fs.WriteStream;
  let errStream = process.stderr as any as fs.WriteStream;

  // override stdout
  if (logFilePath) {
    outStream = fs.createWriteStream(logFilePath, {flags: 'a+'});
  }

  // override stderr
  if (errFilePath) {
    errStream = fs.createWriteStream(errFilePath, {flags: 'a+'});
  }

  let consoleOverride = new Console(outStream, errStream);

  // replace global console with the override
  Object.defineProperty(global, 'console', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: consoleOverride
  });
}
