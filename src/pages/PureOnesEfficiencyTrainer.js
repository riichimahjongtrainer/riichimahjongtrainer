import { useEffect, useState } from "react";

const generateTiles = (type) => {
    const tiles = [];

    // 定義牌的範圍，萬子 "m"、索子 "s" 或 餅子 "p"
    const tileTypes = {
        m: "m", // 萬子
        s: "s", // 索子
        p: "p", // 餅子
    };

    // 根據傳入的 type，生成對應的牌山
    for (let num = 1; num <= 9; num++) {
        if (num === 5) {
            // 添加三張正常的5和一個赤寶牌
            tiles.push(...Array(3).fill(`${num}${tileTypes[type]}`));
            tiles.push(`0${tileTypes[type]}`);
        } else {
            tiles.push(...Array(4).fill(`${num}${tileTypes[type]}`));
        }
    }

    return tiles;
};

// Fisher-Yates 洗牌算法
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

// 排序函數
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

// 將手牌轉換為 tilesStr 格式（合併相同種類的牌）
const convertToTilesStr = (handTiles) => {
    const groupedTiles = { m: [], p: [], s: [], z: [] };

    handTiles.forEach((tile) => {
        const type = tile.slice(-1);
        const num = tile.replace(/\D/g, "");
        groupedTiles[type].push(num);
    });

    let result = "";
    Object.entries(groupedTiles).forEach(([type, nums]) => {
        if (nums.length > 0) {
            result += nums.sort((a, b) => (a === "0" ? 5 : a) - (b === "0" ? 5 : b)).join("") + type;
        }
    });

    return result;
};

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

// 統計牌山剩餘的牌，並按 m → p → s → z 排序
const countRemainingTiles = (tilesWall) => {
    const countMap = {};

    tilesWall.forEach((tile) => {
        if (!countMap[tile]) {
            countMap[tile] = 0;
        }
        countMap[tile]++;
    });

    // 按 m → p → s → z 排序
    const sortedTiles = Object.keys(countMap).sort((a, b) => {
        const typeOrder = { m: 0, p: 1, s: 2, z: 3 };
        const aType = a.slice(-1);
        const bType = b.slice(-1);
        const aNum = a.replace(/\D/g, "");
        const bNum = b.replace(/\D/g, "");

        if (typeOrder[aType] !== typeOrder[bType]) {
            return typeOrder[aType] - typeOrder[bType];
        }
        return (aNum === "0" ? 5 : aNum) - (bNum === "0" ? 5 : bNum);
    });

    const sortedCountMap = {};
    sortedTiles.forEach((tile) => {
        sortedCountMap[tile] = countMap[tile];
    });

    return sortedCountMap;
};

function PureOnesEfficiencyTrainer() {
    const [tilesWall, setTilesWall] = useState([]);
    const [handTiles, setHandTiles] = useState([]);
    const [discardedTiles, setDiscardedTiles] = useState([]);
    const [tilesStr, setTilesStr] = useState("");
    const [tiles34Arr, setTiles34Arr] = useState([]);
    const [remainingTilesCount, setRemainingTilesCount] = useState({});
    const [shantenNum, setShantenNum] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [improvementResults, setImprovementResults] = useState({});
    const [lastDiscardResult, setLastDiscardResult] = useState(null);
    const [discardAnsList, setDiscardAnsList] = useState([]);

    const [isCalculating, setIsCalculating] = useState(false);
    const [isDiscard, setIsDiscard] = useState(true);
    const [isShanten, setIsShanten] = useState(false);
    const [isCalculatedList, setIsCalculatingList] = useState(false);
    const [isTileWall, setIsTileWall] = useState(false);

    const [tileType, setTileType] = useState("m");

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        resetGame();
    }, [tileType]);

    const initializeGame = () => {
        const allTiles = generateTiles(tileType);
        shuffleArray(allTiles);

        const initialHand = allTiles.splice(0, 14);
        const sortedHand = sortTiles(initialHand.slice(0, 13));
        const newHandTiles = [...sortedHand, initialHand[13]];

        setHandTiles(newHandTiles);
        setTilesWall(allTiles);
        updateTilesState(newHandTiles);
        setRemainingTilesCount(countRemainingTiles(allTiles));
        calculateImprovements(newHandTiles, allTiles);
    };

    const updateTilesState = (handTiles) => {
        const newTilesStr = convertToTilesStr(handTiles);
        const newTiles34Arr = convertToTiles34Arr(handTiles);

        setTilesStr(newTilesStr);
        setTiles34Arr(newTiles34Arr);
        setShantenNum(calculateShanten(newTiles34Arr));
    };

    const handleTileClick = async (clickedTile, index) => {
        // 先取得當前分析結果用於判斷
        const currentResults = improvementResults;

        // 移除被點擊的牌
        const newHand = handTiles.filter((_, i) => i !== index);

        // 先判斷出牌選擇
        evaluateDiscardChoice(clickedTile, currentResults);

        // 更新已打出牌狀態
        setDiscardedTiles((prev) => [...prev, clickedTile]);

        if (tilesWall.length === 0) {
            setHandTiles(newHand);
            updateTilesState(newHand);
            return;
        }

        // 從牌山抽取新牌
        const [newTile, ...remainingTiles] = tilesWall;
        const sortedNewHand = sortTiles(newHand);
        const updatedHandTiles = [...sortedNewHand, newTile];

        // 更新手牌和牌山
        setHandTiles(updatedHandTiles);
        setTilesWall(remainingTiles);
        setRemainingTilesCount(countRemainingTiles(remainingTiles));
        updateTilesState(updatedHandTiles);

        // 計算新的分析結果
        const newResults = await calculateImprovements(updatedHandTiles, remainingTiles);
        setImprovementResults(newResults);
    };

    const evaluateDiscardChoice = (discardedTile, results) => {
        const maxCount = Math.max(...Object.values(results).map((d) => d.totalCount));

        if (!results[discardedTile]) {
            // 出牌不在改進列表中
            const bestChoices = Object.entries(results)
                .filter(([_, data]) => data.totalCount === Math.max(...Object.values(results).map((d) => d.totalCount)))
                .map(([tile]) => tile);

            setLastDiscardResult({
                type: "invalid",
                message: "錯誤！該次切牌退向聽",
                bestChoices,
                discardedTile,
                maxCount,
            });

            setDiscardAnsList([...discardAnsList, "invalid"]);

            return;
        } // 找出最大進張數

        const currentCount = results[discardedTile].totalCount;

        if (currentCount === maxCount) {
            // 最佳選擇
            const sameCountChoices = Object.entries(results)
                .filter(([_, data]) => data.totalCount === maxCount)
                .map(([tile]) => tile);

            setLastDiscardResult({
                type: "best",
                message: "正確！這是最多進張的選擇",
                sameCountChoices,
                discardedTile,
                maxCount,
            });

            setDiscardAnsList([...discardAnsList, "best"]);
        } else {
            // 非最佳選擇
            const bestChoices = Object.entries(results)
                .filter(([_, data]) => data.totalCount === maxCount)
                .map(([tile]) => tile);

            setLastDiscardResult({
                type: "suboptimal",
                message: "該次切牌並非最多進張",
                bestChoices,
                discardedTile,
                currentCount,
                maxCount,
            });

            setDiscardAnsList([...discardAnsList, "suboptimal"]);
        }
    };

    const handleTileHover = (index) => {
        setHoveredIndex(index);
    };

    const calculateShanten = (tiles34Arr) => {
        const Shanten = require("../tools/Shanten");
        const shanten = new Shanten();
        return shanten.calculateShanten(tiles34Arr);
    };

    const analyzeImprovement = (currentHand, currentTiles34, discardedTiles, tilesWall) => {
        const results = {};
        const allTiles = generateTiles(tileType);
        const initialCountMap = allTiles.reduce((acc, tile) => {
            acc[tile] = (acc[tile] || 0) + 1;
            return acc;
        }, {});

        // 扣除已使用牌
        const usedTiles = [...currentHand, ...discardedTiles];
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

    const calculateImprovements = async (currentHand, currentWall) => {
        setIsCalculating(true);
        const results = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(analyzeImprovement(currentHand, convertToTiles34Arr(currentHand), discardedTiles, currentWall));
            }, 0);
        });

        setImprovementResults(results);
        setIsCalculating(false);

        return results;
    };

    const ResultDisplay = ({ results }) => {
        const sortedResults = Object.entries(results)
            .map(([discarded, data]) => ({ discarded, data }))
            .sort((a, b) => b.data.totalCount - a.data.totalCount);

        return (
            <div style={{ marginTop: "20px" }}>
                {sortedResults.map(({ discarded, data }) => (
                    <div key={discarded} style={{ marginBottom: "5px" }}>
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

    const DiscardResultDisplay = ({ result }) => {
        if (!result) return null;

        return (
            <div
                style={{
                    marginTop: "10px",
                    padding: "15px",
                    border: "2px solid",
                    borderColor: result.type === "best" ? "#28a745" : result.type === "suboptimal" ? "#ffc107" : "#dc3545",
                    borderRadius: "5px",
                    backgroundColor: result.type === "best" ? "#d4edda" : result.type === "suboptimal" ? "#fff3cd" : "#f8d7da",
                }}
            >
                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>{result.message}</div>

                {result.type === "best" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img key={result.discardedTile} src={`${process.env.PUBLIC_URL}/images/${result.discardedTile}.png`} alt={result.discardedTile} style={{ width: "30px", height: "auto" }} />
                            <div style={{ fontSize: "16px", fontWeight: "bold", marginLeft: "10px" }}>{result.maxCount}張</div>
                        </div>

                        {sortTiles(result.sameCountChoices).length >= 2 && (
                            <>
                                <div style={{ marginBottom: "10px", marginTop: "10px" }}>其他最大進張數：</div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "1px",
                                        flexWrap: "wrap",
                                        justifyContent: "center", // 水平置中
                                        alignItems: "center", // 垂直置中
                                    }}
                                >
                                    {sortTiles(result.sameCountChoices)
                                        .filter((tile) => tile !== result.discardedTile)
                                        .map((tile) => (
                                            <img key={tile} src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "30px", height: "auto" }} />
                                        ))}
                                    <div style={{ fontSize: "16px", fontWeight: "bold", marginLeft: "10px" }}>{result.maxCount}張</div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {result.type === "suboptimal" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img key={result.discardedTile} src={`${process.env.PUBLIC_URL}/images/${result.discardedTile}.png`} alt={result.discardedTile} style={{ width: "30px", height: "auto" }} />
                            <div style={{ fontSize: "16px", fontWeight: "bold", marginLeft: "10px" }}>{result.currentCount}張</div>
                        </div>
                        <div style={{ marginBottom: "10px", marginTop: "10px" }}>最多進張切牌：</div>
                        <div
                            style={{
                                display: "flex",
                                gap: "1px",
                                flexWrap: "wrap",
                                justifyContent: "center", // 水平置中
                                alignItems: "center", // 垂直置中
                                marginTop: "5px",
                            }}
                        >
                            {sortTiles(result.bestChoices).map((tile) => (
                                <img key={tile} src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "30px", height: "auto" }} />
                            ))}
                            <div style={{ fontSize: "16px", fontWeight: "bold", marginLeft: "10px" }}>{result.maxCount}張</div>
                        </div>
                    </div>
                )}

                {result.type === "invalid" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img key={result.discardedTile} src={`${process.env.PUBLIC_URL}/images/${result.discardedTile}.png`} alt={result.discardedTile} style={{ width: "30px", height: "auto" }} />
                        </div>

                        {result.maxCount !== -Infinity && (
                            <>
                                <div style={{ marginBottom: "10px", marginTop: "10px" }}>最多進張切牌：</div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "1px",
                                        flexWrap: "wrap",
                                        justifyContent: "center", // 水平置中
                                        alignItems: "center", // 垂直置中
                                    }}
                                >
                                    {sortTiles(result.bestChoices).map((tile) => (
                                        <img key={tile} src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "30px", height: "auto" }} />
                                    ))}
                                    <div
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            marginLeft: "10px",
                                        }}
                                    >
                                        {result.maxCount}張
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const resetGame = () => {
        const allTiles = generateTiles(tileType);
        shuffleArray(allTiles);

        const initialHand = allTiles.splice(0, 14);
        const sortedHand = sortTiles(initialHand.slice(0, 13));
        const newHandTiles = [...sortedHand, initialHand[13]];

        // 重置所有相關狀態
        setTilesWall(allTiles);
        setHandTiles(newHandTiles);
        setDiscardedTiles([]);
        setTilesStr("");
        setTiles34Arr([]);
        setRemainingTilesCount(countRemainingTiles(allTiles));
        setShantenNum(null);
        setHoveredIndex(null);
        setImprovementResults({});
        setLastDiscardResult(null);
        setDiscardAnsList([]);

        updateTilesState(newHandTiles);
        calculateImprovements(newHandTiles, allTiles);
    };

    const handleTileTypeChange = (newType) => {
        setTileType(newType);
    };

    return (
        <div className="container" style={{ maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>清一色何切練習</div>

            {shantenNum !== null && (
                <div style={{ fontSize: "20px", marginTop: "20px", textAlign: "center" }}>
                    {shantenNum === -1 ? (
                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                background: "#FF0000", // 紅色背景
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
                                background: "#007BFF", // 藍色背景
                                padding: "7px 15px",
                                borderRadius: "10px",
                                display: "inline-block",
                            }}
                        >
                            聽牌
                        </div>
                    ) : isShanten === true ? (
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
                            未聽牌
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
                        onClick={() => handleTileClick(tile, index)}
                        onMouseEnter={() => handleTileHover(index)}
                        onMouseLeave={() => handleTileHover(null)}
                        style={{
                            cursor: "pointer",
                            width: "7%",
                            maxWidth: "50px",
                            height: "auto",
                            borderRadius: "5px",
                            transition: "all 0.2s ease",
                            transform: hoveredIndex === index ? "translateY(-5px)" : "none",
                            marginLeft: index === 13 ? "5px" : "0px", // 第 14 張（索引 13）前加入間隔
                        }}
                    />
                ))}
            </div>

            <div style={{ fontSize: "20px", marginTop: "5px" }}>手牌：{tilesStr}</div>

            <div style={{ marginTop: "10px", display: "flex", gap: "15px" }}>
                <label>
                    <input type="checkbox" checked={isDiscard} onChange={(e) => setIsDiscard(e.target.checked)} />
                    顯示切牌
                </label>
                <label>
                    <input type="checkbox" checked={isShanten} onChange={(e) => setIsShanten(e.target.checked)} />
                    顯示向聽數
                </label>
                <label>
                    <input type="checkbox" checked={isCalculatedList} onChange={(e) => setIsCalculatingList(e.target.checked)} />
                    顯示進張（聽牌）列表
                </label>
            </div>

            <div
                style={{
                    margin: "10px 0",
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <button
                    onClick={resetGame}
                    style={{
                        padding: "7px 15px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                >
                    新的手牌
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center", // 水平置中
                    alignItems: "flex-start", // 垂直對齊到頂端
                    gap: "20px", // 設定間距
                    flexWrap: "wrap", // 當空間不足時換行
                }}
            >
                {lastDiscardResult && <DiscardResultDisplay result={lastDiscardResult} />}

                {isDiscard && discardedTiles.length > 0 && (
                    <div
                        style={{
                            padding: "15px",
                            border: "1px solid",
                            borderColor: "#888888",
                            borderRadius: "5px",
                            backgroundColor: "#FDFDFD",
                            marginTop: "10px",
                        }}
                    >
                        {discardedTiles.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    切牌列表
                                </div>
                                <div
                                    style={{
                                        fontSize: "16px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    正確率：{discardAnsList.filter((status) => status === "best").length} / {discardedTiles.length} (
                                    {((discardAnsList.filter((status) => status === "best").length / discardedTiles.length) * 100).toFixed(2)} %)
                                </div>
                            </>
                        )}

                        <div
                            className="discarded-tiles"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, auto)", // 每列 5 個元素
                                gap: "5px", // 設定間距
                                marginTop: "10px",
                                justifyContent: "center", // 水平置中
                                alignItems: "center", // 垂直置中
                            }}
                        >
                            {discardedTiles.map((tile, index) => {
                                const status = discardAnsList[index]; // 取得該 index 的狀態
                                const borderColor = status === "best" ? "#28a745" : status === "suboptimal" ? "#ffc107" : status === "invalid" ? "#dc3545" : "transparent"; // 預設無色
                                const backgroundColor = status === "best" ? "#d4edda" : status === "suboptimal" ? "#fff3cd" : status === "invalid" ? "#f8d7da" : "transparent";

                                return (
                                    <div
                                        key={`discarded-wrapper-${tile}-${index}`}
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 4px 0px 4px",
                                            backgroundColor,
                                            borderColor,
                                            borderWidth: "2px",
                                            borderStyle: "solid",
                                            borderRadius: "5px", // 圓角
                                        }}
                                    >
                                        <img
                                            key={`discarded-${tile}-${index}`}
                                            src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                                            alt={tile}
                                            style={{
                                                width: "30px",
                                                height: "auto",
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {isCalculatedList && shantenNum !== -1 && (
                <div
                    style={{
                        padding: "10px",
                        border: "1px solid",
                        borderColor: "#888888",
                        borderRadius: "5px",
                        backgroundColor: "#FDFDFD",
                        marginTop: "10px",
                    }}
                >
                    <div style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>{shantenNum === -1 ? null : shantenNum === 0 ? <div>聽牌列表</div> : <div>進張列表</div>}</div>
                    {isCalculating ? <div>計算中...</div> : Object.keys(improvementResults).length > 0 ? <ResultDisplay results={improvementResults} /> : <div></div>}
                </div>
            )}

            {isTileWall && (
                <div
                    style={{
                        padding: "15px",
                        border: "1px solid",
                        borderColor: "#888888",
                        borderRadius: "5px",
                        backgroundColor: "#FDFDFD",
                        marginTop: "10px",
                    }}
                >
                    <div style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>牌山剩餘的牌 ({tilesWall.length}張)</div>

                    {/* 牌的排列區域 */}
                    <div
                        className="remaining-tiles"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(10, auto)", // 每行10個
                            gap: "5px", // 設定間距
                            marginTop: "10px",
                            justifyContent: "center", // 水平置中
                            alignItems: "center", // 垂直置中
                        }}
                    >
                        {Object.entries(remainingTilesCount).map(([tile, count]) => (
                            <div key={tile} style={{ textAlign: "center" }}>
                                <img src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "30px", height: "auto" }} />
                                <div style={{ fontSize: "14px", marginTop: "2px" }}>×{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div
                style={{
                    marginTop: "10px",
                    padding: "15px",
                    backgroundColor: "#FDFDFD",
                    textAlign: "center",
                    justifySelf: "center",
                    border: "1px solid",
                    borderColor: "#888888",
                    borderRadius: "5px",
                }}
            >
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: tileType === "m" ? "bold" : "",
                            backgroundColor: tileType === "m" ? "#007BFF" : "#f0f0f0",
                            color: tileType === "m" ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                            handleTileTypeChange("m");
                        }}
                    >
                        萬子
                    </button>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: tileType === "p" ? "bold" : "",
                            backgroundColor: tileType === "p" ? "#007BFF" : "#f0f0f0",
                            color: tileType === "p" ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                            handleTileTypeChange("p");
                        }}
                    >
                        餅子
                    </button>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: tileType === "s" ? "bold" : "",
                            backgroundColor: tileType === "s" ? "#007BFF" : "#f0f0f0",
                            color: tileType === "s" ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                            handleTileTypeChange("s");
                        }}
                    >
                        索子
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PureOnesEfficiencyTrainer;
