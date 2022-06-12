import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddress } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrace() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const [entranceFee, setEntranceFee] = useState("0");
    const [numPlayer, setNumPlayer] = useState("0");
    const [recentWin, setRecentWin] = useState("0");

    const raffleAddress = chainIdHex ? contractAddress[parseInt(chainIdHex)][0] : null;

    const dispatch = useNotification();

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        const fee = await getEntranceFee();
        setEntranceFee(fee.toString());
        const numPlayersFromCall = await getNumberOfPlayers();
        setNumPlayer(numPlayersFromCall.toString());
        const recentWinnerFromCall = await getRecentWinner();
        setRecentWin(recentWinnerFromCall.toString());
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    async function handleSuccess(tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    }

    function handleNewNotification(tx) {
        dispatch({
            type: "info",
            message: "Transaction completed",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        });
    }

    return (
        <div>
            <h2>Smart Contracts Lottery</h2>
            {raffleAddress ? (
                <div>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            });
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>Number of players: {numPlayer}</div>
                    <div>Recent winner: {recentWin}</div>
                </div>
            ) : (
                <div>No raffle address</div>
            )}
        </div>
    );
}
