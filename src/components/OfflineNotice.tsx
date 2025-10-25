import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-[hsl(var(--severe-accent))] text-white py-3 px-4 flex items-center justify-center gap-2 z-50 shadow-lg">
      <WifiOff className="w-5 h-5" />
      <span className="font-semibold">No Internet Connection</span>
      <span className="text-sm opacity-90">• Scanning requires internet</span>
    </div>
  );
};

export default OfflineNotice;
