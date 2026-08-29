# 🏛️ Labour Mitra Enterprise OS
### Industrial Manpower Supply, Statutory Compliance & Payout Gateway

**Labour Mitra** औद्योगिक ठेकेदारों (Industrial Contractors), साइट सुपरवाइज़रों (Supervisors) और प्लांट प्रबंधन (Principal Employer / Plant HR) के लिए तैयार किया गया वेब-आधारित एंटरप्राइज ऑपरेटिंग सिस्टम है।

---

## 📁 प्रोजेक्ट फ़ाइल स्ट्रक्चर (Project Architecture)

* **`index.html`** - मुख्य यूज़र इंटरफ़ेस (UI Structure, Modals, Action Panels)
* **`css.html`** - कस्टम थीम्स, ग्रिड्स, और स्क्रॉलबार्स की CSS स्टाइल्स
* **`java.html`** - मुख्य जावास्क्रिप्ट व Firebase डेटाबेस सिंक लॉजिक (Android Java Compatible)
* **`ER ARUN BANJARE.jpg`** - डेवलपर प्रोफ़ाइल इमेज
* **`README.md`** - सिस्टम गाइड व डॉक्यूमेंटेशन

---

## 🚀 मुख्य खूबियाँ एवं कार्यप्रणाली (Key Modules)

1. **3-स्तरीय वेतन व मस्टर रिपोर्टिंग इंजन (3-Sheet Engine):**
   * **फ़ाइल 1 (शुद्ध हाज़िरी रजिस्टर):** 1 से 31 तारीख तक की शुद्ध P/HD/A हाज़िरी और कुल OT घंटे।
   * **फ़ाइल 2 (सरकारी वैधानिक बिल):** सकल वेतन, 12% PF एवं 0.75% ESIC कटौती और बैंक विवरण।
   * **फ़ाइल 3 (निजी हिसाब-किताब):** ग्रॉस वेतन में से PF/ESIC और एडवांस कटौती के बाद शुद्ध इन-हैंड पेआउट लेजर।

2. **बैंक पेमेंट एवं अथॉरिटी लेटर डेस्क:**
   * चेक नंबर और भुगतान दिनांक दर्ज करते ही बैंक शाखा प्रबंधक के नाम द्विभाषी (हिन्दी एवं अंग्रेज़ी) आधिकारिक पत्र तैयार करना।
   * **1-क्लिक डाउनलोड:** हिन्दी प्रिंट पत्र, PDF (English), MS Word (`.doc`), एवं Excel CSV।

3. **लेबर ऑनबोर्डिंग एवं वैधानिक रिकॉर्ड्स:**
   * मज़दूर का नाम, बायोमेट्रिक पंचिंग नंबर, दैनिक वेतन, और ट्रेड।
   * **आधार नंबर (12 अंक)**, **EPFO / UAN नंबर (12 अंक)**, एवं **स्थायी पता (Address)** की सुरक्षित डेटाबेस एंट्री।
   * **1-क्लिक WhatsApp Payslip:** सीधे मज़दूर के मोबाइल पर मासिक वेतन विवरण भेजना।

4. **सुपरवाइज़र मोबाइल टर्मिनल एवं ऑफलाइन सिंक:**
   * साइट पर इंटरनेट न होने पर भी हाज़िरी व OT दर्ज करना।
   * नेटवर्क आते ही Firebase Realtime Database से ऑटो-सिंक (Path-based Concurrency Protected)।

5. **प्लांट एडमिन मास्टर कंट्रोल:**
   * नए ठेकेदार फ़र्म का रजिस्ट्रेशन।
   * **स्मार्ट ठेकेदार डिलीट व माइग्रेशन:** ठेकेदार हटाने पर डेटा नष्ट करने या अन्य ठेकेदार में सारा लेबर/सुपरवाइज़र ट्रांसफर करने की सुविधा।

---

## 🛠️ उपयोग की गई तकनीकें (Tech Stack)
* **Frontend:** HTML5, Tailwind CSS, Lucide Icons
* **Database & Auth:** Google Firebase Realtime Database & Firebase Auth (v9 Compat)
* **Document Engine:** jsPDF, AutoTable Plugin, MS Word Blob Export, Pure CSV Generation

---
**Designed & Developed by Er Arun Banjare**  
*Mahasamund, Chhattisgarh*
