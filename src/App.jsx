import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import { Program, AnchorProvider, web3} from '@project-serum/anchor';
import { Buffer } from "buffer";
window.Buffer = Buffer;
import kp from './keypair.json'




const TEST_GIFS = [
	// 'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	// 'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	// 'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	// 'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp',
  'https://media.giphy.com/media/oAl4w3bn9N2Yf2JYtl/giphy.gif',
  'https://media.giphy.com/media/niviRfJexf7JE39tZ7/giphy.gif',
  'https://media.giphy.com/media/fDRlQ896CsaDLLGxpK/giphy.gif',
  'https://media.giphy.com/media/HxCrg5GxA9VpXm0sHI/giphy.gif',
  'https://media.giphy.com/media/XmErSE24ns9h1IUltK/giphy.gif'
]

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const programID = new PublicKey("32Yu1ovezPREKDrdCNBEMuKGz3TXD5Ss79FNdA6T6BU4");

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  //State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  
  //Actions
  const checkIfWalletIsConnected = async ()=>{
    if (window?.solana?.isPhantom){
      console.log('Phantom wallet found');
      const response = await window.solana.connect({onlyIfTrusted: true});
      console.log(
        'Connected with public key:',
        response.publicKey.toString()
      );
      
      setWalletAddress(response.publicKey.toString());
    } else {
      alert('Solana object not found! Get a Phantom Wallet');
    }
  };

  const onInputChange = (event) =>{
      const {value} = event.target;
      setInputValue(value);
    };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async() => {
    try {
      const provider = getProvider();
      const program = await getProgram();

      console.log("ping")
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("created a new BaseAccount w' address:", baseAccount.publicKey.toString())
      await getGifList();
    } catch(error){
      console.log("Error creating BaseAccount account:", error)
    }
  }

const sendGif = async () => {
  if (inputValue.length === 0) {
    console.log("No gif link given!")
    return
  }
  setInputValue('');
  console.log('Gif link:', inputValue);
  try {
    const provider = getProvider()
    const program = await getProgram(); 

    await program.rpc.addGif(inputValue, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    console.log("GIF successfully sent to program", inputValue)

    await getGifList();
  } catch (error) {
    console.log("Error sending GIF:", error)
  }
};
    
    //   if (inputValue.length > 0){
    //     console.log('Gif link:', inputValue);
    //     setGifList([...gifList, inputValue]);
    //     setInputValue('');
    //   } else {
    //     console.log('Empty input. Try again.');
    //   }
    // };
  
  const connectWallet = async ()=>{
    const {solana} = window;
    
    if (solana){
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };
  
  const renderNotConnectedContainer = () =>(
    <button 
      className = "cta-button connect-wallet-button"
      onClick={connectWallet}>
    Connect to Wallet
    </button>
  )

const renderConnectedContainer = () => {
// If we hit this, it means the program account hasn't been initialized.
  if (gifList === null) {
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } 
  // Otherwise, we're good! Account exists. User can submit GIFs.
  else {
    return(
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
					{/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

  useEffect(()=>{
    const onLoad = async()=>{
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return ()=> window.removeEventListener('load', onLoad);
  },[]);

  const getProgram = async () => {
  // Get metadata about your solana program
  const idl = await Program.fetchIdl(programID, getProvider());
  // Create a program that you can call
  return new Program(idl, programID, getProvider());
};

const getGifList = async() => {
  try {
    const program = await getProgram(); 
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    console.log("Got the account", account)
    setGifList(account.gifList)

  } catch (error) {
    console.log("Error in getGifList: ", error)
    setGifList(null);
  }
}

useEffect(() => {
  if (walletAddress) {
    console.log('Fetching GIF list...');
    getGifList()
  }
}, [walletAddress]);
  
 return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
{/*       <div className="container"> */}
        <div className="header-container">
          <p className="header">Buidler's GIF Collection</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {/* add the inverse here */}
          {walletAddress && renderConnectedContainer()}
        
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
