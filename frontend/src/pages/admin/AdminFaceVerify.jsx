import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminFaceVerify() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [message, setMessage] = useState("Đang tải model nhận diện khuôn mặt...");
  const [verifying, setVerifying] = useState(false);

  const adminId = sessionStorage.getItem("pendingAdminId");

  useEffect(() => {
    if (!adminId) {
      navigate("/login", { replace: true });
      return;
    }

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
        setMessage("Camera đã sẵn sàng. Nhấn nút để xác thực khuôn mặt.");
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
  }, [adminId, navigate]);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setMessage("Đang quét khuôn mặt...");

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("Không phát hiện được khuôn mặt. Vui lòng thử lại.");
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      const res = await api.post("/auth/admin-face-verify", {
        adminId,
        descriptor,
      });

      login({
        token: res.data.token,
        user: res.data.user,
      });

      sessionStorage.removeItem("pendingAdminId");
      sessionStorage.removeItem("pendingAdminEmail");

      navigate("/admin", { replace: true });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Xác thực khuôn mặt thất bại."
      );

      setTimeout(() => {
        sessionStorage.removeItem("pendingAdminId");
        sessionStorage.removeItem("pendingAdminEmail");
        navigate("/login", { replace: true });
      }, 1500);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Xác thực khuôn mặt admin</h1>
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
            onClick={handleVerify}
            disabled={loadingModels || !cameraReady || verifying}
            className="rounded-2xl bg-green-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-60"
          >
            {verifying ? "Đang xác thực..." : "Xác thực khuôn mặt"}
          </button>
        </div>
      </div>
    </div>
  );
}