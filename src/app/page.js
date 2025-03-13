"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/firebase";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import 'react-phone-number-input/style.css'

export default function ListsApp() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState("enterPhone");
  const [lists, setLists] = useState(() => {
    return [];
  });
  const [expandedList, setExpandedList] = useState(null);
  const [newList, setNewList] = useState("");
  const [newItems, setNewItems] = useState({});

  useEffect(() => {
    fetchLists();
  }, []);

  const updateLists = async (newLists) => {
    setLists(newLists);
    const token = localStorage.getItem("authToken");
    await fetch("/api/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ phone, name: newList }),
    });
    fetchLists();
  };

  const addList = () => {
    if (newList) {
      updateLists([...lists, { name: newList, items: [], id: "temp_id" }]);
      setNewList("");
    }
  };

  const deleteList = async (id) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`/api/lists?id=${id}`, { method: "DELETE", headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }, });
    const data = await res.json();
    if (data.success) {
      setLists(lists.filter((list) => list.id !== id)); // Remove from UI
    } else {
      alert("Error deleting list");
    }
  };

  const toggleList = (index) => {
    setExpandedList(expandedList === index ? null : index);
  };

  const addItem = async (listId, text) => {
    if (!text) return;
    if (!newItems[listId]) return;
    const res = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listId, text })
    });
    const data = await res.json();
    if (data.success) {
      setLists(lists.map((list) => list.id === listId ? { ...list, items: [...list.items, data.item] } : list));
      setNewItems((prev) => ({ ...prev, [listId]: "" }));
    } else {
      alert("Error adding item");
    }
  };

  const removeItem = async (id, listId) => {
    const res = await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setLists(lists.map((list) => list.id === listId ? { ...list, items: list.items.filter((item) => item.id !== id) } : list));
    } else {
      alert("Error deleting item");
    }
  };

  const toggleItem = async (id, checked, listId) => {
    const res = await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: !checked }),
    });
    const data = await res.json();
    if (data.success) {
      setLists(lists.map((list) => list.id === listId ? {
        ...list,
        items: list.items.map((item) => item.id === id ? { ...item, checked: !checked } : item),
      } : list));
    } else {
      alert("Error updating item");
    }
  };

  const sendOtp = async () => {
    if (!phone) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      // Ensure reCAPTCHA exists
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved.")
          },
        });
      }
  
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;
  
      setStep("enterOtp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    }
  }

  const verifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Generate token
      const res = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("phone", phone);
        setIsAuthenticated(true);
        fetchLists();
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    }
  }

  const fetchLists = async() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setIsAuthenticated(true);
    setPhone(localStorage.getItem("phone"));
    const res = await fetch("/api/lists", {
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      const listsWithItems = await Promise.all(
        data.lists.map(async (list) => {
          const itemsRes = await fetch(`/api/items?listId=${list.id}`);
          const itemsData = await itemsRes.json();
          return { ...list, items: itemsData.success ? itemsData.items: []};
        })
      );
      setLists(listsWithItems);
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("phone");
    setIsAuthenticated(false);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {!isAuthenticated ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Login</h1>
          {step === "enterPhone" ? (
            <>
            <form onSubmit={(e) => {e.preventDefault(); sendOtp(); }}>
              <PhoneInputWithCountrySelect
                placeholder="Enter phone number"
                defaultCountry="US"
                value={phone}
                onChange={(e) => {if (e) setPhone(e)}}/>
              <Button type="submit">Send Verification</Button>
            </form>
            <div id="recaptcha-container"></div>
            </>
          ) : (
            <>
            <form onSubmit={(e) => {e.preventDefault(); verifyOtp(); }}>
              <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <Button type="submit">Verify OTP</Button>
            </form>
            </>
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-bold mb-4">Your Lists <Button onClick={logout} variant="secondary">Logout</Button></h1>
          <div className="space-y-2">
            {lists.map((list) => (
              <div key={list.id} className="bg-white shadow-md rounded-xl p-4 flex flex-col space-y-2 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg cursor-pointer" onClick={() => toggleList(list.id)}>{list.name}</span>
                  <Button onClick={() => deleteList(list.id)} className="text-red-500 text-lg">X</Button>
                </div>
                {expandedList === list.id && (
                  <div className="bg-gray-50 rounded-lg p-2 space-y-2">
                    {list.items.map((item) => (
                      <div key={`${list.id}-${item.id}`} className="flex items-center space-x-2">
                        <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id, item.checked, list.id)} 
                          className="w-6 h-6 accent-blue-600 focus:ring-2 focus:ring-blue-400" />
                        <span className={item.checked ? "text-gray-500 opacity-60" : "text-black"}>
                          {item.text}
                        </span>
                        <Button onClick={() => removeItem(item.id, list.id)}>❌</Button>
                      </div>
                    ))} 
                    <div className="mt-2 flex space-x-2">
                    <form key={`form-${list.id}`} onSubmit={(e) => { e.preventDefault(); addItem(list.id, newItems[list.id]); }}>
                      <Input
                        placeholder="New Item"
                        value={newItems[list.id] || ""}
                        onChange={(e) => setNewItems({ ...newItems, [list.id]: e.target.value })}
                      />
                      <Button type="submit">Add</Button>
                    </form>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
          <form onSubmit={(e) => { e.preventDefault(); addList(); }}>
            <Input placeholder="New List Name" value={newList} onChange={(e) => setNewList(e.target.value)} />
            <Button onClick={addList}>Add</Button>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}