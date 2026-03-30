import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { IntroDemo } from "@/components/docs/intro-demo";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Callout } from "fumadocs-ui/components/callout";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
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
    Card,
    Cards,
    Callout,
    Tab,
    Tabs,
    Steps,
    Step,
    Accordion,
    Accordions,
    BasicFormDemo,
    ValidationFormDemo,
    FullFormDemo,
    ...components,
  };
}
