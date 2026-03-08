class ApiClient {
  constructor(baseURL) {
    this.baseURL =
      baseURL || import.meta.env.VITE_API_URL || "http://localhost:5000";
    console.log(baseURL);}


  
  getToken() {
    return localStorage.getItem("swoms_token");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("swoms_token", token);
    } else {
      localStorage.removeItem("swoms_token");
    }
  }

  getUser() {
    const userStr = localStorage.getItem("swoms_user");
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem("swoms_user", JSON.stringify(user));
  }

  clearAuth() {
    localStorage.removeItem("swoms_token");
    localStorage.removeItem("swoms_user");
  }

  isJsonResponse(response) {
    const contentType = response.headers.get("content-type");
    return contentType && contentType.includes("application/json");
  }

  async request(endpoint, options = {}) {
    const {
      method = "GET",
      body = null,
      headers = {},
      params = {},
      responseType = "json",
    } = options;

    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    const token = this.getToken();
    const requestHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };

    const config = {
      method,
      headers: requestHeaders,
    };

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;

        try {
          if (this.isJsonResponse(response)) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const text = await response.text();
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
              errorMessage = `Server returned HTML instead of JSON. Check if endpoint ${endpoint} exists.`;
            } else {
              errorMessage = text.substring(0, 200);
            }
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.url = url.toString();
        throw error;
      }

      if (responseType === "text") {
        return await response.text();
      } else if (responseType === "blob") {
        return await response.blob();
      } else {
        if (!this.isJsonResponse(response)) {
          const text = await response.text();
          throw new Error(
            `Expected JSON but got: ${text.substring(0, 100)}...`
          );
        }
        return await response.json();
      }
    } catch (error) {
      console.error("API Error:", {
        endpoint,
        method,
        error: error.message,
        status: error.status,
        url: error.url,
      });

      if (error.status === 401) {
        this.clearAuth();
        window.location.href = "/login";
      }

      error.endpoint = endpoint;
      throw error;
    }
  }

  get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, { ...options, method: "GET", params });
  }

  post(endpoint, data = null, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body: data });
  }

  put(endpoint, data = null, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body: data });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  async download(endpoint, params = {}) {
    try {
      const response = await this.request(endpoint, {
        method: "GET",
        params,
        responseType: "blob",
      });

      return {
        success: true,
        data: response,
        message: "Download successful",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;
