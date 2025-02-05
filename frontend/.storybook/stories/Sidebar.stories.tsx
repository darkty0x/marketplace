import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProjectDetailsTab } from "src/pages/ProjectDetails/Sidebar";
import { withRouter } from "storybook-addon-react-router-v6";
import { ProjectDetails } from "src/pages/ProjectDetails";
import View, { SidebarProjectDetails } from "src/pages/ProjectDetails/Sidebar/View";

export default {
  title: "ProjectsSidebar",
  component: View,
  decorators: [withRouter],
} as ComponentMeta<typeof View>;

const availableTabs: ProjectDetailsTab[] = [
  {
    label: "Overview",
    path: "overview",
  },
  {
    label: "Contributors",
    path: "contributors",
  },
];

const currentProject: ProjectDetails & SidebarProjectDetails = {
  id: "test-project-id",
  name: "Our project",
  key: "our-project",
  logoUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
  leads: [
    {
      id: "leader-id",
      login: "Leader",
      avatarUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
    },
  ],
  sponsors: [],
  languages: {},
  withInvitation: false,
  contributorsCount: 4,
};

const otherProject: ProjectDetails & SidebarProjectDetails = {
  id: "other-project-id",
  name: "Other project",
  key: "other-project",
  logoUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
  leads: [
    {
      id: "leader-id",
      login: "Leader",
      avatarUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
    },
  ],
  sponsors: [],
  languages: {},
  withInvitation: false,
  contributorsCount: 4,
};

const expandable = true;
const allProjects = [currentProject, otherProject];

const Template: ComponentStory<typeof View> = () => (
  <View
    {...{
      expandable,
      currentProject,
      allProjects,
      availableTabs,
      projectLead: true,
    }}
  />
);

export const Default = Template.bind({});
