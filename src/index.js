import React from "react";
import ReactDOM from "react-dom/client";
import { Link, Route, HashRouter as Router, Routes } from "react-router-dom";
import AotenjiuuCalculateTrainer from "./pages/AotenjiuuCalculateTrainer";
import CalculateShanten from "./pages/CalculateShanten";
import CommentsPage from "./pages/CommentsPage";
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
    borderRadius: "5px",
    transition: "background-color 0.3s, color 0.3s",
    padding: "5px 10px",
};

const handleHover = (e, isHover) => {
    e.target.style.backgroundColor = isHover ? "#007BFF" : "transparent";
    e.target.style.color = isHover ? "#fff" : "#007BFF";
};

const App = () => {
    const pageTitles = ["首頁", "進張數計算", "牌效率何切", "清一色何切", "清一色聽牌", "點數計算", "青天井計算", "符數計算", "留言區"];

    return (
        <React.StrictMode>
            <Router>
                <div>
                    <nav
                        style={{
                            marginBottom: "10px",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "center", // 整體置中
                            alignItems: "center",
                            padding: "10px",
                        }}
                    >
                        <ul
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "5px 10px", // 控制按鈕間距
                                listStyle: "none",
                                justifyContent: "center", // 讓 `ul` 內的按鈕也置中
                                textAlign: "center",
                                alignItems: "center",
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            {[
                                "/",
                                "/calculate-shanten",
                                "/efficiency-trainer",
                                "/pure-ones-efficiency-trainer",
                                "/pure-ones-ready-trainer",
                                "/points-calculate-trainer",
                                "/aotenjiuu-calculate-trainer",
                                "/fu-calculate-trainer",
                                "/comments",
                            ].map((path, index) => (
                                <li key={path} style={{ display: "flex", alignItems: "center" }}>
                                    <Link to={path} style={linkStyle} onMouseEnter={(e) => handleHover(e, true)} onMouseLeave={(e) => handleHover(e, false)}>
                                        {pageTitles[index]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/calculate-shanten" element={<CalculateShanten />} />
                        <Route path="/efficiency-trainer" element={<EfficiencyTrainer />} />
                        <Route path="/pure-ones-efficiency-trainer" element={<PureOnesEfficiencyTrainer />} />
                        <Route path="/pure-ones-ready-trainer" element={<PureOnesReadyTrainer />} />
                        <Route path="/points-calculate-trainer" element={<PointsCalculateTrainer />} />
                        <Route path="/aotenjiuu-calculate-trainer" element={<AotenjiuuCalculateTrainer />} />
                        <Route path="/fu-calculate-trainer" element={<FuCalculateTrainer />} />
                        <Route path="/comments" element={<CommentsPage />} />
                    </Routes>
                </div>
            </Router>
        </React.StrictMode>
    );
};

root.render(<App />);

reportWebVitals();
