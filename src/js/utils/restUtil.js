export const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + window.sessionStorage.token
};
export function getHeaders (token) {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + token
  };
}

export default function handleErrors (response) {
  if ( !response.ok && response.status != 409) {
    throw new Error(response.statusText);
  }
  return response;
}
