"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [points, setPoints] = useState(0);

  const searchParams = useSearchParams();

  // 🔥 Fetch points
  const fetchPoints = async (phoneNumber: string) => {
    if (!phoneNumber) return;

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phoneNumber)
      .single();

    if (data) {
      setPoints(data.points);
      setName(data.name);
    } else {
      setPoints(0);
    }
  };

  // 🔥 QR AUTO LOAD
  useEffect(() => {
    const phoneFromQR = searchParams.get("phone");

    if (phoneFromQR) {
      setPhone(phoneFromQR);
      fetchPoints(phoneFromQR);
    }
  }, []);

  const handleSubmit = async () => {
    const { data: existingUser, error } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error && error.code !== "PGRST116") {
      alert("Error");
      return;
    }

    if (existingUser) {
      const newPoints = existingUser.points + 1;

      await supabase
        .from("customers")
        .update({ points: newPoints })
        .eq("phone", phone);

      setPoints(newPoints);
      alert(`Points: ${newPoints}`);
    } else {
      await supabase.from("customers").insert([
        {
          name,
          phone,
          points: 1,
        },
      ]);

      setPoints(1);
      alert("New user added 🎉");
    }

    setName("");
    setPhone("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
        
        <h1 className="text-2xl font-bold mb-4">Loyalty Card</h1>

        {/* ⭐ Dynamic Stars */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl"
            >
              {i < points ? "⭐" : "⚪"}
            </div>
          ))}
        </div>

        {/* Name */}
        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Phone */}
        <input
          className="border p-2 w-full mb-4 rounded"
          placeholder="Enter Phone"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            setPhone(value);

            if (value.length === 10) {
              fetchPoints(value);
            }
          }}
        />

        <button
          className="bg-black text-white px-4 py-2 w-full rounded"
          onClick={handleSubmit}
        >
          Add Stamp
        </button>

      </div>
    </div>
  );
}