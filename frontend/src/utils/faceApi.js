import * as faceapi from "face-api.js";

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;

  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function detectFaceDescriptor(videoElement) {
  if (!videoElement) {
    throw new Error("Không tìm thấy video element");
  }

  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("Không nhận diện được khuôn mặt");
  }

  return {
    descriptor: Array.from(detection.descriptor),
    detection,
  };
}