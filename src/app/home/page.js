"use client"
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";



export default function Home() {
  const router = useRouter();

  const logout = async () => {
    window.recaptchaVerifier = null;
    const res = await fetch("/api/logout", {
      method: 'GET'
    })

    if (res.ok) {
      router.replace('/');
    }
  }


  return (
    <div>
        <h1>Your Lists <Button onClick={logout} variant="secondary">Logout</Button></h1>
        <Dashboard />
    </div>
  )
}