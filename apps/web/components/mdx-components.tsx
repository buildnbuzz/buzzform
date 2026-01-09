import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { IntroDemo } from "@/components/docs/intro-demo";
import { File, Files, Folder } from "fumadocs-ui/components/files";
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
    BasicFormDemo,
    ValidationFormDemo,
    FullFormDemo,
    ...components,
  };
}
