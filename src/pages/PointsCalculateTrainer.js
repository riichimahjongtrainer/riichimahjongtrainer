import { useEffect, useState } from "react";

// 計算點數
const calculatePoints = (isDealer, isTsumo, han, fu) => {
    let basePoints;

    // 根據飜數計算基本點數
    if (han >= 13) {
        basePoints = 8000; // 役滿（13飜以上）
    } else if (han >= 11) {
        basePoints = 6000; // 三倍滿（11-12飜）
    } else if (han >= 8) {
        basePoints = 4000; // 倍滿（8-10飜）
    } else if (han >= 6) {
        basePoints = 3000; // 跳滿（6-7飜）
    } else if (han >= 5) {
        basePoints = 2000; // 滿貫（5飜）
    } else {
        // 當飜數低於5飜時，根據符數計算基本點數
        let tempBasePoints = fu * Math.pow(2, han + 2);
        if (tempBasePoints >= 2000) {
            basePoints = 2000;
        } else {
            basePoints = tempBasePoints;
        }
    }

    // 正常處理自摸或榮和情況
    if (isDealer) {
        if (isTsumo) {
            const points = Math.ceil((basePoints * 2) / 100) * 100;
            return { tsumo: points, ron: null };
        } else {
            // 莊家榮和：六倍分數
            const points = Math.ceil((basePoints * 6) / 100) * 100;
            return { tsumo: null, ron: points };
        }
    } else {
        if (isTsumo) {
            // 子家自摸：莊家支付兩倍分數，其他子家支付一次
            const dealerPoints = Math.ceil((basePoints * 2) / 100) * 100;
            const nonDealerPoints = Math.ceil(basePoints / 100) * 100;
            return { tsumo: { dealer: dealerPoints, nonDealer: nonDealerPoints }, ron: null };
        } else {
            // 子家榮和：四倍分數
            const points = Math.ceil((basePoints * 4) / 100) * 100;
            return { tsumo: null, ron: points };
        }
    }
};

// 隨機生成問題（整合七對子邏輯）
const generateQuestion = () => {
    let isDealer = Math.random() < 0.5;
    let isTsumo = Math.random() < 0.5;

    // 10% 概率生成七對子問題
    let isChiitoitsu = Math.random() < 0.1;

    // 20% 機率生成大於4飜的問題
    let isMangan = Math.random() < 0.2;

    let han, fu;

    if (isChiitoitsu) {
        if (isTsumo) {
            if (isMangan) {
                han = Math.floor(Math.random() * 9) + 5; // 5~13
            } else {
                han = Math.floor(Math.random() * 2) + 3; // 3~4
            }
        } else {
            if (isMangan) {
                han = Math.floor(Math.random() * 9) + 5; // 5~13
            } else {
                han = Math.floor(Math.random() * 3) + 2; // 2~4
            }
        }
        fu = 25;
    } else {
        fu = Math.floor(Math.random() * 10) * 10 + 20;

        if (fu === 20) {
            isTsumo = true;
            if (isMangan) {
                han = Math.floor(Math.random() * 9) + 5; // 5~13
            } else {
                han = Math.floor(Math.random() * 3) + 2; // 2~4
            }
        } else if (fu === 30) {
            if (isMangan) {
                han = Math.floor(Math.random() * 9) + 5; // 5~13
            } else {
                han = Math.floor(Math.random() * 4) + 1; // 1~4
            }
        } else if (fu === 40 || fu === 50 || fu === 60) {
            if (isMangan) {
                han = Math.floor(Math.random() * 10) + 4; // 4~13
            } else {
                han = Math.floor(Math.random() * 3) + 1; // 1~3
            }
        } else if (fu === 70 || fu === 80 || fu === 90 || fu === 100) {
            if (isMangan) {
                han = Math.floor(Math.random() * 11) + 3; // 3~13
            } else {
                han = Math.floor(Math.random() * 2) + 1; // 1~2
            }
        } else if (fu === 110) {
            if (isTsumo) {
                if (isMangan) {
                    han = Math.floor(Math.random() * 11) + 3; // 3~13
                } else {
                    han = 2; // 2
                }
            } else {
                if (isMangan) {
                    han = Math.floor(Math.random() * 11) + 3; // 3~13
                } else {
                    han = Math.floor(Math.random() * 2) + 1; // 1~2
                }
            }
        } else {
            han = Math.floor(Math.random() * 13) + 1; // 1~13
        }
    }

    const correctPoints = calculatePoints(isDealer, isTsumo, han, fu);

    return {
        isDealer,
        isTsumo,
        han,
        fu,
        isChiitoitsu, // 標記是否為七對子
        correctPoints,
    };
};

function MahjongPointCalculator() {
    const [question, setQuestion] = useState(null);
    const [userInput, setUserInput] = useState({ dealer: "", nonDealer: "" });
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isTable, setIsTable] = useState(false);

    // 初始化問題
    useEffect(() => {
        setQuestion(generateQuestion());
    }, []);

    // 處理使用者輸入
    const handleInputChange = (e, field) => {
        setUserInput({ ...userInput, [field]: e.target.value });
    };

    // 檢查答案
    const checkAnswer = () => {
        const { correctPoints } = question;
        const { dealer, nonDealer } = userInput;

        console.log(correctPoints);
        console.log(userInput);

        let isCorrect = false;

        // 根據問題類型檢查答案
        if (question.isDealer) {
            if (question.isTsumo) {
                isCorrect = parseInt(dealer) === correctPoints.tsumo;
            } else {
                isCorrect = parseInt(nonDealer) === correctPoints.ron;
            }
        } else {
            if (question.isTsumo) {
                isCorrect = parseInt(dealer) === correctPoints.tsumo.dealer && parseInt(nonDealer) === correctPoints.tsumo.nonDealer;
            } else {
                isCorrect = parseInt(nonDealer) === correctPoints.ron;
            }
        }

        setIsCorrect(isCorrect);
        setShowResult(true);
    };

    // 重置問題
    const resetQuestion = () => {
        setQuestion(generateQuestion());
        setUserInput({ dealer: "", nonDealer: "" });
        setIsCorrect(null);
        setShowResult(false);
    };

    const getBackgroundColor = (points) => {
        switch (points) {
            case 4000:
                return "#BBFFEE";
            case 6000:
                return "#CCFF99";
            case 8000:
                return "#FFFFBB";
            case 12000:
                return "#FFDDAA";
            case 16000:
                return "#FFCCCC";
            default:
                return "#EEEEEE";
        }
    };

    if (!question) return <div>Loading...</div>;

    // 生成莊家和子家的點數表格
    const generatePointsTable = () => {
        const dealerTableRows = [];
        const nonDealerTableRows = [];
        const hanList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 飜數1-13
        const fuList = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]; // 符數20-110

        for (let han of hanList) {
            const dealerRow = [];
            const nonDealerRow = [];

            dealerRow.push(
                <td key={`dealer-han-${han}`} style={{ padding: "5px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", display: "inline" }}>{han}飜</div>
                    {han === 13 && <div style={{ fontSize: "16px", fontWeight: "bold", display: "inline" }}>+</div>}
                </td>
            );
            nonDealerRow.push(
                <td key={`non-dealer-han-${han}`} style={{ padding: "5px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", display: "inline" }}>{han}飜</div>
                    {han === 13 && <div style={{ fontSize: "16px", fontWeight: "bold", display: "inline" }}>+</div>}
                </td>
            );

            for (let fu of fuList) {
                const dealerPointsTsumo = calculatePoints(true, true, han, fu);
                const nonDealerPointsTsumo = calculatePoints(false, true, han, fu);
                const dealerPointsRon = calculatePoints(true, false, han, fu);
                const nonDealerPointsRon = calculatePoints(false, false, han, fu);

                if ((han === 1 && fu === 20) || (han === 1 && fu === 25)) {
                    dealerRow.push(
                        <td key={`dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>-</div>
                        </td>
                    );
                    nonDealerRow.push(
                        <td key={`non-dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>-</div>
                        </td>
                    );
                } else if (han === 1 && fu === 110) {
                    dealerRow.push(
                        <td key={`dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{dealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>(-)</div>
                        </td>
                    );

                    nonDealerRow.push(
                        <td key={`non-dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{nonDealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>(-)</div>
                        </td>
                    );
                } else if (han >= 2 && fu === 20) {
                    dealerRow.push(
                        <td key={`dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>-</div>
                            <div style={{ fontSize: "14px" }}>({dealerPointsTsumo.tsumo} ALL)</div>
                        </td>
                    );

                    nonDealerRow.push(
                        <td key={`non-dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>-</div>
                            <div style={{ fontSize: "14px" }}>
                                ({nonDealerPointsTsumo.tsumo.nonDealer} / {nonDealerPointsTsumo.tsumo.dealer})
                            </div>
                        </td>
                    );
                } else if (han === 2 && fu === 25) {
                    dealerRow.push(
                        <td key={`dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{dealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>(-)</div>
                        </td>
                    );

                    nonDealerRow.push(
                        <td key={`non-dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{nonDealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>(-)</div>
                        </td>
                    );
                } else {
                    dealerRow.push(
                        <td key={`dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{dealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>({dealerPointsTsumo.tsumo} ALL)</div>
                        </td>
                    );

                    nonDealerRow.push(
                        <td key={`non-dealer-${han}-${fu}`} style={{ padding: "5px", backgroundColor: getBackgroundColor(dealerPointsTsumo.tsumo) }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{nonDealerPointsRon.ron}</div>
                            <div style={{ fontSize: "14px" }}>
                                ({nonDealerPointsTsumo.tsumo.nonDealer} / {nonDealerPointsTsumo.tsumo.dealer})
                            </div>
                        </td>
                    );
                }
            }

            dealerTableRows.push(<tr key={`dealer-${han}`}>{dealerRow}</tr>);
            nonDealerTableRows.push(<tr key={`non-dealer-${han}`}>{nonDealerRow}</tr>);
        }

        return { dealerTableRows, nonDealerTableRows };
    };

    const { dealerTableRows, nonDealerTableRows } = generatePointsTable();

    return (
        <div style={{ maxWidth: "100%", margin: "0 auto", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>點數計算練習</div>

            {/* 問題展示 */}
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div style={{ fontSize: "clamp(20px, 2vw, 24px)", fontWeight: "bold" }}>
                    {question.isDealer ? "莊家" : "子家"} {question.isTsumo ? "自摸" : "榮和"} {question.han} 飜 {question.fu} 符
                </div>
            </div>

            {/* 輸入區域 */}
            <div style={{ marginBottom: "20px" }}>
                {question.isDealer ? (
                    question.isTsumo ? (
                        <div>
                            <label style={{ fontSize: "20px" }}>
                                <input
                                    type="number"
                                    value={userInput.dealer}
                                    onChange={(e) => handleInputChange(e, "dealer")}
                                    style={{
                                        width: "100px",
                                        padding: "5px",
                                        border: "2px solid #000000",
                                        borderRadius: "5px",
                                        fontSize: "20px",
                                        outline: "none",
                                        marginRight: "10px",
                                    }}
                                />
                                點 ALL
                            </label>
                        </div>
                    ) : (
                        <div>
                            <label style={{ fontSize: "20px" }}>
                                <input
                                    type="number"
                                    value={userInput.nonDealer}
                                    onChange={(e) => handleInputChange(e, "nonDealer")}
                                    style={{
                                        width: "100px",
                                        padding: "5px",
                                        border: "2px solid #000000",
                                        borderRadius: "5px",
                                        fontSize: "20px",
                                        outline: "none",
                                        marginRight: "10px",
                                    }}
                                />
                                點
                            </label>
                        </div>
                    )
                ) : question.isTsumo ? (
                    <div>
                        <label style={{ fontSize: "20px" }}>
                            <input
                                type="number"
                                value={userInput.nonDealer}
                                onChange={(e) => handleInputChange(e, "nonDealer")}
                                placeholder="其他子家"
                                style={{
                                    width: "100px",
                                    padding: "5px",
                                    border: "2px solid #000000",
                                    borderRadius: "5px",
                                    fontSize: "20px",
                                    outline: "none",
                                    marginRight: "10px",
                                }}
                            />
                            點 /
                            <input
                                type="number"
                                value={userInput.dealer}
                                onChange={(e) => handleInputChange(e, "dealer")}
                                placeholder="莊家"
                                style={{
                                    width: "100px",
                                    padding: "5px",
                                    border: "2px solid #000000",
                                    borderRadius: "5px",
                                    fontSize: "20px",
                                    outline: "none",
                                    marginLeft: "10px",
                                    marginRight: "10px",
                                }}
                            />
                            點
                        </label>
                    </div>
                ) : (
                    <div>
                        <label style={{ fontSize: "20px" }}>
                            <input
                                type="number"
                                value={userInput.nonDealer}
                                onChange={(e) => handleInputChange(e, "nonDealer")}
                                style={{
                                    width: "100px",
                                    padding: "5px",
                                    border: "2px solid #000000",
                                    borderRadius: "5px",
                                    fontSize: "20px",
                                    outline: "none",
                                    marginRight: "10px",
                                }}
                            />
                            點
                        </label>
                    </div>
                )}
            </div>

            {/* 按鈕與結果 */}
            <div style={{ justifyContent: "center", margin: "10px 0", display: "flex", gap: "15px" }}>
                <button
                    onClick={checkAnswer}
                    style={{
                        padding: "7px 15px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                    }}
                >
                    提交答案
                </button>
                <button
                    onClick={resetQuestion}
                    style={{
                        padding: "7px 15px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                    }}
                >
                    下一題
                </button>
            </div>

            {showResult && (
                <div
                    style={{
                        margin: "20px 0",
                        padding: "10px 50px",
                        backgroundColor: isCorrect ? "#d4edda" : "#f8d7da",
                        border: `2px solid ${isCorrect ? "#28a745" : "#dc3545"}`,
                        borderRadius: "10px",
                        justifySelf: "center",
                    }}
                >
                    <div style={{ color: isCorrect ? "#28a745" : "#dc3545", fontWeight: "bold", fontSize: "20px" }}>{isCorrect ? "正確！" : "錯誤！"}</div>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <div style={{ fontWeight: "bold", fontSize: "20px" }}>正確答案：</div>
                        {question.isDealer && question.isTsumo && <div style={{ fontWeight: "bold", fontSize: "20px" }}>{question.correctPoints.tsumo} 點 ALL</div>}
                        {question.isDealer && !question.isTsumo && <div style={{ fontWeight: "bold", fontSize: "20px" }}>{question.correctPoints.ron} 點</div>}
                        {!question.isDealer && question.isTsumo && (
                            <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                                {question.correctPoints.tsumo.nonDealer} 點 / {question.correctPoints.tsumo.dealer} 點
                            </div>
                        )}
                        {!question.isDealer && !question.isTsumo && <div style={{ fontWeight: "bold", fontSize: "20px" }}>{question.correctPoints.ron} 點</div>}
                    </div>
                </div>
            )}

            <label>
                <input type="checkbox" checked={isTable} onChange={(e) => setIsTable(e.target.checked)} />
                顯示點數表
            </label>

            {/* 顯示表格 */}
            {isTable && (
                <div
                    style={{
                        maxWidth: "100%",
                        textAlign: "center",
                        overflow: "auto",
                    }}
                >
                    {/* 點數等級顏色標示 */}

                    <table border="1" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                        <tr>
                            <td colSpan={12}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0", gap: "15px", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "20px", height: "20px", background: "#BBFFEE", border: "3px solid #33FFFF", borderRadius: "5px", marginRight: "5px" }}></div>
                                        <span style={{ fontWeight: "bold" }}>滿貫</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "20px", height: "20px", background: "#CCFF99", border: "3px solid #99FF33", borderRadius: "5px", marginRight: "5px" }}></div>
                                        <span style={{ fontWeight: "bold" }}>跳滿</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "20px", height: "20px", background: "#FFFFBB", border: "3px solid #FFFF00", borderRadius: "5px", marginRight: "5px" }}></div>
                                        <span style={{ fontWeight: "bold" }}>倍滿</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "20px", height: "20px", background: "#FFDDAA", border: "3px solid #FFBB66", borderRadius: "5px", marginRight: "5px" }}></div>
                                        <span style={{ fontWeight: "bold" }}>三倍滿</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "20px", height: "20px", background: "#FFCCCC", border: "3px solid #FF8888", borderRadius: "5px", marginRight: "5px" }}></div>
                                        <span style={{ fontWeight: "bold" }}>役滿</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={12}>
                                <div style={{ fontSize: "20px", fontWeight: "bold", margin: "10px 0" }}>莊家點數表</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px" }}>
                                <div style={{ fontSize: "16px", fontWeight: "bold" }}>飜符數</div>
                            </td>
                            {["20", "25", "30", "40", "50", "60", "70", "80", "90", "100", "110"].map((fu, index) => (
                                <td key={fu} style={{ padding: "5px" }}>
                                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>{fu}符</div>
                                </td>
                            ))}
                        </tr>
                        {dealerTableRows}
                        <tr>
                            <td colSpan={12}>
                                <div style={{ fontSize: "20px", fontWeight: "bold", margin: "10px 0" }}>子家點數表</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "5px" }}>
                                <div style={{ fontSize: "16px", fontWeight: "bold" }}>飜符數</div>
                            </td>
                            {["20", "25", "30", "40", "50", "60", "70", "80", "90", "100", "110"].map((fu, index) => (
                                <td key={fu} style={{ padding: "5px" }}>
                                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>{fu}符</div>
                                </td>
                            ))}
                        </tr>
                        {nonDealerTableRows}
                    </table>
                </div>
            )}
        </div>
    );
}

export default MahjongPointCalculator;
