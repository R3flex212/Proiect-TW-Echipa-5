const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";


//ia tokenul din localstorage
export function getToken() {
  return localStorage.getItem("token");
}

//salveaza tokenul dupa login
export function setToken(token) {
  localStorage.setItem("token", token);
}

//sterge tokenul la logout
export function clearToken() {
  localStorage.removeItem("token");
}

//apeluri la API
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  //livreaza tokenul daca ruta e protejata
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  //verifica daca raspunsul e in format JSON
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await resp.json() : await resp.text();

  //catch pentru erori http
  if (!resp.ok) {
    const msg = data?.message || `(${resp.status})`;
    throw new Error(msg);
  }
  return data;
}

//URL pentru CSV/XSLX
export function downloadUrl(path, auth = true) {
  const token = getToken();
  const url = new URL(`${API_BASE}${path}`);
  if (auth && token) {
    //punem tokenul in query ca sa evitam bloburile
    url.searchParams.set("token", token);
  }
  return url.toString();
}
