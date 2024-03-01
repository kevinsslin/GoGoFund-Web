"use client";

import React from "react";

import { ThemeProvider } from "@material-tailwind/react";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
// import { opBNBTestnet } from "wagmi/chains";
// import { configureChains, createConfig, WagmiConfig } from "wagmi";
// import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { publicEnv } from "@/lib/env/public";

import Navbar from "./Navbar";

const AreonChain: Chain = {
  id: 462, // The chain ID of your custom chain
  name: "Areon Network Testnet",
  network: "Areon Network Testnet",
  nativeCurrency: {
    name: "Areon",
    symbol: "TAREA",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://testnet-rpc.areon.network"],
    },
    default: {
      http: ["https://testnet-rpc.areon.network"],
    },
  },
  testnet: true,
};
const { chains, publicClient, webSocketPublicClient } = configureChains(
  // [AreonChain, opBNBTestnet],
  [AreonChain],
  [publicProvider()],
);
const ProjectId = publicEnv.WALLETCONNECT_PROJECT_ID;

const connectors = connectorsForWallets([
  // {
  //   groupName: "Email",
  //   wallets: [rainbowMagicConnector({ chains })],
  // },
  {
    groupName: "recommanded",
    wallets: [metaMaskWallet({ projectId: ProjectId, chains })],
  },
  {
    groupName: "others",
    wallets: [
      rainbowWallet({ projectId: ProjectId, chains }),
      walletConnectWallet({ projectId: ProjectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 10,
    },
  },
});
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} coolMode>
          <ThemeProvider>
            <div className="fixed left-0 right-0 top-0 z-50">
              {" "}
              {/* Adjust z-index as needed */}
              <Navbar />
            </div>
            <div className="pt-48">
              {" "}
              {/* Adjust padding-top based on Navbar's height */}
              {children}
            </div>
          </ThemeProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default Layout;
