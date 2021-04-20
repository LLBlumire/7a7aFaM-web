import styles from "rollup-plugin-styles";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import path from "path";
import fs from "fs";

const copyFile = (copyPath, targetDir) => {
  const resolvedCopyPath = path.resolve(copyPath);
  const resolvedCopyFile = path.basename(resolvedCopyPath);
  const resolvedTargetDir = path.resolve(targetDir);
  const resolvedTargetPath = path.join(resolvedTargetDir, resolvedCopyFile);
  return {
    name: "copy-index",
    load() {
      this.addWatchFile(resolvedCopyPath);
    },
    generateBundle() {
      fs.mkdirSync(resolvedTargetDir, { recursive: true });
      fs.copyFileSync(resolvedCopyPath, resolvedTargetPath);
    },
  };
};

export default {
  input: "src/script.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript(),
    styles(),
    copyFile("src/index.html", "dist"),
    copyFile("src/favicon.ico", "dist"),
    serve({
      contentBase: "dist",
      historyApiFallback: true,
    }),
    livereload("dist"),
  ],
};
