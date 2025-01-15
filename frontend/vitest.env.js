import { Environment } from "vitest";

export default class JSDOMEnvironment extends Environment {
  constructor(config) {
    super({
      ...config,
      globals: {
        ...config.globals,
        ArrayBuffer,
      },
    });
  }
}
