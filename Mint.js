/**
 * interactive-mint.js
 * এই স্ক্রিপ্টটি একটি NFT মিন্ট করার জন্য টার্মিনালে ব্যবহারকারীর কাছ থেকে সরাসরি ইনপুট নেয়।
 * এটি কোনো ফাইলে গোপন তথ্য সংরক্ষণ করে না, তাই এটি অধিক নিরাপদ এবং সহজে ব্যবহারযোগ্য।
 */

const { ethers } = require("ethers");
const readline = require('readline/promises');

// ⚠️ গুরুত্বপূর্ণ: বেশিরভাগ NFT কন্ট্রাক্টে mint ফাংশন নিচের মতো থাকে।
// যদি টার্গেট কন্ট্রাক্টের ফাংশন ভিন্ন হয় (যেমন: publicMint, claim), তাহলে আপনাকে এই ABI পরিবর্তন করতে হবে।
const contractABI = [
  "function mint(uint256 numberOfTokens)"
];

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("🚀 FCFS NFT Minting Bot 🚀");
  console.log("--------------------------------");

  // ব্যবহারকারীর কাছ থেকে সকল প্রয়োজনীয় তথ্য ইনপুট নেওয়া
  const rpcUrl = await rl.question("https://eth-sepolia.api.onfinality.io/rpc?apikey=93d71d29-fa04-45b8-b574-3b4acb2856d5): ");
  const privateKey = await rl.question("🔑 আপনার Wallet Private Key পেস্ট করুন: ");
  const contractAddress = await rl.question("📄 NFT Contract Address পেস্ট করুন: ");
  const quantityStr = await rl.question("🔢 কয়টি NFT মিন্ট করতে চান?: ");
  const mintPriceStr = await rl.question("💰 একটি NFT-এর দাম ETH-এ লিখুন (e.g., 0.05): ");
  
  rl.close();

  try {
    // ইনপুটকে সঠিক ফরম্যাটে রূপান্তর করা
    const mintQuantity = parseInt(quantityStr);
    const mintPrice = ethers.parseEther(mintPriceStr);
    const totalCost = mintPrice * BigInt(mintQuantity);

    // ১. প্রোভাইডারের সাথে সংযোগ
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log("\n✅ Provider-এর সাথে সংযোগ সফল।");

    // ২. ওয়ালেট লোড করা
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`✅ ওয়ালেট লোড হয়েছে: ${wallet.address}`);

    // ৩. কন্ট্রাক্টের ইনস্ট্যান্স তৈরি করা
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    console.log(`✅ কন্ট্রাক্টের সাথে সংযোগ সফল: ${await contract.getAddress()}`);

    console.log("\n🚀 মিন্ট করার জন্য ট্রানজ্যাকশন পাঠানো হচ্ছে...");
    console.log(`   - পরিমাণ: ${mintQuantity}`);
    console.log(`   - মোট খরচ: ${ethers.formatEther(totalCost)} ETH`);

    // ৪. মিন্ট ফাংশন কল করা (গ্যাস ফি স্বয়ংক্রিয়ভাবে নির্ধারিত হবে)
    // ⚠️ কন্ট্রাক্টের mint ফাংশনের নাম ভিন্ন হলে 'mint' শব্দটি পরিবর্তন করুন।
    const tx = await contract.mint(mintQuantity, { value: totalCost });

    console.log(`⏳ ট্রানজ্যাকশন পাঠানো হয়েছে। হ্যাশ: ${tx.hash}`);
    console.log("ট্রানজ্যাকশন নিশ্চিত হওয়ার জন্য অপেক্ষা করা হচ্ছে...");

    const receipt = await tx.wait();

    console.log("\n🎉 অভিনন্দন! মিন্ট সফল হয়েছে!");
    console.log(`🔗 Etherscan-এ দেখুন: https://etherscan.io/tx/${receipt.hash}`);

  } catch (error) {
    console.error("\n❌ একটি ত্রুটি ঘটেছে:");
    // Ethers থেকে আসা আসল কারণটি দেখানোর চেষ্টা করা হচ্ছে
    console.error(error.reason || error.message);
  }
}

main();
