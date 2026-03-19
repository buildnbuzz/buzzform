// source.config.ts
import {
  remarkAutoTypeTable,
  createGenerator,
  createFileSystemGeneratorCache
} from "fumadocs-typescript";
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs"
});
var generator = createGenerator({
  cache: createFileSystemGeneratorCache(".next/fumadocs-typescript")
});
var source_config_default = defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]],
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      }
    }
  }
});
export {
  source_config_default as default,
  docs
};
