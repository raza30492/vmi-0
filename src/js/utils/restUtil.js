export default function handleErrors (response) {
  if ( !response.ok && response.status != 409) {
    throw new Error(response.statusText);
  }
  return response;
}
