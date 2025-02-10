import { get, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userCountsRef } from "../firebase";

const pageLinks = [
    { path: "/calculate-shanten", title: "進張數計算", description: "輸入手牌計算進張列表" },
    { path: "/efficiency-trainer", title: "牌效率何切", description: "最大進張數切牌練習" },
    { path: "/pure-ones-efficiency-trainer", title: "清一色何切", description: "清一色最大進張數切牌練習" },
    { path: "/pure-ones-ready-trainer", title: "清一色聽牌", description: "清一色手牌聽牌種類練習" },
    { path: "/points-calculate-trainer", title: "點數計算", description: "根據飜符數計算麻將點數" },
    { path: "/fu-calculate-trainer", title: "符數計算", description: "根據和牌牌型計算符數" },
];

const MainPage = () => {
    const [userCounts, setUserCounts] = useState(null);

    // 讀取使用者數量
    useEffect(() => {
        get(userCountsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setUserCounts(snapshot.val() + 1);
                    set(userCountsRef, snapshot.val() + 1);
                } else {
                    console.log("數據不存在");
                }
            })
            .catch((error) => {
                console.error("獲取數據失敗:", error);
            });
    }, []);

    // 預加載圖片
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/images.json`)
            .then((res) => res.json())
            .then((data) => {
                data.images.forEach((filename) => {
                    const img = new Image();
                    img.src = `${process.env.PUBLIC_URL}/images/${filename}`;

                    console.log(img.src);
                });
            });
    }, []);

    return (
        <div
            style={{
                textAlign: "center",
                maxWidth: "80%",
                margin: "auto", // 水平置中
                display: "flex", // 使用 Flexbox
                flexDirection: "column", // 讓內容垂直排列
                alignItems: "center", // 水平置中內容
                justifyContent: "center", // 垂直置中內容（如果有固定高度）
            }}
        >
            <div style={{ color: "#007BFF", fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>立直麻將練習網站</div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)", // 先預設為顯示 3 個元素
                    gap: "15px",
                    justifyContent: "center",
                    marginTop: "30px",
                }}
            >
                {pageLinks.map(({ path, title, description }) => (
                    <Link
                        key={path}
                        to={path}
                        style={{
                            textDecoration: "none",
                            padding: "15px",
                            borderRadius: "10px",
                            border: "1px solid #007BFF",
                            color: "#007BFF",
                            transition: "background-color 0.3s, color 0.3s",
                            display: "block",
                            backgroundColor: "#f8f9fa",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            position: "relative", // 讓 hover 偽元素對齊
                        }}
                    >
                        <div style={{ fontSize: "clamp(20px, 2vw, 24px)", fontWeight: "bold" }}>{title}</div>
                        <p style={{ fontSize: "calc(0.8 * clamp(20px, 2vw, 24px))", fontWeight: "normal", margin: "10px 0 0" }}>{description}</p>
                        <style>
                            {`
                                a:hover {
                                    background-color: #007BFF !important;
                                    color: #fff !important;
                                }
                                @media (max-width: 1024px) {
                                    div {
                                        grid-template-columns: repeat(2, 1fr);
                                    }
                                }
                                @media (max-width: 768px) {
                                    div {
                                        grid-template-columns: repeat(1, 1fr);
                                    }
                                }
                            `}
                        </style>
                    </Link>
                ))}
            </div>

            {userCounts && <div style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: "bold", marginTop: "30px" }}>您是第 {userCounts} 個訪問本站的人</div>}
        </div>
    );
};

export default MainPage;
