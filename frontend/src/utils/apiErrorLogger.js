export default async function apiErrorLogger(error) {
  let resJSON;
  if (
    error.response &&
    error.response.headers.get("Content-Type").includes("application/json")
  )
    resJSON = await error.response.json();
  if (resJSON) console.error(resJSON);
  console.error(error);

  return resJSON;
}
