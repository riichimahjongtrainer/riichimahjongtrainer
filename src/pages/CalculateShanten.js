import { useState } from "react";

// 將手牌轉換為 tiles34Arr 格式
const convertToTiles34Arr = (handTiles) => {
    const tiles34Arr = new Array(34).fill(0);

    handTiles.forEach((tile) => {
        const num = tile.replace(/\D/g, "");
        const type = tile.slice(-1);
        let index;

        if (type === "m") {
            index = num === "0" ? 4 : parseInt(num, 10) - 1;
        } else if (type === "p") {
            index = 9 + (num === "0" ? 4 : parseInt(num, 10) - 1);
        } else if (type === "s") {
            index = 18 + (num === "0" ? 4 : parseInt(num, 10) - 1);
        } else if (type === "z") {
            index = 27 + (parseInt(num, 10) - 1);
        }

        if (index !== undefined) {
            tiles34Arr[index]++;
        }
    });

    return tiles34Arr;
};

// 計算向聽數
const calculateShanten = (tiles34Arr) => {
    const Shanten = require("../tools/Shanten");
    const shanten = new Shanten();
    return shanten.calculateShanten(tiles34Arr);
};

// 分析進張
const analyzeImprovement = (currentHand, currentTiles34) => {
    const results = {};
    const allTiles = generateTiles();
    const initialCountMap = allTiles.reduce((acc, tile) => {
        acc[tile] = (acc[tile] || 0) + 1;
        return acc;
    }, {});

    // 扣除已使用牌
    const usedTiles = [...currentHand];
    usedTiles.forEach((tile) => {
        initialCountMap[tile] = (initialCountMap[tile] || 0) - 1;
    });

    // 主分析邏輯
    currentHand.forEach((tileToDiscard, discardIndex) => {
        const newHand = currentHand.filter((_, i) => i !== discardIndex);
        const newTiles34 = convertToTiles34Arr(newHand);
        const originalShanten = calculateShanten(currentTiles34);

        const improvements = {};
        let totalCount = 0;

        Object.keys(initialCountMap).forEach((tile) => {
            if (initialCountMap[tile] <= 0) return;

            // 模擬摸牌
            const tempHand = [...newHand, tile];
            const tempTiles34 = convertToTiles34Arr(tempHand);
            const newShanten = calculateShanten(tempTiles34);

            if (newShanten < originalShanten) {
                const count = initialCountMap[tile];

                if (count > 0) {
                    improvements[tile] = count;
                    totalCount += count;
                }
            }
        });

        if (Object.keys(improvements).length > 0) {
            results[tileToDiscard] = {
                improvements,
                totalCount,
            };
        }
    });

    return results;
};

const generateTiles = () => {
    const types = ["m", "p", "s"];
    const tiles = [];

    // 處理數牌 (m/p/s)
    types.forEach((type) => {
        for (let num = 1; num <= 9; num++) {
            if (num === 5) {
                // 添加三張正常5和一個赤寶牌
                tiles.push(...Array(3).fill(`${num}${type}`));
                tiles.push(`0${type}`);
            } else {
                tiles.push(...Array(4).fill(`${num}${type}`));
            }
        }
    });

    // 處理字牌 (z)
    for (let num = 1; num <= 7; num++) {
        tiles.push(...Array(4).fill(`${num}z`));
    }

    return tiles;
};

const sortTiles = (tiles) => {
    const typeOrder = { m: 0, p: 1, s: 2, z: 3 };

    return [...tiles].sort((a, b) => {
        const aType = a.slice(-1);
        const aNum = a.replace(/\D/g, "");
        const aSortNum = aNum === "0" ? 5.5 : parseInt(aNum, 10);

        const bType = b.slice(-1);
        const bNum = b.replace(/\D/g, "");
        const bSortNum = bNum === "0" ? 5.5 : parseInt(bNum, 10);

        if (typeOrder[aType] !== typeOrder[bType]) {
            return typeOrder[aType] - typeOrder[bType];
        }
        return aSortNum - bSortNum;
    });
};

function EfficiencyTrainer() {
    const [handTiles, setHandTiles] = useState([]);
    const [tilesStr, setTilesStr] = useState(null);
    const [shantenNum, setShantenNum] = useState(null);
    const [improvementResults, setImprovementResults] = useState({});
    const [isCalculating, setIsCalculating] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleInputChange = (e) => {
        const input = e.target.value;

        setHandTiles([]);
        setShantenNum(null);
        setImprovementResults({});
        setErrorMessage(null);
        setTilesStr(input);

        // 使用正則表達式解析手牌，這會把每張牌視為數字+牌種的組合
        const tiles = input.match(/(\d+)([mpsz])/g) || [];

        const handTiles = [];

        // 將每一組牌拆解成單獨的每張牌
        tiles.forEach((tile) => {
            const [_, numbers, type] = tile.match(/(\d+)([mpsz])/);

            // 根據數字部分來處理每張牌
            for (let i = 0; i < numbers.length; i++) {
                handTiles.push(`${numbers[i]}${type}`);
            }
        });

        // 如果牌數不為14張，顯示錯誤訊息
        if (handTiles.length < 14) {
            setErrorMessage("手牌少於 14 張");
            return;
        } else if (handTiles.length > 14) {
            setErrorMessage("手牌多於 14 張");
            return;
        }

        setHandTiles(sortTiles(handTiles));

        // 計算向聽數
        const tiles34Arr = convertToTiles34Arr(handTiles);
        const shanten = calculateShanten(tiles34Arr);
        setShantenNum(shanten);

        // 開始進行進張分析
        setIsCalculating(true);
        const results = analyzeImprovement(handTiles, tiles34Arr);
        setImprovementResults(results);
        setIsCalculating(false);
    };

    const ResultDisplay = ({ results }) => {
        const sortedResults = Object.entries(results)
            .map(([discarded, data]) => ({ discarded, data }))
            .sort((a, b) => b.data.totalCount - a.data.totalCount);

        return (
            <div
                style={{
                    padding: "10px",
                    border: "1px solid",
                    borderColor: "#888888",
                    borderRadius: "5px",
                    backgroundColor: "#FDFDFD",
                    marginTop: "30px",
                }}
            >
                <div style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
                    {shantenNum === -1 ? null : shantenNum === 0 ? <div>聽牌列表</div> : <div>進張列表</div>}
                </div>

                {sortedResults.map(({ discarded, data }) => (
                    <div key={discarded} style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ fontWeight: "bold", marginRight: "5px", marginBottom: "22px" }}>切</div>
                            <img src={`${process.env.PUBLIC_URL}/images/${discarded}.png`} alt={discarded} style={{ width: "30px", height: "auto", marginBottom: "22px", marginRight: "10px" }} />
                            <div style={{ fontWeight: "bold", marginRight: "5px", marginBottom: "22px" }}>{shantenNum === 0 ? <div>聽</div> : <div>摸</div>}</div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0px" }}>
                                {Object.entries(data.improvements).map(([tile, count]) => (
                                    <div key={tile} style={{ textAlign: "center" }}>
                                        <img src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "30px", height: "auto" }} />
                                        <div style={{ fontSize: "14px" }}>×{count}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", marginLeft: "10px", marginRight: "5px", marginBottom: "22px" }}>{data.totalCount}張</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container" style={{ maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>手牌進張數計算</div>

            <div style={{ marginTop: "20px" }}>
                <input
                    type="text"
                    value={tilesStr}
                    onChange={handleInputChange}
                    placeholder="輸入手牌14張，例如：123m456s789p1234z0m"
                    style={{
                        width: "350px",
                        padding: "10px",
                        border: "2px solid #000000",
                        borderRadius: "5px",
                        fontSize: "16px",
                        outline: "none",
                    }}
                />
            </div>

            {errorMessage !== null && <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", color: "#FF0000" }}>{errorMessage}</div>}

            {shantenNum !== null && (
                <div style={{ fontSize: "20px", marginTop: "20px", textAlign: "center" }}>
                    {shantenNum === -1 ? (
                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                background: "#FF0000",
                                padding: "7px 15px",
                                borderRadius: "10px",
                                display: "inline-block",
                            }}
                        >
                            和牌!!
                        </div>
                    ) : shantenNum === 0 ? (
                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                background: "#007BFF",
                                padding: "7px 15px",
                                borderRadius: "10px",
                                display: "inline-block",
                            }}
                        >
                            聽牌
                        </div>
                    ) : (
                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                background: "#777777",
                                padding: "7px 15px",
                                borderRadius: "10px",
                                display: "inline-block",
                            }}
                        >
                            {shantenNum} 向聽
                        </div>
                    )}
                </div>
            )}

            <div className="hand-tiles" style={{ display: "flex", flexWrap: "wrap", gap: "0px", marginTop: "10px" }}>
                {handTiles.map((tile, index) => (
                    <img
                        key={`${tile}-${index}`}
                        src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                        alt={tile}
                        style={{
                            width: "7%",
                            maxWidth: "50px",
                            height: "auto",
                            borderRadius: "5px",
                            transition: "all 0.2s ease",
                        }}
                    />
                ))}
            </div>

            {isCalculating ? <div>計算中...</div> : improvementResults && Object.keys(improvementResults).length > 0 ? <ResultDisplay results={improvementResults} /> : null}
        </div>
    );
}

export default EfficiencyTrainer;
