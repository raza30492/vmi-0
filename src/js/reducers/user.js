import { AUTH_PROGRESS, AUTH_SUCCESS, AUTH_FAIL, LOGOUT } from "../actions";

const initialState = {
  authProgress: false,
  error: '',
  loggedIn: false
};


const handlers = {
  [AUTH_PROGRESS]: (_, action) => ({authProgress: true, error: ''}),
  [AUTH_SUCCESS]: (_, action) => ({authProgress: false, loggedIn: true, error: ''}),
  [AUTH_FAIL]: (_, action) => ({authProgress: false,loggedIn: false, error: action.payload.error}),
  [LOGOUT]: (_, action) => ({loggedIn: false})
};

export default function buyer (state = initialState, action) {
  let handler = handlers[action.type];
  if( !handler ) return state;
  return { ...state, ...handler(state, action) };
}
