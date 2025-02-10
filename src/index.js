import React from "react";
import ReactDOM from "react-dom/client";
import { Link, Route, HashRouter as Router, Routes } from "react-router-dom";
import CalculateShanten from "./pages/CalculateShanten";
import EfficiencyTrainer from "./pages/EfficiencyTrainer";
import FuCalculateTrainer from "./pages/FuCalculateTrainer";
import MainPage from "./pages/MainPage";
import PointsCalculateTrainer from "./pages/PointsCalculateTrainer";
import PureOnesEfficiencyTrainer from "./pages/PureOnesEfficiencyTrainer";
import PureOnesReadyTrainer from "./pages/PureOnesReadyTrainer";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

const linkStyle = {
    textDecoration: "none",
    fontSize: "18px",
    color: "#007BFF",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: "5px",
    transition: "background-color 0.3s, color 0.3s",
};

const handleHover = (e, isHover) => {
    e.target.style.backgroundColor = isHover ? "#007BFF" : "transparent";
    e.target.style.color = isHover ? "#fff" : "#007BFF";
};

root.render(
    <React.StrictMode>
        <Router>
            <div>
                <nav
                    style={{
                        marginBottom: "20px",
                        padding: "10px",
                        borderRadius: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "10px",
                    }}
                >
                    <ul
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            listStyle: "none",
                            padding: "0",
                            margin: "0",
                            justifyContent: "center",
                            maxWidth: "100%",
                        }}
                    >
                        {["/", "/calculate-shanten", "/efficiency-trainer", "/pure-ones-efficiency-trainer", "/pure-ones-ready-trainer", "/points-calculate-trainer", "/fu-calculate-trainer"].map(
                            (path, index) => {
                                const pageTitles = ["主頁", "進張數計算", "牌效率何切", "清一色何切", "清一色聽牌", "點數計算", "符數計算"];
                                return (
                                    <li key={path}>
                                        <Link to={path} style={linkStyle} onMouseEnter={(e) => handleHover(e, true)} onMouseLeave={(e) => handleHover(e, false)}>
                                            {pageTitles[index]}
                                        </Link>
                                    </li>
                                );
                            }
                        )}
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/calculate-shanten" element={<CalculateShanten />} />
                    <Route path="/efficiency-trainer" element={<EfficiencyTrainer />} />
                    <Route path="/pure-ones-efficiency-trainer" element={<PureOnesEfficiencyTrainer />} />
                    <Route path="/pure-ones-ready-trainer" element={<PureOnesReadyTrainer />} />
                    <Route path="/points-calculate-trainer" element={<PointsCalculateTrainer />} />
                    <Route path="/fu-calculate-trainer" element={<FuCalculateTrainer />} />
                </Routes>
            </div>
        </Router>
    </React.StrictMode>
);

reportWebVitals();
