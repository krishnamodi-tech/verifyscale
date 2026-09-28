# VerifyScale - Online Verification System for Weighing & Measuring Instruments

**Smart India Hackathon 2026**  
**Problem Statement ID:** SIH26036  
**Theme:** Miscellaneous | **Category:** Software  
**Team Name:** NEXUS NOVA  

---

## 🌟 Executive Summary
**VerifyScale** transforms the manual, fraud-prone inspection of commercial weighing scales into an automated, contactless, cryptographically verifiable digital metrology ecosystem.

Built specifically in accordance with:
- **The Legal Metrology Act, 2009** (Govt. of India)
- **NIST Handbook 44** (Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices)
- **OIML R76** (Non-automatic Weighing Instruments International Standards)
- **BIPM International Metrology Standards**

---

## 🚀 How to Run the Prototype

### Method 1: 1-Click Windows Launcher
Double-click `start_prototype.bat` inside this directory. It will start a local HTTP server and automatically open the prototype in your default web browser.

### Method 2: Command Line (Python)
```powershell
python server.py
```
Then visit `http://localhost:8000` in your browser.

### Method 3: Direct Browser Launch
Simply double click `index.html` to open directly in Google Chrome, Microsoft Edge, Brave, or Firefox.

---

## 🎯 Live Demonstration Guide for SIH Judges

When pitching your project to SIH judges, follow this sequence:

| Step | Portal View | What to Demo to Judges | PPT Slide Alignment |
|---|---|---|---|
| **1** | **Merchant Application** | Show how a merchant (grocery shop, jeweller, grain mandi) enters scale specifications (Class I-IV, Division $e$, serial number), views the statutory Legal Metrology fee (₹350), and clicks **Pay Verification Fee**. Demo the **Razorpay checkout modal** with instant treasury challan generation. | **Slide 2 & Slide 3** |
| **2** | **Field Inspector Workbench** | Show the geo-routed inspection queue. Click on the **100g, 500g, 1kg, 5kg calibrated weights** to place them on the scale pan! Watch the **LCD digital readout** flutter and settle with realistic sensor physics. Click the 4 quadrants to test eccentric load distribution. Click **Calculate NIST MPE Tolerance** to demonstrate automated compliance. Click **AI Vision Scanner** to demo automated lead seal and display segment inspection. | **Slide 2, Slide 3 & Slide 4** |
| **3** | **Holographic Certificate** | Move your mouse across the certificate to show the **dynamic 3D holographic tilt** and shimmering rainbow diffraction foil. Explain how the dynamic **SHA-256 cryptographic hash** prevents physical certificate counterfeiting. Show the **Print / PDF export** mode. | **Slide 2 & Slide 3** |
| **4** | **Public Citizen Verification** | Show how any shopper in a marketplace can use their smartphone camera to scan the scale's QR code. Click the **Demo Store Scan Chips** to show a genuine certified scale vs. a fraudulent/unregistered scale. Open the **Whistleblower Form** to demonstrate immediate complaint lodging with geo-tagging. | **Slide 2 & Slide 5** |
| **5** | **Department Command Center** | Present the nationwide metrics: Active Scales (48,290), Compliance Rate (97.4%), Revenue Collected (₹1.68 Cr), District Compliance Breakdown table, and the real-time **SHA-256 Audit Trail Stream**. | **Slide 2 & Slide 5** |

---

## 🛠️ Architecture & Tech Stack (From PPT)

- **Frontend & Physics:** Modern Glassmorphism, CSS 3D Transforms, Web Audio API Sound Synthesizer, HTML5 Canvas, Responsive Grid.
- **Security & Integrity:** SHA-256 Cryptographic Hash Seal, Dynamic SVG QR Engine, Tamper-proof PKI Verification.
- **Standards & Tolerance Engine:** NIST Handbook 44 Class I-IV MPE tolerance tables, OIML R76 repeatability and eccentricity equations.
- **Integrations Simulated:** Razorpay Payment Gateway, Gemini AI Vision OCR & Wire Seal Inspection, Geo-Routing Engine.

---

## ⚖️ Standards Reference
- **NIST Handbook 44:** Specifications, tolerances, and technical requirements for weighing and measuring devices.
- **BIPM (Bureau International des Poids et Mesures):** Digital calibration protocols for uniform measurement standards.
- **OIML Bulletin:** International Legal Metrology recommendations for digital scale verification.

---
*Created with pride by Team NEXUS NOVA for Smart India Hackathon 2026.*
