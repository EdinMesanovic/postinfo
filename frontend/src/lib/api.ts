import axios from "axios";

export const api = axios.create({
  baseURL: "https://bingopostaapi.edinmesan.ba/api/v1",
  withCredentials: true,               // ako koristiš cookie refresh
  headers: { "Content-Type": "application/json" },
});