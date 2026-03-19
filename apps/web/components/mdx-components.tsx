import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { IntroDemo } from "@/components/docs/intro-demo";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { TypeTable } from "fumadocs-ui/components/type-table";
import {
  BasicFormDemo,
  ValidationFormDemo,
  FullFormDemo,
} from "@/components/docs/first-form-demos";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    IntroDemo,
    File,
    Files,
    Folder,
    TypeTable,
    BasicFormDemo,
    ValidationFormDemo,
    FullFormDemo,
    ...components,
  };
}
