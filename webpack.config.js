const WorkerPlugin = require("worker-plugin");
const path = require("path");

module.exports = {
  // It's sucks
  // Waiting for webpack5.0 release?
  // experiments: {
  //   topLevelAwait: true,
  // },

  plugins: (original) => {
    original.push(
      new WorkerPlugin({
        plugins: [
          // WorkerPlugin/loader doesn't seem to handle `target=electron-render`
          // new webpack.ExternalsPlugin(`commonjs`, { fs: "fs", path: "path" }),
        ],
        globalObject: "self",
      })
    );

    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/115
    original.find((p) => {
      if (p.constructor.name === "ForkTsCheckerWebpackPlugin") {
        p.reportFiles.push("!**/src/codec/worker/**");
        return true;
      }
    });

    return original;
  },
  module: (original) => {
    //I don't know how to fix this.
    original.rules[1].exclude = path.resolve(process.cwd(), "src/codec/worker");

    let rules = original.rules[2].oneOf.filter((rule) => {
      if (rule.test && rule.test.toString() === "/\\.less$/") {
        return false;
      } else if (rule.test && rule.test.toString() === "/\\.module\\.less$/") {
        rule.test = /\.less$/;
      }
      return true;
    });
    original.rules[2].oneOf = rules;

    return original;
  },
};
