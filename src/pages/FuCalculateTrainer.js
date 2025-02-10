import React, { useEffect, useState } from "react";

// 生成初始牌山
const generateWall = () => {
    const types = ["m", "p", "s"];
    const wall = [];

    // 數牌
    types.forEach((type) => {
        for (let num = 1; num <= 9; num++) {
            wall.push(...Array(4).fill(`${num}${type}`));
        }
    });

    // 字牌
    for (let num = 1; num <= 7; num++) {
        wall.push(...Array(4).fill(`${num}z`));
    }

    return wall;
};

// 生成有效組合
const generateValidHand = () => {
    const wall = generateWall();
    const meldOptions = [];
    const usedTiles = new Set();

    // 生成選項池
    const createMeld = (type, size) => {
        // 生成吃的順子
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "吃", tiles: [`${i}${suit}`, `${i + 1}${suit}`, `${i + 2}${suit}`] });
            }
        });

        // 生成碰的明刻
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 9; i++) {
                meldOptions.push({ type: "碰", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });
        ["z"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "碰", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });

        // 生成槓的明槓
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 9; i++) {
                meldOptions.push({ type: "明槓", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });
        ["z"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "明槓", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });

        // 生成槓的暗槓
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 9; i++) {
                meldOptions.push({ type: "暗槓", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });
        ["z"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "暗槓", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });

        // 生成手牌的順子
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "手牌順子", tiles: [`${i}${suit}`, `${i + 1}${suit}`, `${i + 2}${suit}`] });
            }
        });

        // 生成手牌的刻子
        ["m", "s", "p"].forEach((suit) => {
            for (let i = 1; i <= 9; i++) {
                meldOptions.push({ type: "手牌刻子", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });
        ["z"].forEach((suit) => {
            for (let i = 1; i <= 7; i++) {
                meldOptions.push({ type: "手牌刻子", tiles: [`${i}${suit}`, `${i}${suit}`, `${i}${suit}`] });
            }
        });
    };

    createMeld();

    // 隨機選擇組合
    const selected = [];
    while (selected.length < 4) {
        const choice = meldOptions[Math.floor(Math.random() * meldOptions.length)];
        if (choice.tiles.every((t) => !usedTiles.has(t))) {
            selected.push(choice);
            choice.tiles.forEach((t) => {
                usedTiles.add(t);
                const index = wall.indexOf(t);
                if (index !== -1) {
                    wall.splice(index, 1);
                }
            });
        }
    }

    // 選擇雀頭
    let candidates = wall.filter((t, i, arr) => !usedTiles.has(t) && arr.indexOf(t) !== arr.lastIndexOf(t));
    let pair = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    let index = wall.indexOf(pair);
    if (index !== -1) {
        wall.splice(index, 1);
        wall.splice(index, 1);
    }
    selected.push({ type: "手牌雀頭", tiles: [pair, pair] });

    // 排序面子
    const typeOrder = {
        手牌順子: 1,
        手牌刻子: 2,
        手牌雀頭: 3,
        吃: 4,
        碰: 5,
        明槓: 6,
        暗槓: 7,
    };
    selected.sort((a, b) => (typeOrder[a.type] ?? Infinity) - (typeOrder[b.type] ?? Infinity));

    // 選擇自摸牌
    let winningMeldIndex;
    let winningTileIndex;

    const validSets = selected.filter((item) => ["手牌順子", "手牌刻子", "手牌雀頭"].includes(item.type));
    if (validSets.length > 0) {
        const randomSet = validSets[Math.floor(Math.random() * validSets.length)];
        winningMeldIndex = selected.indexOf(randomSet);
    }

    if (selected[winningMeldIndex].type === "手牌順子") {
        winningTileIndex = Math.floor(Math.random() * selected[winningMeldIndex].tiles.length);
    }
    if (selected[winningMeldIndex].type === "手牌刻子") {
        winningTileIndex = 2;
    }
    if (selected[winningMeldIndex].type === "手牌雀頭") {
        winningTileIndex = 1;
    }

    // 判斷聽牌類型
    let waitType = "";
    if (selected[winningMeldIndex].type === "手牌刻子") {
        waitType = "雙碰";
    } else if (selected[winningMeldIndex].type === "手牌雀頭") {
        waitType = "單騎";
    } else if (selected[winningMeldIndex].type === "手牌順子") {
        const nums = selected[winningMeldIndex].tiles.map((t) => parseInt(t));
        if (winningTileIndex === 1) {
            waitType = "嵌張";
        } else if (winningTileIndex === 0) {
            if (JSON.stringify(nums) === JSON.stringify([7, 8, 9])) {
                waitType = "邊張";
            } else {
                waitType = "兩面";
            }
        } else if (winningTileIndex === 2) {
            if (JSON.stringify(nums) === JSON.stringify([1, 2, 3])) {
                waitType = "邊張";
            } else {
                waitType = "兩面";
            }
        }
    }

    const roundWind = ["東", "南", "西"][Math.floor(Math.random() * 3)];
    const seatWind = ["東", "南", "西", "北"][Math.floor(Math.random() * 4)];
    const isMenzen = selected.every((item) => ["手牌順子", "手牌刻子", "手牌雀頭", "暗槓"].includes(item.type));
    const isTsumo = Math.random() > 0.5;

    return {
        melds: selected,
        winningMeldIndex,
        winningTileIndex,
        waitType,
        roundWind,
        seatWind,
        isMenzen,
        isTsumo,
    };
};

// 符數計算邏輯
const calculateFu = (hand) => {
    const meldFuMessage = [];

    let fu = 20; // 基礎符
    let isPairAddFu = false;
    let isPinfuTsumo = false;
    let isChowTwentyFu = false;

    // 面子計算
    hand.melds.forEach((m, i) => {
        const terminalsAndHonours = ["1m", "9m", "1p", "9p", "1s", "9s", "1z", "2z", "3z", "4z", "5z", "6z", "7z"];
        const windMap = {
            東: "1z",
            南: "2z",
            西: "3z",
            北: "4z",
        };

        if (m.type === "手牌順子") {
            meldFuMessage.push("順子 0 符");
        }

        // 判斷手牌刻子是明刻或暗刻
        if (m.type === "手牌刻子") {
            const isTerminalOrHonour = m.tiles.some((tile) => terminalsAndHonours.includes(tile));

            if (hand.isTsumo) {
                fu += isTerminalOrHonour ? 8 : 4; // 如果是自摸必定為暗刻
                meldFuMessage.push(isTerminalOrHonour ? "么九暗刻 8 符" : "中張暗刻 4 符");
            } else {
                if (hand.winningMeldIndex === i) {
                    fu += isTerminalOrHonour ? 4 : 2; // 含榮和牌的刻子為明刻
                    meldFuMessage.push(isTerminalOrHonour ? "么九明刻 4 符" : "中張明刻 2 符");
                } else {
                    fu += isTerminalOrHonour ? 8 : 4; // 不含榮和牌的刻子為為暗刻
                    meldFuMessage.push(isTerminalOrHonour ? "么九暗刻 8 符" : "中張暗刻 4 符");
                }
            }
        }

        if (m.type === "手牌雀頭") {
            if (windMap[hand.roundWind] === m.tiles[0] && windMap[hand.seatWind] !== m.tiles[0]) {
                fu += 2;
                meldFuMessage.push("場風雀頭 2 符");
                isPairAddFu = true;
            } else if (windMap[hand.roundWind] !== m.tiles[0] && windMap[hand.seatWind] === m.tiles[0]) {
                fu += 2;
                meldFuMessage.push("自風雀頭 2 符");
                isPairAddFu = true;
            } else if (windMap[hand.roundWind] === m.tiles[0] && windMap[hand.seatWind] === m.tiles[0]) {
                fu += 4;
                meldFuMessage.push("連風雀頭 4 符");
                isPairAddFu = true;
            } else if (m.tiles.some((tile) => ["5z", "6z", "7z"].includes(tile))) {
                fu += 2;
                meldFuMessage.push("三元牌雀頭 2 符");
                isPairAddFu = true;
            } else {
                meldFuMessage.push("非役牌雀頭 0 符");
                isPairAddFu = false;
            }
        }

        if (m.type === "吃") {
            meldFuMessage.push("順子 0 符");
        }

        if (m.type === "碰") {
            const isTerminalOrHonour = m.tiles.some((tile) => terminalsAndHonours.includes(tile));
            fu += isTerminalOrHonour ? 4 : 2;
            meldFuMessage.push(isTerminalOrHonour ? "么九明刻 4 符" : "中張明刻 2 符");
        }

        if (m.type === "明槓") {
            const isTerminalOrHonour = m.tiles.some((tile) => terminalsAndHonours.includes(tile));
            fu += isTerminalOrHonour ? 16 : 8;
            meldFuMessage.push(isTerminalOrHonour ? "么九明槓 16 符" : "中張明槓 8 符");
        }

        if (m.type === "暗槓") {
            const isTerminalOrHonour = m.tiles.some((tile) => terminalsAndHonours.includes(tile));
            fu += isTerminalOrHonour ? 32 : 16;
            meldFuMessage.push(isTerminalOrHonour ? "么九暗槓 32 符" : "中張暗槓 16 符");
        }
    });

    // 門清榮和加符
    if (hand.isMenzen && !hand.isTsumo) fu += 10;

    // 自摸加符
    if (hand.isTsumo) fu += 2;

    // 單騎邊張嵌張聽牌加符
    if (hand.waitType === "單騎" || hand.waitType === "邊張" || hand.waitType === "嵌張") fu += 2;

    // 平和自摸20符
    if (hand.isMenzen && hand.isTsumo && hand.melds.every((item) => ["手牌順子", "手牌雀頭"].includes(item.type)) && hand.waitType === "兩面" && isPairAddFu === false) {
        isPinfuTsumo = true;
        fu = 20;
    }

    if (
        !hand.isMenzen &&
        !hand.isTsumo &&
        hand.melds.every((item) => ["手牌順子", "手牌雀頭", "吃"].includes(item.type)) &&
        hand.melds.some((item) => ["吃"].includes(item.type)) &&
        hand.waitType === "兩面" &&
        isPairAddFu === false
    ) {
        isChowTwentyFu = true;
        fu = 30;
    }

    return { fuNotCeil: fu, fu: Math.ceil(fu / 10) * 10, meldFuMessage: meldFuMessage, isPinfuTsumo: isPinfuTsumo, isChowTwentyFu: isChowTwentyFu };
};

const renderHandSequence = (tiles, isWinningMeld, winningTileIndex) => {
    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {tiles.map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        filter: isWinningMeld && j === winningTileIndex ? "sepia(130%) hue-rotate(10deg) saturate(300%)" : "",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderHandTriplet = (tiles, isWinningMeld) => {
    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {tiles.map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        filter: isWinningMeld && j === 2 ? "sepia(130%) hue-rotate(10deg) saturate(300%)" : "",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderHandPairs = (tiles, isWinningMeld) => {
    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {tiles.map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        filter: isWinningMeld && j === 1 ? "sepia(130%) hue-rotate(10deg) saturate(300%)" : "",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderChow = (tiles, randomNumber) => {
    const result = tiles.map((tile, index) => [
        `-${tile}`,
        ...tiles.filter((_, i) => i !== index), // 排除當前 tile，保留其他元素
    ]);

    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {result[Math.floor(randomNumber * result.length)].map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: tile.startsWith("-") ? "calc(1.3 * clamp(25px, 5vw, 50px))" : "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderPong = (tiles, randomNumber) => {
    const result = tiles.map((tile, index) => {
        const newTiles = [...tiles]; // 複製一份原始陣列
        newTiles[index] = `-${tile}`; // 在當前元素上加上 "-"
        return newTiles;
    });

    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {result[Math.floor(randomNumber * result.length)].map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: tile.startsWith("-") ? "calc(1.3 * clamp(25px, 5vw, 50px))" : "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderExposedKong = (tiles, randomNumber) => {
    let result = [];

    // 當加上 `-` 時，分別加在第 1、2 和 4 個位置，且元素為 4
    result.push([`-${tiles[0]}`, tiles[1], tiles[2], tiles[3]]);
    result.push([tiles[0], `-${tiles[1]}`, tiles[2], tiles[3]]);
    result.push([tiles[0], tiles[1], tiles[2], `-${tiles[3]}`]);

    // 當加上 `=` 時，分別加在第 1、2 和 3 個位置，且元素為 3
    result.push([`=${tiles[0]}`, tiles[1], tiles[2]]);
    result.push([tiles[0], `=${tiles[1]}`, tiles[2]]);
    result.push([tiles[0], tiles[1], `=${tiles[2]}`]);

    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {result[Math.floor(randomNumber * result.length)].map((tile, j) => (
                <img
                    key={j}
                    src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: tile.startsWith("-") || tile.startsWith("=") ? "calc(1.3 * clamp(25px, 5vw, 50px))" : "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

const renderConcealedKong = (tiles) => {
    return (
        <div style={{ whiteSpace: "nowrap" }}>
            {tiles.map((tile, j) => (
                <img
                    key={j}
                    src={j === 0 || j === 3 ? `${process.env.PUBLIC_URL}/images/0z.png` : `${process.env.PUBLIC_URL}/images/${tile}.png`}
                    style={{
                        width: "clamp(25px, 5vw, 50px)",
                        height: "auto",
                        borderRadius: "5px",
                        display: "inline-block",
                    }}
                    alt={tile}
                />
            ))}
        </div>
    );
};

// 主組件
function FuCalculator() {
    const [currentHand, setCurrentHand] = useState({
        melds: [],
        winningMeldIndex: null,
        winningTileIndex: null,
        waitType: "",
        roundWind: "",
        seatWind: "",
        isMenzen: false,
        isTsumo: false,
    });
    const [userInput, setUserInput] = useState("");
    const [result, setResult] = useState(null);
    const [randomNumber, setRandomNumber] = useState(0);
    const [isSummit, setIsSummit] = useState(false);
    const [isTable, setIsTable] = useState(false);

    useEffect(() => {
        initial();
    }, []);

    const initial = () => {
        let hands = generateValidHand();
        // 避免四暗刻役滿情況
        let isFourCards = hands.melds.every((item) => ["手牌刻子", "手牌雀頭", "暗槓"].includes(item.type));
        while (isFourCards) {
            hands = generateValidHand();
            isFourCards = hands.melds.every((item) => ["手牌刻子", "手牌雀頭", "暗槓"].includes(item.type));
        }
        setCurrentHand(hands);
        setRandomNumber(Math.random());
    };

    // 提交處理
    const handleSubmit = (e) => {
        e.preventDefault();
        let result = calculateFu(currentHand);
        setResult({
            correct: parseInt(userInput) === result.fu,
            fuNotCeil: result.fuNotCeil,
            correctFu: result.fu,
            meldFuMessage: result.meldFuMessage,
            isPinfuTsumo: result.isPinfuTsumo,
            isChowTwentyFu: result.isChowTwentyFu,
        });
        setIsSummit(true);
    };

    // 下一題
    const nextQuestion = () => {
        let hands = generateValidHand();
        // 避免四暗刻役滿情況
        let isFourCards = hands.melds.every((item) => ["手牌刻子", "手牌雀頭", "暗槓"].includes(item.type));
        while (isFourCards) {
            hands = generateValidHand();
            isFourCards = hands.melds.every((item) => ["手牌刻子", "手牌雀頭", "暗槓"].includes(item.type));
        }
        setCurrentHand(hands);
        setRandomNumber(Math.random());

        setUserInput("");
        setResult(null);
        setIsSummit(false);
    };

    return (
        <div className="container" style={{ maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>符數計算練習</div>

            {/* 場況顯示 */}
            <div style={{ marginTop: "20px", marginBottom: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(20px, 2vw, 24px)", fontWeight: "bold" }}>
                    {currentHand.roundWind}風場{currentHand.seatWind}家 {currentHand.isTsumo ? "自摸" : "榮和"}
                </div>
            </div>

            {/* 輸入表單 */}
            <label style={{ fontSize: "20px", marginBottom: "10px" }}>
                {" "}
                <input
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
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
                符
            </label>

            <div style={{ justifyContent: "center", margin: "10px 0", display: "flex", gap: "15px" }}>
                <button
                    onClick={handleSubmit}
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
                    onClick={nextQuestion}
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

            <label>
                <input type="checkbox" checked={isTable} onChange={(e) => setIsTable(e.target.checked)} />
                顯示算符規則
            </label>

            {/* 手牌顯示 */}
            <div
                style={{
                    maxWidth: "100%",
                    textAlign: "center",
                    overflow: "auto",
                }}
            >
                <table style={{ marginTop: "30px" }}>
                    <thead>
                        <tr>
                            {currentHand.melds.map((meld, i) => (
                                <td key={i} style={{ verticalAlign: "bottom", padding: "2px", justifyItems: "center" }}>
                                    {meld.type === "手牌順子" && renderHandSequence(meld.tiles, currentHand.winningMeldIndex === i, currentHand.winningTileIndex)}
                                    {meld.type === "手牌刻子" && renderHandTriplet(meld.tiles, currentHand.winningMeldIndex === i)}
                                    {meld.type === "手牌雀頭" && renderHandPairs(meld.tiles, currentHand.winningMeldIndex === i)}
                                    {meld.type === "吃" && renderChow(meld.tiles, randomNumber)}
                                    {meld.type === "碰" && renderPong(meld.tiles, randomNumber)}
                                    {meld.type === "明槓" && renderExposedKong(meld.tiles, randomNumber)}
                                    {meld.type === "暗槓" && renderConcealedKong(meld.tiles)}
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {isSummit &&
                                result.meldFuMessage.map((m, i) => (
                                    <td key={i} style={{ height: "40px", textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>
                                        {m}
                                    </td>
                                ))}
                        </tr>
                        <tr>
                            {isSummit && !result.isPinfuTsumo && !result.isChowTwentyFu && (
                                <td colSpan={5} style={{ height: "40px", textAlign: "center" }}>
                                    <div style={{ display: "inline-flex", gap: "20px" }}>
                                        <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>底符 20 符</div>
                                        {!currentHand.isTsumo && currentHand.isMenzen ? <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>門清榮和 10 符</div> : null}
                                        {currentHand.isTsumo ? <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>自摸和 2 符</div> : null}
                                        {currentHand.waitType === "單騎" ? <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>單騎聽牌 2 符</div> : null}
                                        {currentHand.waitType === "邊張" ? <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>邊張聽牌 2 符</div> : null}
                                        {currentHand.waitType === "嵌張" ? <div style={{ textAlign: "center", fontSize: "clamp(14px, 2vw, 18px)" }}>嵌張聽牌 2 符</div> : null}
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            {isSummit && !result.isPinfuTsumo && !result.isChowTwentyFu && (
                                <td colSpan={5} style={{ height: "40px", textAlign: "center" }}>
                                    {result.fuNotCeil === result.correctFu && (
                                        <div style={{ textAlign: "center", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: "bold" }}>共 {result.correctFu} 符</div>
                                    )}
                                    {result.fuNotCeil !== result.correctFu && (
                                        <div style={{ textAlign: "center", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: "bold", display: "inline-flex", gap: "10px" }}>
                                            <div>共 {result.fuNotCeil} 符</div>
                                            <div>進位 {result.correctFu} 符</div>
                                        </div>
                                    )}
                                </td>
                            )}
                            {isSummit && result.isPinfuTsumo && (
                                <td colSpan={5} style={{ height: "40px", textAlign: "center" }}>
                                    <div style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>平和自摸 20 符</div>
                                </td>
                            )}
                            {isSummit && result.isChowTwentyFu && (
                                <td colSpan={5} style={{ height: "40px", textAlign: "center" }}>
                                    <div style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>吃牌後 20 符，計為 30 符</div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            {isSummit && (
                                <td colSpan={5} style={{ height: "40px", textAlign: "center" }}>
                                    <div
                                        style={{
                                            margin: "10px 0",
                                            padding: "10px 50px",
                                            backgroundColor: result.correct ? "#d4edda" : "#f8d7da",
                                            border: `2px solid ${result.correct ? "#28a745" : "#dc3545"}`,
                                            borderRadius: "10px",
                                            justifySelf: "center",
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            color: result.correct ? "#28a745" : "#dc3545",
                                        }}
                                    >
                                        {result.correct ? "正確！" : `錯誤！`}
                                    </div>
                                </td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 算符規則 */}
            {isTable && (
                <div
                    style={{
                        maxWidth: "100%",
                        textAlign: "center",
                        overflow: "auto",
                        marginTop: "10px",
                    }}
                >
                    <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tr>
                            <td colSpan={6}>
                                <div style={{ fontSize: "20px", fontWeight: "bold", margin: "10px 0" }}>算符規則</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "10px", fontSize: "18px", fontWeight: "bold" }}>聽牌符</td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>單騎聽牌 2 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandPairs(["5z", "5z"], true)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>邊張聽牌 2 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandSequence(["1m", "2m", "3m"], true, 2)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>嵌張聽牌 2 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandSequence(["1p", "2p", "3p"], true, 1)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>兩面聽牌 0 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandSequence(["1s", "2s", "3s"], true, 0)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>雙碰聽牌 0 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>
                                    {renderHandTriplet(["6z", "6z", "6z"], true)}
                                    {renderHandPairs(["7z", "7z"], false)}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td rowSpan={3} style={{ padding: "10px", fontSize: "18px", fontWeight: "bold" }}>
                                面子符
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>中張明刻 2 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderPong(["4m", "4m", "4m"], 0.1)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>中張暗刻 4 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandTriplet(["5p", "5p", "5p"], false)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>中張大明槓 8 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderExposedKong(["6s", "6s", "6s", "6s"], 0.2)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>中張加槓 8 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderExposedKong(["7m", "7m", "7m", "7m"], 0.9)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>中張暗槓 16 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderConcealedKong(["8p", "8p", "8p", "8p"])}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>么九明刻 4 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderPong(["1m", "1m", "1m"], 0.1)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>么九暗刻 8 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandTriplet(["9p", "9p", "9p"], false)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>么九大明槓 16 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderExposedKong(["9s", "9s", "9s", "9s"], 0.2)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>么九加槓 16 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderExposedKong(["1z", "1z", "1z", "1z"], 0.9)}</div>
                            </td>
                            <td style={{ padding: "10px", verticalAlign: "bottom", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>么九暗槓 32 符</div>
                                <div style={{ marginTop: "40px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderConcealedKong(["2z", "2z", "2z", "2z"])}</div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>順子 0 符</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>
                                    {renderHandSequence(["7m", "8m", "9m"], false, 0)}
                                    {renderChow(["7p", "8p", "9p"], false, 0)}
                                </div>
                            </td>
                            <td colSpan={3} style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", margin: "10px" }}>和牌符</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>底符 20 符</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>門清榮和 10 符</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>自摸和 2 符</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "10px", fontSize: "18px", fontWeight: "bold" }}>雀頭符</td>
                            <td style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>役牌雀頭 2 符</div>
                                <div style={{ fontSize: "18px" }}>（場風、自風、三元牌）</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandPairs(["5z", "5z"], false)}</div>
                            </td>
                            <td style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>連風役牌雀頭 4 符</div>
                                <div style={{ fontSize: "18px" }}>（如：東場東家）</div>
                                <div style={{ marginTop: "10px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandPairs(["1z", "1z"], false)}</div>
                            </td>
                            <td style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px" }}>非役牌雀頭 0 符</div>
                                <div style={{ marginTop: "30px", padding: "5px", display: "inline-flex", gap: "10px" }}>{renderHandPairs(["5m", "5m"], false)}</div>
                            </td>
                            <td colSpan={2} style={{ padding: "10px", justifyItems: "center" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", margin: "10px" }}>特殊規則</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>符數需要無條件進位至 10 的倍數</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>七對子計為 25 符</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>平和自摸計為 20 符</div>
                                <div style={{ fontSize: "18px", margin: "10px" }}>吃牌後 20 符，計為 30 符</div>
                            </td>
                        </tr>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FuCalculator;
