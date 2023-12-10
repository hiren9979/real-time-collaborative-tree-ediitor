import axios from "axios";

const baseURL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // You can add additional headers here if needed
  },
});

// Add a request interceptor to include the authentication token (if available) in requests
api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Unauthorized: Redirect to login or handle authentication error
      console.error(
        "Unauthorized: Redirect to login or handle authentication error"
      );
    }

    return Promise.reject({ statusCode: response.status, error });
  }
);

export const addNode = async (parentId, content) => {
  try {
    const response = await api.post("/document/addNode", { parentId, content });
    return response;
  } catch (error) {
    console.error("Error adding node:", error);
    throw error;
  }
};

export const editNode = async (nodeId, content) => {
  try {
    const response = await api.put(`/document/editNode/${nodeId}`, { content });
    return response;
  } catch (error) {
    console.error("Error editing node:", error);
    throw error;
  }
};

export const deleteNode = async (nodeId) => {
  try {
    const response = await api.delete(`/document/deleteNode/${nodeId}`);
    return response;
  } catch (error) {
    console.error("Error deleting node:", error);
    throw error;
  }
};

export const fetchDocumentNodes = async () => {
  try {
    const response = await api.get("/document");
    return response;
  } catch (error) {
    console.error("Error fetching document nodes:", error);
    throw error;
  }
};

export default api;
