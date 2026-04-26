# 🚀 FestFlow | Ignovators Command Center

Real-time IoT Dashboard for large-scale event management and safety monitoring.

FestFlow is a high-performance, real-time command center designed by **Team Ignovators** to streamline event logistics and ensure attendee safety. By monitoring real-time vitals and geospatial data, it allows for instant response to critical incidents across multiple sectors.

- 📊 Real-time Monitoring: Live visualization of heart rate (BPM) and vital statistics.
- 📍 Sector Tracking: Geospatial localization across HQ, Alpha, Beta, and Delta zones.
- 🚨 Panic Alert Logic: Automated detection of vital anomalies with instant priority flagging.
- 🔌 Hardware Link: Seamless connection via the WebSerial API for direct monitoring.
- 💻 Live Data Stream: Raw serial telemetry for real-time debugging and auditing.

## 🛠️ System Architecture
The system utilizes a distributed sensing layer connected to a web-based command interface.
- **Hardware Integration**: ESP32 / Arduino based monitoring nodes.
- **Sensing Protocol**:
  - ❤️ Heart Rate Sensors: Pulse monitoring.
  - 📍 Localization Nodes: Zone-based tracking.
- **Communication**: WebSerial API (9600 Baud) for direct browser-to-hardware data transfer.
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6+).
- **Mapping**: Leaflet.js for real-time geospatial overlay.

## 💻 Tech Stack
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Cyber-Industrial UI with Glassmorphism and Neon accents.
- **Protocol**: WebSerial API.
- **Mapping Engine**: Leaflet.js.

## 🛠️ Setup & Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/AniruddhaMJois/festflow.git
   ```
2. **Open the dashboard**:
   Simply open `index.html` in any modern browser (Chrome/Edge recommended for WebSerial support).
3. **Hardware Connection**:
   - Connect your monitoring hardware.
   - Click **"LINK_HARDWARE"** on the dashboard.
   - Authorize the connection to start the data stream.

## 👨‍💻 Team IGNOVATORS
- **College**: Vidya Vardhaka College of Engineering (VVCE), Mysuru.
- **Project**: FestFlow Event Management System.

Built with ❤️ by **Team IGNOVATORS** at VVCE, Mysuru. Stay Safe. Stay Flowing. ⚡
