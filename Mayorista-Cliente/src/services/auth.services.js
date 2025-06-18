// services/auth.servuces,js

export const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || "Error al iniciar sesión" };
    }
  } catch (error) {
    return { success: false, error: "Error del servidor" };
  }
};
