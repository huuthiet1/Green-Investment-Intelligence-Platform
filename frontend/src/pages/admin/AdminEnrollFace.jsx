import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import api from "../../lib/axios";

export default function AdminEnrollFace() {
  const videoRef = useRef(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Đang tải model...");

  useEffect(() => {
    const init = async () => {
      try {
        const MODEL_URL = "/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraReady(true);
        setMessage("Camera đã sẵn sàng. Nhấn nút để lưu khuôn mặt.");
      } catch (error) {
        console.error(error);
        setMessage("Không thể mở camera hoặc tải model.");
      } finally {
        setLoadingModels(false);
      }
    };

    init();

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEnroll = async () => {
    try {
      setSaving(true);
      setMessage("Đang lấy dữ liệu khuôn mặt...");

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("Không phát hiện được khuôn mặt.");
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      const res = await api.post("/auth/admin-face-enroll", {
        descriptor,
      });

      setMessage(res.data?.message || "Đăng ký khuôn mặt thành công.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng ký khuôn mặt thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Đăng ký khuôn mặt admin</h1>
        <p className="mt-3 text-white/70">{message}</p>

        <div className="mt-6 flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-[340px] w-full max-w-xl rounded-2xl border border-white/10 bg-black object-cover"
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleEnroll}
            disabled={loadingModels || !cameraReady || saving}
            className="rounded-2xl bg-green-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu khuôn mặt"}
          </button>
        </div>
      </div>
    </div>
  );
}