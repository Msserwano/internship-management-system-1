// KCCA IMS Data Synchronization Event Bus
// Broadcasts data changes across components, pages, and browser tabs

const CHANNEL_NAME = "kcca_ims_sync_channel";
const STORAGE_KEY = "kcca_ims_last_update";

let channel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn("BroadcastChannel initialization failed:", e);
  }
}

/**
 * Broadcast that a mutation (create/update/delete) has occurred
 */
export const notifyDataChanged = (sourceEndpoint = "") => {
  const payload = { timestamp: Date.now(), sourceEndpoint };

  // 1. Local window event for immediate same-tab React component updates
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app_data_changed", { detail: payload }));
  }

  // 2. BroadcastChannel for cross-tab updates on the same device
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      console.warn("BroadcastChannel postMessage error:", e);
    }
  }

  // 3. LocalStorage fallback for cross-tab synchronization
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Ignore storage quota errors
    }
  }
};

/**
 * Subscribe to data changes (from local actions or other tabs)
 */
export const subscribeDataChange = (callback) => {
  if (typeof window === "undefined") return () => {};

  // Local window event listener
  const handleCustomEvent = (e) => {
    callback(e.detail || {});
  };
  window.addEventListener("app_data_changed", handleCustomEvent);

  // BroadcastChannel listener
  const handleChannelMessage = (e) => {
    callback(e.data || {});
  };
  if (channel) {
    channel.addEventListener("message", handleChannelMessage);
  }

  // LocalStorage event listener
  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        callback(payload);
      } catch (err) {
        callback({});
      }
    }
  };
  window.addEventListener("storage", handleStorageEvent);

  // Window focus listener (re-fetch when tab becomes active)
  const handleFocus = () => {
    callback({ reason: "focus" });
  };
  window.addEventListener("focus", handleFocus);

  // Return unsubscribe function
  return () => {
    window.removeEventListener("app_data_changed", handleCustomEvent);
    if (channel) {
      channel.removeEventListener("message", handleChannelMessage);
    }
    window.removeEventListener("storage", handleStorageEvent);
    window.removeEventListener("focus", handleFocus);
  };
};
