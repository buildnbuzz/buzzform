"use client";

import { toast } from "sonner";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { createSchema } from "@buildnbuzz/buzzform";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/components/buzzform/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Schema with array field for managing team members
const teamSchema = createSchema([
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
    rows: 3,
  },
  {
    type: "array",
    name: "teamMembers",
    label: "Team Members",
    description: "Add team members who will work on this project",
    minRows: 1,
    maxRows: 10,
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
            style: { width: "50%" },
          },
          {
            type: "email",
            name: "email",
            label: "Email",
            placeholder: "john@example.com",
            required: true,
            style: { width: "50%" },
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
            style: { width: "50%" },
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
            style: { width: "50%" },
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
    minRows: 2,
    maxRows: 8,
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
            style: { width: "50%" },
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
            style: { width: "50%" },
          },
        ],
      },
      {
        type: "textarea",
        name: "description",
        label: "Description",
        placeholder: "Describe the milestone...",
        rows: 2,
      },
    ],
  },
]);

export default function ArrayFieldExample() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast("Project created!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
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
            teamMembers: [{ id: "member-1" }],
            milestones: [{ id: "milestone-1" }, { id: "milestone-2" }],
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
