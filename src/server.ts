import "dotenv/config";
import { createApp, runtimeConfig } from "./app.js";

const app = await createApp();
app.listen(runtimeConfig.PORT, () => {
  console.log(`[PixelBrief] listening on :${runtimeConfig.PORT}`);
  console.log(`[PixelBrief] payment=${runtimeConfig.REQUIRE_PAYMENT ? "x402" : "off"} network=${runtimeConfig.NETWORK}`);
  console.log(`[PixelBrief] public=${runtimeConfig.PUBLIC_BASE_URL}`);
});
