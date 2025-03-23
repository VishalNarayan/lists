"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/firebase";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import 'react-phone-number-input/style.css'
import { redirect } from "next/navigation";

export default function Login() {

  const [step, setStep] = useState("enterPhone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

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
    let redirectPath = "";

    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Generate token
      const res = await fetch("/api/generate-token", {
        method: "POST",
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json();
      if (data.success) {
        console.log(`Successfully logged in ${phone} with auth token.`);
        redirectPath = "/";
      }
    } catch (error) {
      console.log("Error verifying OTP:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      if (redirectPath) {
        redirect(redirectPath);
      }
    }
  }

  return (
    <div>
      <h1> Login Page </h1>
      {step === "enterPhone" ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
            <PhoneInputWithCountrySelect
              placeholder="Enter phone number"
              defaultCountry="US"
              value={phone}
              onChange={(e) => { if (e) setPhone(e) }} />
            <Button type="submit">Send Verification</Button>
          </form>
          <div id="recaptcha-container"></div>
        </>
      ) : (
        <>
          <form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
            <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button type="submit">Verify OTP</Button>
          </form>
        </>
      )}
    </div>
  )
}