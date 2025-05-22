import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// Utility to safely set or remove AsyncStorage items
const safeSetItem = async (key, value) => {
  if (value !== null && value !== undefined) {
    await AsyncStorage.setItem(key, value.toString());
  } else {
    await AsyncStorage.removeItem(key);
  }
};

export const useAuthStore = create((set) => {
  return {
    user: null,
    token: null,
    profilePicture: null,
    isLoading: false,

    setUser: (user) => set({ user }),

    register: async (fullname, email, password) => {
      set({ isLoading: true });

      try {
        const response = await fetch("https://nagamedserver.onrender.com/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullname, email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Something went wrong");

        await safeSetItem("token", data.token);
        await safeSetItem("user", JSON.stringify(data.user));
        await safeSetItem("fullname", data.user.fullname);
        await safeSetItem("email", data.user.email);
        await safeSetItem("profilePicture", data.user.profilePicture);

        set({
          token: data.token,
          user: data.user,
          profilePicture: data.user.profilePicture,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    login: async (email, password) => {
      set({ isLoading: true });

      try {
        const response = await fetch("https://nagamedserver.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Something went wrong");

        await safeSetItem("token", data.token);
        await safeSetItem("user", JSON.stringify(data.user));
        await safeSetItem("fullname", data.user.fullname);
        await safeSetItem("email", data.user.email);
        await safeSetItem("profilePicture", data.user.profilePicture);

        set({
          token: data.token,
          user: data.user,
          profilePicture: data.user.profilePicture,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    checkAuth: async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        return !!token;
      } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
      }
    },

    logout: async () => {
      try {
        await AsyncStorage.multiRemove([
          "token",
          "user",
          "fullname",
          "email",
          "profilePicture",
        ]);

        set({ user: null, token: null, profilePicture: null });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },
  };
});
