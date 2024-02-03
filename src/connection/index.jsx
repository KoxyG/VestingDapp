"use client"
import { useCallback, useEffect, useRef, useContext, useState } from "react";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";

import { DAppContext } from "@/context";
import { VESTING_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, VESTING_ABI, TOKEN_ABI } from "@/contract";