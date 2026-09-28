import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Splash from "./components/Splash";
import Toast from "./components/Toast";
import SettingsModal from "./components/SettingsModal";

import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";
import CodeEdit from "./pages/CodeEdit";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import Cbom from "./pages/Cbom";
import Remediation from "./pages/Remediation";

export default function App() {
  const [splashState, setSplashState] = useState("visible"); // 'visible' | 'fading' | 'hidden'
  const [currentPage, setCurrentPage] = useState("scan");
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Global Scans State
  const [scansList, setScansList] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [assets, setAssets] = useState([]);
  const [netstat, setNetstat] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load details for a given scan ID
  const loadScanDetails = useCallback(async (scanId) => {
    try {
      const [lat, asts, net] = await Promise.all([
        api.latest(scanId).catch(() => null),
        api.assets(scanId).catch(() => []),
        api.netstat().catch(() => null),
      ]);
      setLatestScan(lat);
      if (Array.isArray(asts)) setAssets(asts);
      setNetstat(net);
      if (scanId) setSelectedScanId(scanId);
    } catch {
      // ignore
    }
  }, []);

  // Load all scans and select active scan
  const loadAllScans = useCallback(
    async (preferredScanId) => {
      try {
        const hist = await api.history().catch(() => []);
        const scans = Array.isArray(hist) ? hist : [];
        setScansList(scans);

        let activeId = null;
        if (preferredScanId && scans.some((s) => s.id === preferredScanId)) {
          activeId = preferredScanId;
        } else if (selectedScanId && scans.some((s) => s.id === selectedScanId)) {
          activeId = selectedScanId;
        } else if (scans.length > 0) {
          activeId = scans[0].id;
        }

        setSelectedScanId(activeId);
        await loadScanDetails(activeId);
        return activeId;
      } catch {
        return null;
      }
    },
    [selectedScanId, loadScanDetails]
  );

  // Switch active scan across all pages
  const handleSelectScan = useCallback(
    async (scanId) => {
      setSelectedScanId(scanId);
      await loadScanDetails(scanId);
    },
    [loadScanDetails]
  );

  // Determine initial page from URL
  const determinePageFromLocation = useCallback(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    if (hash) {
      if (["scan", "dash", "code", "mon", "hist", "cbom", "rem"].includes(hash)) {
        return hash;
      }
      if (hash === "dashboard") return "dash";
      if (hash === "monitoring") return "mon";
      if (hash === "history" || hash === "reports") return "hist";
      if (hash === "remediation") return "rem";
    }

    if (pathname.includes("dash")) return "dash";
    if (pathname.includes("code") || pathname.includes("fix") || pathname.includes("asset")) return "code";
    if (pathname.includes("mon")) return "mon";
    if (pathname.includes("hist") || pathname.includes("report") || pathname.includes("audit")) return "hist";
    if (pathname.includes("cbom")) return "cbom";
    if (pathname.includes("rem") || pathname.includes("roadmap")) return "rem";
    if (pathname.includes("queue")) return "dash";

    return null;
  }, []);

  // Startup: directly load scans and open app without authentication prompt
  useEffect(() => {
    const startTime = Date.now();

    loadAllScans().then((activeId) => {
      const page = determinePageFromLocation();
      if (page) {
        setCurrentPage(page);
      } else if (activeId) {
        setCurrentPage("dash");
      } else {
        setCurrentPage("scan");
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setSplashState("fading");
        setTimeout(() => {
          setSplashState("hidden");
        }, 350);
      }, remaining);
    });
  }, [determinePageFromLocation, loadAllScans]);

  // Sync hash changes
  useEffect(() => {
    const handleHash = () => {
      const page = determinePageFromLocation();
      if (page) setCurrentPage(page);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [determinePageFromLocation]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const handleOpenAsset = (assetId) => {
    setSelectedAssetId(assetId);
    handleNavigate("code");
  };

  const handleScanFinished = async (newScanId) => {
    const active = await loadAllScans(newScanId);
    handleNavigate("dash");
  };

  const handleScanDeleted = async (deletedId) => {
    await loadAllScans();
  };

  if (splashState !== "hidden") {
    return <Splash fading={splashState === "fading"} />;
  }

  return (
    <>
      <Header
        scans={scansList}
        selectedScanId={selectedScanId}
        onSelectScan={handleSelectScan}
        netstat={netstat}
        onOpenSettings={() => setShowSettings(true)}
      />

      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        latestScan={latestScan}
      />

      <main>
        {currentPage === "scan" && (
          <Scan
            onScanComplete={handleScanFinished}
            showToast={showToast}
          />
        )}

        {currentPage === "dash" && (
          <Dashboard
            latestScan={latestScan}
            assets={assets}
            onNavigate={handleNavigate}
            onOpenAsset={handleOpenAsset}
          />
        )}

        {currentPage === "code" && (
          <CodeEdit
            assets={assets}
            selectedAssetId={selectedAssetId}
            selectedScanId={selectedScanId}
            latestScan={latestScan}
            onTriggerRescan={() => loadScanDetails(selectedScanId)}
            showToast={showToast}
          />
        )}

        {currentPage === "mon" && (
          <Monitoring
            latestScan={latestScan}
            assets={assets}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {currentPage === "hist" && (
          <History
            selectedScanId={selectedScanId}
            onSelectScan={handleSelectScan}
            onScanDeleted={handleScanDeleted}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {currentPage === "cbom" && (
          <Cbom
            selectedScanId={selectedScanId}
            assets={assets}
            onAssetUpdated={() => loadScanDetails(selectedScanId)}
            showToast={showToast}
          />
        )}

        {currentPage === "rem" && (
          <Remediation
            assets={assets}
            selectedScanId={selectedScanId}
          />
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSaved={() => {
          loadScanDetails(selectedScanId);
          showToast("Settings updated");
        }}
      />

      <Toast message={toastMessage} />
    </>
  );
}
