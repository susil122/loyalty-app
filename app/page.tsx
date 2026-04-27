"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "./lib/supabase";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

function AppContent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [points, setPoints] = useState(0);

  const searchParams = useSearchParams();

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

  useEffect(() => {
    const phoneFromQR = searchParams.get("phone");

    if (phoneFromQR) {
      setPhone(phoneFromQR);
      fetchPoints(phoneFromQR);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      alert("Enter valid 10 digit phone");
      return;
    }

    const { data: existingUser } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .single();

    const now = new Date();

    if (existingUser) {
      const last = existingUser.last_stamp
        ? new Date(existingUser.last_stamp)
        : null;

      if (last && now.getTime() - last.getTime() < 10000) {
        alert("Wait 10 sec ⏳");
        return;
      }

      const newPoints = existingUser.points + 1;

      await supabase
        .from("customers")
        .update({
          points: newPoints,
          last_stamp: now.toISOString(),
        })
        .eq("phone", phone);

      setPoints(newPoints);
      alert(`Points: ${newPoints}`);
    } else {
      await supabase.from("customers").insert([
        {
          name,
          phone,
          points: 1,
          last_stamp: now.toISOString(),
        },
      ]);

      setPoints(1);
      alert("New user 🎉");
    }

    setName("");
  };

  const qrValue = `https://loyalty-app-rosy.vercel.app?phone=${phone}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
        
        <h1 className="text-2xl font-bold mb-4">Loyalty Card</h1>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                i < points ? "bg-yellow-100" : "bg-gray-100"
              }`}
            >
              {i < points ? "⭐" : ""}
            </div>
          ))}
        </div>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="tel"
          maxLength={10}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Enter Phone"
          value={phone}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value.length > 10) return;

            setPhone(value);

            if (value.length === 10) {
              fetchPoints(value);
            } else {
              setPoints(0);
            }
          }}
        />

        <button
          className="bg-black text-white px-4 py-2 w-full rounded mb-4"
          onClick={handleSubmit}
        >
          Add Stamp
        </button>

        {phone.length === 10 && (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">Scan QR</p>
            <QRCodeCanvas value={qrValue} size={150} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}