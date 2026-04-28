import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface UserProfileModalProps {
  userId: Id<"users">;
  onClose: () => void;
  onMessageRequest?: (userId: Id<"users">) => void;
}

export function UserProfileModal({ userId, onClose, onMessageRequest }: UserProfileModalProps) {
  const targetUser = useQuery(api.users.getUserProfile, { userId });
  const currentUser = useQuery(api.users.currentUser, {});
  const sendFriendRequest = useMutation(api.friends.sendRequest);
  const sendTip = useMutation(api.users.sendTip);
  const sendMessage = useMutation(api.directMessages.sendMessage);
  
  const [tipAmount, setTipAmount] = useState("5.00");
  const [dmText, setDmText] = useState("");
  const [dmImage, setDmImage] = useState("");
  const [view, setView] = useState<"info" | "dm" | "tip">("info");
  const [status, setStatus] = useState<string | null>(null);

  if (!targetUser) return null;

  const isSelf = currentUser?._id === userId;

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest({ targetUserId: userId });
      setStatus("Friend request sent!");
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  };

  const handleSendTip = async () => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      await sendTip({ targetUserId: userId, amount });
      setStatus(`Tipped $${amount.toFixed(2)} successfully!`);
      setView("info");
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  };

  const handleSendDM = async () => {
    if (!dmText.trim() && !dmImage.trim()) return;
    try {
      await sendMessage({ 
        receiverId: userId, 
        message: dmText.trim() || undefined,
        imageUrl: dmImage.trim() || undefined 
      });
      setStatus("Message transmitted.");
      setDmText("");
      setDmImage("");
      setView("info");
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#111827] border-2 border-blue-600/30 rounded-[40px] w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in duration-300">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-xl flex items-center justify-center text-white transition cursor-pointer z-20"
          >
            ✕
          </button>
          <div className="absolute -bottom-12 left-10">
            <div className="w-24 h-24 bg-[#111827] rounded-3xl p-1 border-4 border-[#111827] shadow-2xl">
              <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center text-4xl overflow-hidden">
                {targetUser.image ? <img src={targetUser.image} className="w-full h-full object-cover" /> : "👤"}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 px-10 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{targetUser.username}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest italic">Level {targetUser.level || 1} Identity</span>
              </div>
            </div>
            {targetUser.isAdmin && (
              <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border border-red-500/20">Administrator</span>
            )}
          </div>

          {status && (
            <div className="mb-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[10px] text-blue-400 font-black text-center uppercase tracking-widest animate-in slide-in-from-top-2">
              {status}
            </div>
          )}

          {view === "info" && (
            <div className="space-y-4">
              {!isSelf && (
                <>
                  <button 
                    onClick={handleAddFriend}
                    className="w-full py-4 bg-white text-blue-950 font-black rounded-2xl hover:bg-slate-100 transition shadow-xl uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer flex items-center justify-center space-x-3"
                  >
                    <span>➕ Add Friend Node</span>
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onMessageRequest ? onMessageRequest(userId) : setView("dm")}
                      className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/40 uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer"
                    >
                      💬 Open DM
                    </button>
                    <button 
                      onClick={() => setView("tip")}
                      className="py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition shadow-lg shadow-amber-900/40 uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer"
                    >
                      💰 Send Tip
                    </button>
                  </div>
                </>
              )}
              {isSelf && (
                <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Viewing your own node identity.</p>
                </div>
              )}
            </div>
          )}

          {view === "dm" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">Secure DM Transmission</h3>
              <textarea 
                value={dmText}
                onChange={(e) => setDmText(e.target.value)}
                placeholder="Type your transmission..."
                className="w-full h-24 bg-[#080c16] border border-white/5 rounded-2xl p-5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-slate-600 font-medium resize-none shadow-inner"
              />
              <input 
                type="text"
                value={dmImage}
                onChange={(e) => setDmImage(e.target.value)}
                placeholder="Image URL (optional)..."
                className="w-full bg-[#080c16] border border-white/5 rounded-2xl px-5 py-4 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder-slate-700 font-mono shadow-inner"
              />
              <div className="flex space-x-3">
                <button 
                  onClick={() => setView("info")}
                  className="flex-1 py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:text-white transition uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendDM}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition shadow-xl uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer"
                >
                  Transmit Message
                </button>
              </div>
            </div>
          )}

          {view === "tip" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] ml-2 italic">Refuel Node Balance</h3>
              <div>
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2 mb-2 block">Tip Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 font-black italic">$</span>
                  <input 
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="block w-full pl-12 pr-6 py-5 bg-[#080c16] border border-white/5 text-white font-mono rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-lg italic shadow-inner"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setView("info")}
                  className="flex-1 py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:text-white transition uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={handleSendTip}
                  className="flex-[2] py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition shadow-xl uppercase text-[10px] tracking-widest active:scale-95 cursor-pointer"
                >
                  Confirm Tip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
