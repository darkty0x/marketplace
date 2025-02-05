import { act, renderHook } from "@testing-library/react-hooks";
import {
  Action,
  DAY_RATE_USD,
  DEFAULT_NUMBER_OF_DAYS,
  getInitialStep,
  getReducer,
  hours,
  Steps,
  stepSizes,
  useWorkEstimation,
} from "src/hooks/useWorkEstimation";
import { describe, expect, it, vi, beforeEach, test } from "vitest";

const budget = {
  initialAmount: 200,
  remainingAmount: 10000,
};

describe("useWorkEstimation", () => {
  const onChange = vi.fn();
  const initialAmountToPay = DEFAULT_NUMBER_OF_DAYS * DAY_RATE_USD;
  const initialWorkedHours = DEFAULT_NUMBER_OF_DAYS * hours[Steps.Days];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return an initial amount", () => {
    const { result } = renderHook(() => useWorkEstimation(onChange, budget));
    expect(result.current.amountToPay).toBe(initialAmountToPay);
  });

  it("should initially call the onChange callback with the initial amount", () => {
    renderHook(() => useWorkEstimation(onChange, budget));
    expect(onChange).toHaveBeenCalledWith(initialAmountToPay, initialWorkedHours);
  });

  it("should call the onChange callback when amount has changed", () => {
    const { result } = renderHook(() => useWorkEstimation(onChange, budget));
    onChange.mockClear();
    act(() => {
      result.current.tryIncreaseNumberOfDays();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      initialAmountToPay + DAY_RATE_USD / 2,
      initialWorkedHours + 0.5 * hours[Steps.Days]
    );
  });

  it("should forbid decreasing when estimation is 1 hour", () => {
    const veryLowBudget = {
      initialAmount: 200,
      remainingAmount: 150,
    };
    const { result } = renderHook(() => useWorkEstimation(onChange, veryLowBudget));
    expect(result.current.canDecrease).toBe(true);
    act(() => {
      result.current.tryDecreaseNumberOfDays();
    });
    expect(result.current.canDecrease).toBe(false);
  });

  it("should forbid increasing when estimation is at budget maximum", () => {
    const lowBudget = {
      initialAmount: 200,
      remainingAmount: 200,
    };
    const { result } = renderHook(() => useWorkEstimation(onChange, lowBudget));
    expect(result.current.canIncrease).toBe(false);
    act(() => {
      result.current.tryDecreaseNumberOfDays();
    });
    expect(result.current.canIncrease).toBe(true);
  });

  it("should forbid increasing when estimation is at max days steps", () => {
    const { result } = renderHook(() => useWorkEstimation(onChange, budget));
    expect(result.current.canIncrease).toBe(true);
    for (let i = 0; i <= 36; i++) {
      act(() => {
        result.current.tryIncreaseNumberOfDays();
      });
    }
    expect(result.current.canIncrease).toBe(false);
  });

  it("should give integer amounts", () => {
    const lowBudget = {
      initialAmount: 200,
      remainingAmount: 200,
    };
    const { result } = renderHook(() => useWorkEstimation(onChange, lowBudget));
    expect(result.current.amountToPay).toBe(188);
  });
});

describe("reducer", () => {
  const reducer = getReducer(budget);

  it("increases days", () => {
    const state = {
      stepNumber: 1,
      steps: Steps.Days,
    };
    const action = Action.Increase;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(1 + stepSizes[Steps.Days]);
  });

  it("descreases days", () => {
    const state = {
      stepNumber: 2,
      steps: Steps.Days,
    };
    const action = Action.Decrease;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(2 - stepSizes[Steps.Days]);
  });

  it("switches from hours to days", () => {
    const state = {
      stepNumber: 7,
      steps: Steps.Hours,
    };
    const action = Action.Increase;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(1);
    expect(nextState.steps).toBe(Steps.Days);
  });

  it("switches from days to hours", () => {
    const state = {
      stepNumber: 1,
      steps: Steps.Days,
    };
    const action = Action.Decrease;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(7);
    expect(nextState.steps).toBe(Steps.Hours);
  });

  it("does not go over 20 days", () => {
    const state = {
      stepNumber: 20,
      steps: Steps.Days,
    };
    const action = Action.Increase;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(20);
    expect(nextState.steps).toBe(Steps.Days);
  });

  it("does not go below 1 hours", () => {
    const state = {
      stepNumber: 1,
      steps: Steps.Hours,
    };
    const action = Action.Decrease;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(1);
    expect(nextState.steps).toBe(Steps.Hours);
  });

  it("does not exceed budget in days", () => {
    const lowBudget = {
      initialAmount: 200,
      remainingAmount: 5249,
    };
    const reducer = getReducer(lowBudget);

    const state = {
      stepNumber: 10,
      steps: Steps.Days,
    };
    const action = Action.Increase;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(10);
  });

  it("does not exceed budget in hours", () => {
    const lowBudget = {
      initialAmount: 110,
      remainingAmount: 312,
    };
    const reducer = getReducer(lowBudget);

    const state = {
      stepNumber: 4,
      steps: Steps.Hours,
    };
    const action = Action.Increase;
    const nextState = reducer(state, action);

    expect(nextState.stepNumber).toBe(4);
  });

  it("does not change when budget is too low", () => {
    const closeToZeroBudget = {
      initialAmount: 110,
      remainingAmount: 1,
    };
    const reducer = getReducer(closeToZeroBudget);

    const state = {
      stepNumber: 0,
      steps: Steps.Hours,
    };
    {
      const action = Action.Increase;
      const nextState = reducer(state, action);

      expect(nextState.stepNumber).toBe(0);
      expect(nextState.steps).toBe(Steps.Hours);
    }
    {
      const action = Action.Decrease;
      const nextState = reducer(state, action);

      expect(nextState.stepNumber).toBe(0);
      expect(nextState.steps).toBe(Steps.Hours);
    }
  });
});

describe("getInitialStep", () => {
  test.each([
    [0, Steps.Hours, 0],
    [0, Steps.Hours, 7],
    [1, Steps.Hours, 70],
    [3, Steps.Hours, 190],
    [1, Steps.Days, 500],
    [1, Steps.Days, 999],
    [2, Steps.Days, 1000],
    [2, Steps.Days, 1500],
    [2, Steps.Days, 99999999],
  ])("returns %i %s for an initial budget of %i", (expectedStepNumber, expectedSteps, remainingBudget) => {
    const budget = {
      initialAmount: 100,
      remainingAmount: remainingBudget,
    };
    const initialStep = getInitialStep(budget);
    expect(initialStep.stepNumber).toBe(expectedStepNumber);
    expect(initialStep.steps).toBe(expectedSteps);
  });
});
