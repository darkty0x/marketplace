import { daysFromNow } from "src/utils/date";
import { GithubPullRequestFragment, GithubPullRequestStatus, WorkItemType } from "src/__generated/graphql";
import GithubPullRequest, { Action, Props } from "src/components/GithubPullRequest";

const pullRequests: Record<string, GithubPullRequestFragment> = {
  closed: {
    id: "1268051991",
    repoId: 123456,
    number: 541,
    status: GithubPullRequestStatus.Closed,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(6),
    mergedAt: undefined,
  },
  closedWithLongLink: {
    id: "1268051991",
    repoId: 123456,
    number: 541,
    status: GithubPullRequestStatus.Closed,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(6),
    mergedAt: undefined,
  },
  open: {
    id: "1268051991",
    repoId: 123456,
    number: 541,
    status: GithubPullRequestStatus.Open,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: null,
    mergedAt: null,
  },
  merged: {
    id: "1268051991",
    repoId: 123456,
    number: 541,
    status: GithubPullRequestStatus.Merged,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    mergedAt: daysFromNow(5),
    closedAt: daysFromNow(5),
  },
};

export default {
  title: "GithubPullRequest",
  component: GithubPullRequest,
  argTypes: {
    action: {
      control: { type: "select" },
      options: [undefined, Action.Add, Action.Remove, Action.Ignore, Action.UnIgnore],
    },
    secondaryAction: {
      control: { type: "select" },
      options: [undefined, Action.Add, Action.Remove, Action.Ignore, Action.UnIgnore],
    },
    workItem: {
      options: Object.keys(pullRequests),
      mapping: pullRequests,
      control: { type: "select" },
    },
  },
};

const defaultProps: Props = { pullRequest: pullRequests.closed };
const longLinkProps: Props = { pullRequest: pullRequests.closedWithLongLink };
const openProps: Props = { pullRequest: pullRequests.open };
const mergedProps: Props = { pullRequest: pullRequests.merged };

export const Default = {
  render: (args: Props) => <GithubPullRequest {...defaultProps} {...args} />,
};

export const LongLink = {
  render: (args: Props) => <GithubPullRequest {...longLinkProps} {...args} />,
};
export const Open = {
  render: (args: Props) => <GithubPullRequest {...openProps} {...args} />,
};
export const Merged = {
  render: (args: Props) => <GithubPullRequest {...mergedProps} {...args} />,
};
