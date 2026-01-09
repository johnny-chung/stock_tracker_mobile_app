import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { BASE_URL } from "@/constants/base-url";

type RegisterArgs = {
  userId?: string | null;
};

export async function registerForPushNotificationsAsync(
  args: RegisterArgs = {}
) {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return null;
    }

    // projectId is required in standalone builds; optional in Expo Go
    const projectId =
      (Constants?.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : (undefined as any)
    );
    const expoPushToken = tokenResponse.data;

    // Resolve userId: prefer provided userId, otherwise use device name (may be null)
    const deviceName: string | null = (Device as any).deviceName ?? null;
    const resolvedUserId = args.userId ?? deviceName ?? null;

    // Send to backend for storage
    await fetch(`${BASE_URL}/api/push-expo-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: resolvedUserId,
        token: expoPushToken,
        device: {
          platform: Device.osName,
          manufacturer: Device.manufacturer ?? null,
          model: Device.modelName ?? null,
          name: deviceName,
        },
      }),
    });

    return expoPushToken;
  } catch (e) {
    console.warn("registerForPushNotificationsAsync error", e);
    return null;
  }
}
