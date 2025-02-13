import { get, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userCountsRef } from "../firebase";

const pageLinks = [
    { path: "/calculate-shanten", title: "進張數計算", description: "手牌計算進張列表" },
    { path: "/efficiency-trainer", title: "牌效率何切", description: "最大進張切牌練習" },
    { path: "/pure-ones-efficiency-trainer", title: "清一色何切", description: "清一色最大進張切牌練習" },
    { path: "/pure-ones-ready-trainer", title: "清一色聽牌", description: "清一色手牌聽牌種類練習" },
    { path: "/points-calculate-trainer", title: "點數計算", description: "根據飜符數計算麻將點數" },
    { path: "/aotenjiuu-calculate-trainer", title: "青天井計算", description: "青天井規則的得點計算" },
    { path: "/fu-calculate-trainer", title: "符數計算", description: "根據和牌牌型計算符數" },
    { path: "/comments", title: "留言區", description: "看看其他人的留言" },
];

const MainPage = (props) => {
    const [userCounts, setUserCounts] = useState(null);

    // 讀取使用者數量
    useEffect(() => {
        get(userCountsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setUserCounts(snapshot.val() + 1);
                    set(userCountsRef, snapshot.val() + 1);
                } else {
                    console.log("使用者數量變數不存在");
                }
            })
            .catch((error) => {
                console.error("取得使用者數量失敗:", error);
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
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "15px",
                    justifyContent: "center",
                    marginTop: "20px",
                    gridAutoFlow: "row dense",
                }}
            >
                {pageLinks.map(({ path, title, description }, index) => {
                    const isLastSingle = pageLinks.length % 2 === 1 && index === pageLinks.length - 1;

                    return (
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
                                position: "relative",
                                gridColumn: isLastSingle ? "span 2" : "auto", // 讓最後單獨一個的元素佔滿兩格
                            }}
                        >
                            <div style={{ fontSize: "clamp(20px, 2vw, 24px)", fontWeight: "bold" }}>{title}</div>
                            {description && <p style={{ fontSize: "calc(0.8 * clamp(20px, 2vw, 24px))", fontWeight: "normal", margin: "10px 0 0" }}>{description}</p>}
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
                    );
                })}
            </div>

            {userCounts && <div style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: "bold", marginTop: "30px" }}>您是第 {userCounts} 個訪問本站的人</div>}
        </div>
    );
};

export default MainPage;
