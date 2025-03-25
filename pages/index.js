// pages/index.js
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import HoopSelector from "../components/HoopSelector";
import SearchBar from "../components/SearchBar";
import FloatingActions from "../components/FloatingActions";

import {
  LogoutIcon,
} from "../components/Icons";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alignmentGuide, setAlignmentGuide] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoopSize, setHoopSize] = useState(null);
  const [hoopSizes, setHoopSizes] = useState([]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    async function fetchHoopSizes() {
      try {
        const res = await fetch("/api/get-hoop-sizes");
        const data = await res.json();
        setHoopSizes(data.hoopSizes || []);
      } catch (err) {
        console.error("Failed to load hoop sizes", err);
        toast.error("Failed to load hoop sizes.");
      }
    }
    fetchHoopSizes();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") router.push("/admin");
  }, [session, router]);

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFiles((prev) => [...prev, ...data.urls]);
      setShowModal(true);
      toast.success("Files uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const fetchAlignmentGuide = async () => {
    try {
      const res = await fetch("/api/get-alignment-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoopSize }),
      });

      if (!res.ok) throw new Error("Failed to fetch alignment guide");

      const data = await res.json();
      setAlignmentGuide(data.alignmentGuideUrl);
      toast.success("Hoop guide fetched!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hoop guide.");
    }
  };

  if (!isClient || status === "loading") return <Loader />;
  if (!session) return null;

  return (
    <div>
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} toggle={setSidebarOpen} />
      <div className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content container fadeIn">
        <Card title={`Welcome, ${session.user?.name || "User"}!`}>
          <Button onClick={() => signOut()}>
            <LogoutIcon /> Logout
          </Button>
        </Card>

        <h1 className="title">Embroidery File Uploader</h1>

        <UploadSection
          dropRef={dropRef}
          uploading={uploading}
          uploadProgress={uploadProgress}
          hovering={hovering}
          setHovering={setHovering}
          handleUpload={handleUpload}
        />

        <HoopSelector
          hoopSizes={hoopSizes}
          hoopSize={hoopSize}
          setHoopSize={setHoopSize}
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Button style={{ marginTop: "1.5rem" }} onClick={fetchAlignmentGuide}>
          <HoopIcon /> Show Hoop Guides
        </Button>

        {alignmentGuide && (
          <img
            className="hand-drawn"
            src={alignmentGuide}
            alt="Hoop Alignment Guide"
            style={{ marginTop: "1rem" }}
          />
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Upload Successful"
        >
          <p>Your file has been uploaded successfully!</p>
        </Modal>

        <FloatingActions
          isOpen={fabOpen}
          setIsOpen={setFabOpen}
          onUploadClick={() => setShowModal(true)}
          onGuideClick={fetchAlignmentGuide}
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });