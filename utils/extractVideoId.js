import { get } from "http";
import { URLSearchParams } from "next/dist/compiled/@edge-runtime/primitives/url";

export default function extractVideoId(url) {
  // do stuff

  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get("v");
}
