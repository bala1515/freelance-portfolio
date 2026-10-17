import axios from "axios";

const csrfToken = document
  .querySelector('meta[name="csrf-token"]')
  ?.getAttribute("content");

export const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(csrfToken && { "X-CSRF-Token": csrfToken }),
  },
});