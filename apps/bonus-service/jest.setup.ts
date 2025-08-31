// apps/<your-project>/jest.setup.ts
import util from 'node:util';

// Make deep objects print fully in console/reporter output.
util.inspect.defaultOptions.depth = null;
util.inspect.defaultOptions.maxArrayLength = null;
util.inspect.defaultOptions.breakLength = 160;
util.inspect.defaultOptions.colors = true;
