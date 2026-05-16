import { fetchAPI } from "./api";

export async function getUsers() {
  const res = await fetchAPI("/users");
  return res.data;
}
