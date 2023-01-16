import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouterProviderFactory, renderWithIntl } from "src/test/utils";
import PaymentActions, { GET_PAYMENT_REQUESTS_FOR_PROJECT } from ".";
import { RoutePaths } from "src/App";
import { LOCAL_STORAGE_TOKEN_SET_KEY } from "src/hooks/useTokenSet";

expect.extend(matchers);

const TEST_PROJECT_ID = "test-project-id";
const TEST_USER_ID = "test-user-id";

const HASURA_TOKEN_BASIC_TEST_VALUE = {
  user: {
    id: TEST_USER_ID,
  },
  accessToken: "SOME_TOKEN",
  accessTokenExpiresIn: 900,
  creationDate: new Date().getTime(),
};

const mockContribution = {
  id: "705e6b37-d0ee-4e87-b681-7009dd691965",
  githubRecipient: {
    login: "ofux",
    avatarUrl: "https://avatars.githubusercontent.com/u/595505?v=4",
  },
  payments: [
    {
      amount: 100,
      currencyCode: "USD",
    },
    {
      amount: 100,
      currencyCode: "USD",
    },
  ],
  amountInUsd: 200,
  reason: { work_items: ["link_to_pr"] },
};

const graphQlMocks = [
  {
    request: {
      query: GET_PAYMENT_REQUESTS_FOR_PROJECT,
      variables: {
        projectId: TEST_PROJECT_ID,
      },
    },
    result: {
      data: {
        projectsByPk: {
          budgets: [
            {
              initialAmount: 100,
              remainingAmount: 40,
              paymentRequests: [mockContribution],
            },
          ],
        },
      },
    },
  },
];

vi.mock("axios", () => ({
  default: {
    post: () => ({
      data: HASURA_TOKEN_BASIC_TEST_VALUE,
    }),
  },
}));

describe('"ProjectDetails" page', () => {
  beforeAll(() => {
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_SET_KEY, JSON.stringify(HASURA_TOKEN_BASIC_TEST_VALUE));
  });

  beforeEach(() => {
    renderWithIntl(<PaymentActions projectId={TEST_PROJECT_ID} />, {
      wrapper: MemoryRouterProviderFactory({
        route: `${RoutePaths.ProjectDetails}/test-project-id`,
        mocks: graphQlMocks,
      }),
    });
  });

  it("should render the submit payment buttons", async () => {
    await screen.findByText(/submit payment/i);
  });

  it("should render the remaining budget", async () => {
    await screen.findByText(/remaining budget/i);
  });

  it("should render the payments table", async () => {
    expect(await screen.findByText(mockContribution.reason.work_items[0])).toBeInTheDocument();
    expect(await screen.findByText(mockContribution.githubRecipient.login)).toBeInTheDocument();
    expect(await screen.findByText("200 USD")).toBeInTheDocument();
    expect(await screen.findByText("Completed")).toBeInTheDocument();
  });

  it("should render the list payments button after clicking the toggle button", async () => {
    await userEvent.click(await screen.findByText(/submit payment/i));
    await waitFor(() => {
      screen.getByText(/list payments/i);
    });
  });
});
