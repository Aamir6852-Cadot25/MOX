import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Splash from "./components/Splash";
import Toast from "./components/Toast";
import SettingsModal from "./components/SettingsModal";

import Login from "./pages/Login";
import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";
import CodeEdit from "./pages/CodeEdit";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import Cbom from "./pages/Cbom";
import Remediation from "./pages/Remediation";

export default function App() {
  const [splashState, setSplashState] = useState("visible"); // 'visible' | 'fading' | 'hidden'
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("scan");
  const [selectedAssetId, setSelectedAssetId] = useState(null);
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

  // Load app data
  const loadScanData = useCallback(async () => {
    try {
      const [lat, asts, net] = await Promise.all([
        api.latest().catch(() => null),
        api.assets().catch(() => []),
        api.netstat().catch(() => null),
      ]);
      setLatestScan(lat);
      if (Array.isArray(asts)) setAssets(asts);
      setNetstat(net);
    } catch {
      // ignore
    }
  }, []);

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

  // Startup: verify session & fade splash
  useEffect(() => {
    const startTime = Date.now();

    api
      .me()
      .then((me) => {
        setUser(me);
        loadScanData().then(() => {
          const page = determinePageFromLocation();
          if (page) {
            setCurrentPage(page);
          } else {
            // If scan exists, go to dash; else scan
            api.latest().then((res) => {
              if (res && res.scan) setCurrentPage("dash");
              else setCurrentPage("scan");
            }).catch(() => setCurrentPage("scan"));
          }
        });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          setSplashState("fading");
          setTimeout(() => {
            setSplashState("hidden");
          }, 400);
        }, remaining);
      });
  }, [determinePageFromLocation, loadScanData]);

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

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ok
    }
    setUser(null);
    window.location.hash = "";
  };

  const handleScanFinished = async () => {
    await loadScanData();
    handleNavigate("dash");
  };

  if (splashState !== "hidden") {
    return <Splash fading={splashState === "fading"} />;
  }

  if (!user) {
    return (
      <Login
        onLoginSuccess={(userData) => {
          setUser(userData);
          loadScanData();
          handleNavigate("scan");
        }}
      />
    );
  }

  return (
    <>
      <Header
        latestScan={latestScan}
        netstat={netstat}
        onOpenSettings={() => setShowSettings(true)}
        onSignOut={handleLogout}
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
            latestScan={latestScan}
            onTriggerRescan={loadScanData}
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
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {currentPage === "cbom" && (
          <Cbom
            assets={assets}
            showToast={showToast}
          />
        )}

        {currentPage === "rem" && (
          <Remediation
            assets={assets}
          />
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSaved={() => {
          loadScanData();
          showToast("Settings updated");
        }}
      />

      <Toast message={toastMessage} />
    </>
  );
}
