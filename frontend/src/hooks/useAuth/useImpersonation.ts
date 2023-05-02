import { gql } from "@apollo/client";
import { useEffect, useMemo } from "react";
import {
  ImpersonatedUserQuery,
  useImpersonatedLeadProjectsQuery,
  useImpersonatedUserQuery,
} from "src/__generated/graphql";
import { useImpersonationClaims } from "src/hooks/useImpersonationClaims";
import { useIntl } from "src/hooks/useIntl";
import { useShowToaster } from "src/hooks/useToaster";
import { CustomUserRole, HasuraUserRole, Locale, User } from "src/types";

export const useImpersonation = () => {
  const { impersonationSet, clearImpersonationSet, setCustomClaims } = useImpersonationClaims();
  const showToaster = useShowToaster();
  const { T } = useIntl();

  const impersonatedUserQuery = useImpersonatedUserQuery({
    context: {
      graphqlErrorDisplay: "none",
    },
    variables: {
      id: impersonationSet?.userId,
    },
    skip: !impersonationSet,
    onCompleted(data) {
      if (!data.user) {
        showToaster(T("impersonation.form.errors.unknownUser", { userId: impersonationSet?.userId }), {
          isError: true,
        });
        clearImpersonationSet();
      }
    },
    onError(error) {
      showToaster(error.message, {
        isError: true,
      });
      clearImpersonationSet();
    },
  });
  const impersonating = !!impersonatedUserQuery.data;

  const invalidImpersonation = !!impersonatedUserQuery.error;

  const leadProjectsQuery = useImpersonatedLeadProjectsQuery({
    context: {
      graphqlErrorDisplay: "none",
    },
    variables: {
      userId: impersonationSet?.userId,
    },
    skip: !impersonationSet,
  });

  const impersonatedUser = impersonatedUserQuery.data?.user
    ? mapImpersonatedUser(impersonatedUserQuery.data.user)
    : null;

  const impersonatedGithubUserId = impersonatedUserQuery.data?.user?.githubUser?.githubUserId as number | undefined;
  const impersonatedLedProjectIds: string[] = useMemo(
    () => leadProjectsQuery.data?.projectLeads.map(lead => lead.projectId) ?? [],
    [leadProjectsQuery.data]
  );

  const impersonatedRoles =
    impersonatedLedProjectIds.length > 0
      ? [HasuraUserRole.RegisteredUser, CustomUserRole.ProjectLead]
      : [HasuraUserRole.RegisteredUser];

  useEffect(() => {
    if (impersonatedGithubUserId === undefined || impersonatedLedProjectIds.length === 0) {
      return;
    }
    setCustomClaims({
      githubUserId: impersonatedGithubUserId,
      projectsLeaded: impersonatedLedProjectIds,
    });
  }, [impersonatedLedProjectIds, impersonatedGithubUserId]);

  return {
    impersonating,
    invalidImpersonation,
    impersonatedRoles,
    impersonatedUser,
    impersonatedGithubUserId,
    impersonatedLedProjectIds,
    stopImpersonation: clearImpersonationSet,
  };
};

gql`
  query ImpersonatedUser($id: uuid!) {
    user(id: $id) {
      id
      createdAt
      displayName
      email
      avatarUrl
      locale
      isAnonymous
      defaultRole
      emailVerified
      phoneNumber
      phoneNumberVerified
      activeMfaType
      roles {
        role
      }
      githubUser {
        userId
        githubUserId
      }
    }
  }
`;

gql`
  query ImpersonatedLeadProjects($userId: uuid!) {
    projectLeads(where: { userId: { _eq: $userId } }) {
      userId
      projectId
    }
  }
`;

const mapImpersonatedUser = (user: ImpersonatedUserQuery["user"]): User | null => {
  if (user === null) {
    return null;
  }
  return {
    ...user,
    roles: user.roles.map(({ role }) => role) as HasuraUserRole[],
    locale: user.locale as Locale,
    defaultRole: user.defaultRole as HasuraUserRole,
  };
};