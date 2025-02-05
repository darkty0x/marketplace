import { filter, some } from "lodash";
import { forwardRef, useEffect, useState } from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { Virtuoso } from "react-virtuoso";
import { ContributionFragment, WorkItemFragment, WorkItemType } from "src/__generated/graphql";
import FormInput from "src/components/FormInput";
import FormToggle from "src/components/FormToggle";
import GithubIssue, { Action } from "src/components/GithubIssue";
import GithubPullRequest from "src/components/GithubPullRequest";
import { useIntl } from "src/hooks/useIntl";
import { useShowToaster } from "src/hooks/useToaster";
import EyeOffLine from "src/icons/EyeOffLine";
import Link from "src/icons/Link";
import SearchLine from "src/icons/SearchLine";
import EmptyState from "src/pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/EmptyState";
import Toggle from "src/pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/Toggle";
import OtherIssueInput from "./OtherIssueInput";
import useFilteredContributions from "./useFilteredWorkItems";
import { contributionToWorkItem } from "./index";

const THEORETICAL_MAX_SCREEN_HEIGHT = 2000;

type Props = {
  projectId: string;
  contributions: ContributionFragment[];
  type: WorkItemType;
  addWorkItem: (workItem: WorkItemFragment) => void;
  addContribution: (contribution: ContributionFragment) => void;
  ignoreContribution: (contribution: ContributionFragment) => void;
  unignoreContribution: (contribution: ContributionFragment) => void;
};

export default function View({
  projectId,
  contributions,
  type,
  addWorkItem,
  addContribution,
  ignoreContribution,
  unignoreContribution,
}: Props) {
  const { T } = useIntl();
  const { watch, resetField } = useFormContext();
  const tabName = type === WorkItemType.Issue ? "issues" : "pullRequests";

  const [addOtherIssueEnabled, setStateAddOtherIssueEnabled] = useState(false);
  const [searchEnabled, setStateSearchEnabled] = useState(false);
  const setAddOtherIssueEnabled = (value: boolean) => {
    setStateAddOtherIssueEnabled(value);
    setStateSearchEnabled(false);
  };
  const setSearchEnabled = (value: boolean) => {
    setStateSearchEnabled(value);
    setStateAddOtherIssueEnabled(false);
  };
  const showToaster = useShowToaster();

  const addContributionWithToast = (item: ContributionFragment) => {
    addContribution(item);
    showToaster(T(`reward.form.contributions.${tabName}.addedToaster`));
  };

  useEffect(() => {
    if (searchEnabled === false) resetField(`search-${tabName}`);
  }, [searchEnabled]);

  const showIgnoredItemsName = "show-ignored-items";
  const { control } = useForm({ defaultValues: { [showIgnoredItemsName]: false } });
  const showIgnoredItems = useWatch({
    control,
    name: showIgnoredItemsName,
  });

  const visibleIssues = showIgnoredItems ? contributions : filter(contributions, { ignored: false });

  const searchPattern = watch(`search-${tabName}`);
  const filteredContributions = useFilteredContributions({ pattern: searchPattern, contributions: visibleIssues });

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden px-6">
      <div className="flex flex-col gap-3 pt-8">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-3">
            <Toggle
              enabled={addOtherIssueEnabled}
              setEnabled={setAddOtherIssueEnabled}
              icon={<Link />}
              label={T(`reward.form.contributions.${tabName}.addOther.toggle`)}
              testId={`add-other-${tabName}-toggle`}
            />
            {contributions.length > 0 && (
              <Toggle
                enabled={searchEnabled}
                setEnabled={setSearchEnabled}
                icon={<SearchLine />}
                label={T(`reward.form.contributions.${tabName}.search`)}
                testId="search-toggle"
              />
            )}
          </div>
          {some(contributions, { ignored: true }) && (
            <div className="flex flex-row items-center gap-2 font-walsheim text-sm font-normal text-greyscale-50">
              <EyeOffLine />
              {T("reward.form.contributions.showIgnored")}
              <FormToggle name={showIgnoredItemsName} control={control} />
            </div>
          )}
        </div>
        {addOtherIssueEnabled && <OtherIssueInput projectId={projectId} type={type} addWorkItem={addWorkItem} />}
        {searchEnabled && (
          <FormInput
            name={`search-${tabName}`}
            placeholder={T(`reward.form.contributions.${tabName}.searchPlaceholder`)}
            withMargin={false}
            inputClassName="pl-10"
            prefixComponent={
              <div className="mt-0.5">
                <SearchLine className="text-xl text-spaceBlue-200" />
              </div>
            }
            inputProps={{ autoFocus: true }}
          />
        )}
      </div>

      {filteredContributions.length > 0 ? (
        <VirtualizedIssueList
          {...{
            contributions: filteredContributions as ContributionFragment[],
            addContribution: addContributionWithToast,
            ignoreContribution,
            unignoreContribution,
            tabName,
          }}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

const Scroller = forwardRef<HTMLDivElement>((props, ref) => (
  <div
    className="overflow-auto scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5"
    {...props}
    ref={ref}
  />
));

Scroller.displayName = "Scroller";

const ListBuilder = (tabName: string) => {
  const ListComponent = forwardRef<HTMLDivElement>((props, ref) => (
    <div className="mr-1.5 flex h-full flex-col gap-2 p-px" {...props} ref={ref} data-testid={`eligible-${tabName}`} />
  ));
  ListComponent.displayName = "List";
  return ListComponent;
};

interface VirtualizedIssueListProps {
  contributions: ContributionFragment[];
  addContribution: (contribution: ContributionFragment) => void;
  ignoreContribution: (contribution: ContributionFragment) => void;
  unignoreContribution: (contribution: ContributionFragment) => void;
  tabName: string;
}

const VirtualizedIssueList = ({
  contributions,
  addContribution,
  ignoreContribution,
  unignoreContribution,
  tabName,
}: VirtualizedIssueListProps) => {
  return (
    <Virtuoso
      data={contributions}
      components={{ Scroller, List: ListBuilder(tabName) }}
      style={{ height: THEORETICAL_MAX_SCREEN_HEIGHT }}
      itemContent={(_, contribution) => {
        const workItem = contributionToWorkItem(contribution);
        if (!workItem) return;

        return workItem.githubIssue ? (
          <GithubIssue
            key={contribution.id}
            issue={workItem.githubIssue}
            action={Action.Add}
            onClick={() => addContribution(contribution)}
            secondaryAction={contribution.ignored ? Action.UnIgnore : Action.Ignore}
            onSecondaryClick={() =>
              contribution.ignored ? unignoreContribution(contribution) : ignoreContribution(contribution)
            }
            ignored={!!contribution.ignored}
            addMarginTopForVirtuosoDisplay={true}
          />
        ) : workItem.githubPullRequest ? (
          <GithubPullRequest
            key={contribution.id}
            pullRequest={workItem.githubPullRequest}
            action={Action.Add}
            onClick={() => addContribution(contribution)}
            secondaryAction={contribution.ignored ? Action.UnIgnore : Action.Ignore}
            onSecondaryClick={() =>
              contribution.ignored ? unignoreContribution(contribution) : ignoreContribution(contribution)
            }
            ignored={!!contribution.ignored}
            addMarginTopForVirtuosoDisplay={true}
          />
        ) : null;
      }}
    />
  );
};
