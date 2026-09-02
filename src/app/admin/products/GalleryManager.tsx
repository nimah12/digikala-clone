"use client";

import { useEffect, useState } from "react";
import { deleteMedia, errorMessage, fetchMedia, uploadProductMedia } from "./admin-api";
import type { MediaItem } from "./types";
import { SafeImg } from "@/components/SafeImage";

export default function GalleryManager({ productId }: { productId: number }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchMedia(productId)
      .then((m) => {
        if (!cancelled) setMedia(m);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "خطای نامشخص"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleUpload(files: FileList) {
    setError("");
    setUploading(true);
    try {
      const data = await uploadProductMedia(productId, files);
      setMedia((prev) => [...prev, ...data.media]);
      if (data.skipped && data.skipped.length > 0) {
        const names = data.skipped
          .map((s) => `${s.name} (${s.reason})`)
          .join("، ");
        setError(`برخی فایل‌ها رد شدند: ${names}`);
      }
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(mediaId: number) {
    setError("");
    try {
      await deleteMedia(productId, mediaId);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (err) {
      setError(errorMessage(err, "خطای نامشخص"));
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px dashed #ddd",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <input
          id="gallery-files"
          name="gallery-files"
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUpload(e.target.files);
            }
          }}
        />
        {uploading && (
          <span style={{ marginRight: 8, fontSize: 13, color: "var(--text-secondary)" }}>
            در حال آپلود گالری...
          </span>
        )}
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          می‌تونی چند عکس (حداکثر ۵ مگابایت هر کدام) و ویدیو (حداکثر ۲۰۰ مگابایت هر کدام) هم‌زمان انتخاب کنی.
        </p>
      </div>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>در حال بارگذاری گالری...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 10,
          }}
        >
          {media.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>هنوز رسانه‌ای اضافه نشده.</p>
          )}
          {media.map((m) => (
            <div
              key={m.id}
              style={{
                position: "relative",
                border: "1px solid var(--border)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {m.type === "video" ? (
                <video
                  src={m.url}
                  controls
                  style={{ width: "100%", height: 90, objectFit: "cover" }}
                />
              ) : (
                <SafeImg
                  src={m.url}
                  alt=""
                  style={{ width: "100%", height: 90, objectFit: "cover" }}
                />
              )}
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "rgba(192,57,43,0.9)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
