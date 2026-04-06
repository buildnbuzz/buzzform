"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Schema with array field for managing team members
const teamSchema = defineSchema({
  fields: [
    {
      type: "text",
      name: "projectName",
      label: "Project Name",
      placeholder: "My Awesome Project",
      required: true,
    },
    {
      type: "textarea",
      name: "projectDescription",
      label: "Project Description",
      placeholder: "Describe your project...",
      ui: { rows: 3 },
    },
    {
      type: "array",
      name: "teamMembers",
      label: "Team Members",
      description: "Add team members who will work on this project",
      minItems: 1,
      maxItems: 10,
      ui: {
        isSortable: true,
        addLabel: "Add Team Member",
      },
      fields: [
        {
          type: "row",
          ui: { gap: 16, responsive: true },
          fields: [
            {
              type: "text",
              name: "name",
              label: "Name",
              placeholder: "John Doe",
              required: true,
              ui: { width: "50%" },
            },
            {
              type: "email",
              name: "email",
              label: "Email",
              placeholder: "john@example.com",
              required: true,
              ui: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          ui: { gap: 16, responsive: true },
          fields: [
            {
              type: "select",
              name: "role",
              label: "Role",
              options: [
                { label: "Developer", value: "developer" },
                { label: "Designer", value: "designer" },
                { label: "Product Manager", value: "pm" },
                { label: "QA Engineer", value: "qa" },
                { label: "DevOps", value: "devops" },
              ],
              required: true,
              ui: { width: "50%" },
            },
            {
              type: "select",
              name: "experience",
              label: "Experience Level",
              options: [
                { label: "Junior (0-2 years)", value: "junior" },
                { label: "Mid-level (2-5 years)", value: "mid" },
                { label: "Senior (5+ years)", value: "senior" },
                { label: "Lead/Principal", value: "lead" },
              ],
              ui: { width: "50%" },
            },
          ],
        },
        {
          type: "tags",
          name: "skills",
          label: "Skills",
          placeholder: "Add skills...",
          maxTags: 8,
          ui: {
            delimiters: ["enter", "comma"],
            variant: "pills",
          },
        },
      ],
    },
    {
      type: "array",
      name: "milestones",
      label: "Project Milestones",
      minItems: 2,
      maxItems: 8,
      ui: {
        isSortable: true,
        addLabel: "Add Milestone",
      },
      fields: [
        {
          type: "text",
          name: "title",
          label: "Milestone Title",
          placeholder: "MVP Launch",
          required: true,
        },
        {
          type: "row",
          ui: { gap: 16, responsive: true },
          fields: [
            {
              type: "date",
              name: "dueDate",
              label: "Due Date",
              required: true,
              ui: { width: "50%" },
            },
            {
              type: "select",
              name: "priority",
              label: "Priority",
              options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
              ],
              ui: { width: "50%" },
            },
          ],
        },
        {
          type: "textarea",
          name: "description",
          label: "Description",
          placeholder: "Describe the milestone...",
          ui: { rows: 2 },
        },
      ],
    },
  ],
});

type TeamSchema = InferType<typeof teamSchema.fields>;

export default function ArrayFieldExample() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as TeamSchema;
    await new Promise((r) => setTimeout(r, 1000));
    toast("Project created!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Setup</CardTitle>
        <CardDescription>
          Dynamic team members and milestones with drag-and-drop reordering
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={teamSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            projectName: "New Web App",
            teamMembers: [
              {
                name: "Alice Johnson",
                email: "alice@example.com",
                role: "developer",
                experience: "senior",
                skills: ["React", "TypeScript"],
              },
            ],
            milestones: [
              {
                title: "Project Kickoff",
                dueDate: new Date(),
                priority: "high",
                description: "Initial planning and requirements gathering",
              },
            ],
          }}
        >
          <FormContent>
            <FormFields />
            <FormActions>
              <FormReset>Reset</FormReset>
              <FormSubmit>Create Project</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
