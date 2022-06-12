import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function Header() {
    const { enableWeb3, account, isWeb3Enabled } = useMoralis();

    useEffect(() => {
        if (isWeb3Enabled) return;
        if (!typeof window != "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3();
            }
        }
    }, [isWeb3Enabled]);

    return (
        <div>
            {!account ? (
                <button
                    onClick={async () => {
                        await enableWeb3();
                        window.localStorage.setItem("connected", "injected");
                    }}
                >
                    Connect
                </button>
            ) : (
                <div>Connected to {account}</div>
            )}
        </div>
    );
}
