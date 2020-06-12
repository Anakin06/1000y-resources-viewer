import React, { createContext, FC, useReducer, useContext } from "react";
import { State, defaultState } from "./state";
import { Action } from "./action";
import reducer from "./reducer";
export type Dispatch = React.Dispatch<Action>;

interface IContext {
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const Context = createContext<IContext>({
  state: defaultState,
  dispatch: () => null,
});

export function useSelect() {
  const { state, dispatch } = useContext(Context);
  return {
    ...state,
    dispatch,
  };
}

export const Provider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  return (
    <Context.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};

type Map<T, U, R> = (a: T, b: U) => R;
const map = <T, U, R>(mapTo?: Map<T, U, R>): Map<T, U, R> => (a: T, b: U) => {
  return mapTo ? mapTo(a, b) : ({} as R);
};

// dispatch changed?
export const unstable_connect = <S1, D, S2 = {}>(
  mapStateToProps?: (state: State, ownProps: S2) => S1,
  mapDispatchToProps?: (dispatch: React.Dispatch<Action>, ownProps: S2) => D
) => (Component: React.ComponentType<S1 & D & S2>) => (props: S2) => {
  return (
    <Context.Consumer>
      {({ state, dispatch }) => {
        return (
          <Component
            {...props}
            {...map(mapStateToProps)(state, props)}
            {...map(mapDispatchToProps)(dispatch, props)}
          />
        );
      }}
    </Context.Consumer>
  );
};
