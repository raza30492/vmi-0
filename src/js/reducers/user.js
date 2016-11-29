import { AUTH_PROGRESS, AUTH_SUCCESS, AUTH_FAIL } from "../actions";

const initialState = {
  authProgress: false,
  error: [],
  loggedIn: false
};


const handlers = {
  [AUTH_PROGRESS]: (_, action) => ({authProgress: true}),
  [AUTH_SUCCESS]: (_, action) => ({authProgress: false, loggedIn: true, error: []}),
  [AUTH_FAIL]: (_, action) => ({authProgress: false, error: action.payload.error})
};

export default function buyer (state = initialState, action) {
  let handler = handlers[action.type];
  if( !handler ) return state;
  return { ...state, ...handler(state, action) };
}
