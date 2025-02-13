import { useEffect, useRef, useState } from "react";
import CircleTimer from "../components/CircleTimer";

// 生成僅包含萬子的牌山
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
    return [...tiles].sort((a, b) => {
        const aNum = a.replace(/\D/g, "");
        const bNum = b.replace(/\D/g, "");

        const aSortNum = aNum === "0" ? 5.5 : parseInt(aNum, 10);
        const bSortNum = bNum === "0" ? 5.5 : parseInt(bNum, 10);

        return aSortNum - bSortNum;
    });
};

// 將手牌轉換為 tiles34Arr 格式
const convertToTiles34Arr = (handTiles) => {
    const tiles34Arr = new Array(34).fill(0);

    handTiles.forEach((tile) => {
        const num = tile.replace(/\D/g, "");
        const index = num === "0" ? 4 : parseInt(num, 10) - 1;
        tiles34Arr[index]++;
    });

    return tiles34Arr;
};

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

function PureOnesReadyTrainer() {
    const [tileType, setTileType] = useState("m");

    const [difficulty, setDifficulty] = useState(0);

    const [tilesWall, setTilesWall] = useState([]);
    const [handTiles, setHandTiles] = useState([]);
    const [answer, setAnswer] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const [totalAttempts, setTotalAttempts] = useState(0);
    const [correctAttempts, setCorrectAttempts] = useState(0);

    const [timeLimit, setTimeLimit] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const attemptExecuted = useRef(false);

    // 初始化遊戲
    useEffect(() => {
        initializeGame();
        if (timeLimit !== null) {
            setTimeLeft(timeLimit);
            setIsTimerRunning(true);
        }
    }, []);

    useEffect(() => {
        if (isTimerRunning && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft((prev) => Math.max(prev - 100, 0));
            }, 100);
            setTimerId(timer);
        } else if (timeLeft === 0) {
            handleTimeout();
        }
        return () => clearTimeout(timerId);
    }, [isTimerRunning, timeLeft]);

    useEffect(() => {
        initializeGame();
    }, [tileType]);

    useEffect(() => {
        initializeGame();
    }, [difficulty]);

    const TimeoutMessage = ({ isWaiting }) => {
        const [countdown, setCountdown] = useState(3);

        useEffect(() => {
            if (isWaiting) {
                setCountdown(5); // 重置倒數時間
                const interval = setInterval(() => {
                    setCountdown((prev) => prev - 1);
                }, 1000);

                const timeout = setTimeout(() => {
                    setCountdown(0);
                }, 5000);

                return () => {
                    clearInterval(interval);
                    clearTimeout(timeout);
                };
            }
        }, [isWaiting]);

        if (!isWaiting || countdown === 0) return null;

        return <div>{countdown}</div>;
    };

    const handleTimeout = () => {
        setIsTimerRunning(false);
        setIsWaiting(true);

        if (!attemptExecuted.current) {
            setTotalAttempts((t) => t + 1);
            attemptExecuted.current = true; // 設置為已執行
        }

        if (!isSubmitted) {
            setShowTimeoutMessage(true);

            setTimeout(() => {
                setShowTimeoutMessage(false);
                initializeGame();
                if (timeLimit !== null) {
                    setTimeLeft(timeLimit);
                    setIsTimerRunning(true);
                }
                setIsWaiting(false);
                attemptExecuted.current = false; // 在遊戲重啟後重置為未執行
            }, 5000);
        }
    };

    const stopGame = () => {
        clearTimeout(timerId);
        setIsTimerRunning(false);
    };

    const initializeGame = () => {
        let validHand = false;
        let allTiles, initialHand;
        let initialHand34, tempTiles34;

        while (!validHand) {
            allTiles = generateTiles(tileType);
            shuffleArray(allTiles);

            initialHand = allTiles.splice(0, 13);
            initialHand34 = convertToTiles34Arr(initialHand);

            tempTiles34 = [...initialHand34];
            tempTiles34[27] += 1; // 補一張字牌

            const shanten = calculateShanten(tempTiles34);

            // 向聽數為 0 且有答案的才能作為題目
            if (shanten === 0 && getCorrectAnswer(initialHand).length !== 0) {
                if (difficulty === 0) {
                    validHand = true;
                }
                if (difficulty === 1 && getCorrectAnswer(initialHand).length >= 1 && getCorrectAnswer(initialHand).length <= 2) {
                    validHand = true;
                }
                if (difficulty === 2 && getCorrectAnswer(initialHand).length >= 3 && getCorrectAnswer(initialHand).length <= 4) {
                    validHand = true;
                }
                if (difficulty === 3 && getCorrectAnswer(initialHand).length >= 5) {
                    validHand = true;
                }
            }
        }

        setHandTiles(sortTiles(initialHand));
        setTilesWall(allTiles);
        setAnswer([]);
        setIsSubmitted(false);
        setIsCorrect(false);
    };

    const calculateShanten = (tiles34Arr) => {
        const Shanten = require("../tools/Shanten");
        const shanten = new Shanten();
        return shanten.calculateShanten(tiles34Arr);
    };

    const handleAnswerChange = (tile) => {
        if (answer.includes(tile)) {
            setAnswer(answer.filter((t) => t !== tile));
        } else {
            setAnswer([...answer, tile]);
        }
    };

    const checkAnswer = () => {
        if (isSubmitted) return;

        const correctTiles = getCorrectAnswer(handTiles);
        const isCorrect = correctTiles.every((tile) => answer.includes(tile)) && answer.every((tile) => correctTiles.includes(tile));

        setTotalAttempts((t) => t + 1);
        if (isCorrect) setCorrectAttempts((c) => c + 1);

        setIsCorrect(isCorrect);
        setIsSubmitted(true);
        setIsTimerRunning(false);

        // 如果有時間限制，等待 3 秒後跳轉下一題
        if (timeLimit !== null) {
            setIsWaiting(true);

            setTimeout(() => {
                setIsWaiting(false); // 等待結束後恢復為非等待狀態
                initializeGame();
                if (timeLimit !== null) {
                    setTimeLeft(timeLimit);
                    setIsTimerRunning(true);
                }
            }, 5000);
        }
    };

    const getCorrectAnswer = (tiles) => {
        const tiles34 = convertToTiles34Arr(tiles);
        const correctTiles = [];

        // 找出所有能完成聽牌的牌
        for (let i = 0; i < 9; i++) {
            if (tiles34[i] < 4) {
                const tempTiles34 = [...tiles34];
                tempTiles34[i]++;
                if (calculateShanten(tempTiles34) === -1) {
                    if (tileType === "m") {
                        correctTiles.push(i === 4 ? "5m" : `${i + 1}m`);
                    }
                    if (tileType === "p") {
                        correctTiles.push(i === 4 ? "5p" : `${i + 1}p`);
                    }
                    if (tileType === "s") {
                        correctTiles.push(i === 4 ? "5s" : `${i + 1}s`);
                    }
                }
            }
        }
        return correctTiles;
    };

    const TimeButton = ({ seconds, label }) => (
        <button
            onClick={() => {
                setTimeLeft(seconds !== null ? seconds * 1000 : null);
                setTimeLimit(seconds !== null ? seconds * 1000 : null);
                setCorrectAttempts(0);
                setTotalAttempts(0);
                setIsSubmitted(false);
            }}
            disabled={isTimerRunning || isWaiting}
            style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: timeLimit === (seconds !== null ? seconds * 1000 : null) ? "bold" : "",
                backgroundColor: timeLimit === (seconds !== null ? seconds * 1000 : null) ? "#007BFF" : "#f0f0f0",
                color: timeLimit === (seconds !== null ? seconds * 1000 : null) ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "all 0.2s ease",
            }}
        >
            {label}
        </button>
    );

    const handleTileTypeChange = (newType) => {
        setTileType(newType);
    };

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
    };

    return (
        <div>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold", textAlign: "center" }}>清一色聽牌練習</div>

            {/* 手牌顯示 */}
            <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0px", justifyContent: "center" }}>
                    {handTiles.map((tile, index) => (
                        <img
                            key={`${tile}-${index}`}
                            src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                            alt={tile}
                            style={{
                                width: "7.5%",
                                maxWidth: "50px",
                                height: "auto",
                                borderRadius: "5px",
                            }}
                        />
                    ))}
                </div>
                <div style={{ fontSize: "20px", marginTop: "5px", marginBottom: "10px", textAlign: "center" }}>手牌: {convertToTilesStr(handTiles)}</div>
            </div>

            {/* 回答區域 */}
            <div>
                <div style={{ fontSize: "20px", marginTop: "20px", textAlign: "center" }}>聽牌選擇</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center", marginTop: "5px" }}>
                    {Array.from({ length: 9 }, (_, i) =>
                        tileType === "m"
                            ? i === 4
                                ? "5m"
                                : `${i + 1}m`
                            : tileType === "p"
                            ? i === 4
                                ? "5p"
                                : `${i + 1}p`
                            : tileType === "s"
                            ? i === 4
                                ? "5s"
                                : `${i + 1}s`
                            : i === 4
                            ? "5m"
                            : `${i + 1}m`
                    ).map((tile) => (
                        <div
                            key={tile}
                            onClick={() => handleAnswerChange(tile)}
                            style={{
                                cursor: "pointer",
                                padding: "5px",
                                border: `2px solid ${answer.includes(tile) ? "#2196F3" : "#ddd"}`,
                                borderRadius: "5px",
                                backgroundColor: answer.includes(tile) ? "#e3f2fd" : "#fff",
                            }}
                        >
                            <img
                                src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                                alt={tile}
                                style={{
                                    width: "40px",
                                    height: "auto",
                                    borderRadius: "5px",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 按鈕 */}
            <div style={{ justifyContent: "center", margin: "10px 0", display: "flex", gap: "15px" }}>
                <button
                    onClick={checkAnswer}
                    disabled={isSubmitted || (timeLimit !== null && timeLeft === 0) || (timeLimit !== null && !isTimerRunning) || isWaiting}
                    style={{
                        padding: "7px 15px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: isSubmitted || (timeLimit !== null && timeLeft === 0) || (timeLimit !== null && !isTimerRunning) || isWaiting ? "#AAAAAA" : "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: "pointer",
                    }}
                >
                    {isSubmitted ? "已提交" : "提交答案"}
                </button>

                {timeLimit === null && (
                    <button
                        onClick={() => {
                            initializeGame();
                            if (timeLimit !== null) {
                                setTimeLeft(timeLimit);
                                setIsTimerRunning(true);
                            }
                        }}
                        disabled={isWaiting}
                        style={{
                            padding: "7px 15px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            backgroundColor: isWaiting ? "#AAAAAA" : "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                    >
                        新的手牌
                    </button>
                )}

                {timeLimit !== null && !isTimerRunning && !isWaiting && (
                    <button
                        onClick={() => {
                            setTimeLimit(timeLimit);
                            setTimeLeft(timeLimit);
                            setIsTimerRunning(true);
                            initializeGame();
                            if (timeLimit !== null) {
                                setTimeLeft(timeLimit);
                                setIsTimerRunning(true);
                            }
                        }}
                        disabled={isWaiting}
                        style={{
                            padding: "7px 15px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            backgroundColor: isWaiting ? "#AAAAAA" : "#FF9800",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        開始出題
                    </button>
                )}

                {timeLimit !== null && isTimerRunning && !isWaiting && (
                    <button
                        onClick={stopGame}
                        disabled={isWaiting}
                        style={{
                            padding: "7px 15px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            backgroundColor: isWaiting ? "#AAAAAA" : "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        停止出題
                    </button>
                )}
            </div>

            {/* 結果顯示 */}
            {isSubmitted && (
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
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: isCorrect ? "#28a745" : "#dc3545",
                            textAlign: "center",
                        }}
                    >
                        {isCorrect ? "正確！" : "錯誤！"}
                        {timeLimit !== null ? <TimeoutMessage isWaiting={true} /> : null}
                    </div>
                    {!isCorrect && (
                        <div>
                            <div style={{ marginTop: "5px", textAlign: "center" }}>正確答案：</div>
                            <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center" }}>
                                {getCorrectAnswer(handTiles).map((tile) => (
                                    <img
                                        key={tile}
                                        src={`${process.env.PUBLIC_URL}/images/${tile}.png`}
                                        alt={tile}
                                        style={{
                                            width: "40px",
                                            height: "auto",
                                            borderRadius: "5px",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 超時訊息 */}
            {showTimeoutMessage && (
                <div
                    style={{
                        margin: "20px 0",
                        padding: "10px 50px",
                        backgroundColor: "#f8d7da",
                        border: "2px solid #dc3545",
                        borderRadius: "10px",
                        textAlign: "center",
                        justifySelf: "center",
                    }}
                >
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc3545" }}>
                        時間到！ <TimeoutMessage isWaiting={true} />
                    </div>
                    <div style={{ marginTop: "5px", textAlign: "center" }}>正確答案：</div>
                    <div style={{ marginTop: "5px", display: "flex", justifyContent: "center", gap: "5px" }}>
                        {getCorrectAnswer(handTiles).map((tile) => (
                            <img key={tile} src={`${process.env.PUBLIC_URL}/images/${tile}.png`} alt={tile} style={{ width: "40px", height: "auto" }} />
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                {timeLimit !== null && (
                    <div style={{ textAlign: "center" }}>
                        <CircleTimer timeLeft={timeLeft} timeLimit={timeLimit} isUnlimited={false} size={100} />
                    </div>
                )}
                {timeLimit === null && (
                    <div style={{ textAlign: "center" }}>
                        <CircleTimer timeLeft={1} timeLimit={1} isUnlimited={true} size={100} />
                    </div>
                )}

                <div
                    style={{
                        padding: "15px",
                        backgroundColor: "#FDFDFD",
                        border: "1px solid #888888",
                        borderRadius: "5px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "18px" }}>正確率：{totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : 0} %</div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                        （正確：{correctAttempts} / 總題數：{totalAttempts}）
                    </div>
                </div>
            </div>

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
                <div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                        <TimeButton seconds={null} label="不限時" />
                        <TimeButton seconds={120} label="120秒" />
                        <TimeButton seconds={60} label="60秒" />
                        <TimeButton seconds={30} label="30秒" />
                        <TimeButton seconds={20} label="20秒" />
                        <TimeButton seconds={10} label="10秒" />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: difficulty === 0 ? "bold" : "",
                            backgroundColor: difficulty === 0 ? "#007BFF" : "#f0f0f0",
                            color: difficulty === 0 ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleDifficultyChange(0);
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
                        }}
                    >
                        不限制 <br />
                        （聽牌數：任意）
                    </button>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: difficulty === 1 ? "bold" : "",
                            backgroundColor: difficulty === 1 ? "#007BFF" : "#f0f0f0",
                            color: difficulty === 1 ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleDifficultyChange(1);
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
                        }}
                    >
                        簡單 <br />
                        （聽牌數：1~2）
                    </button>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: difficulty === 2 ? "bold" : "",
                            backgroundColor: difficulty === 2 ? "#007BFF" : "#f0f0f0",
                            color: difficulty === 2 ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleDifficultyChange(2);
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
                        }}
                    >
                        普通 <br />
                        （聽牌數：3~4）
                    </button>
                    <button
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            fontWeight: difficulty === 3 ? "bold" : "",
                            backgroundColor: difficulty === 3 ? "#007BFF" : "#f0f0f0",
                            color: difficulty === 3 ? "white" : "#333",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleDifficultyChange(3);
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
                        }}
                    >
                        困難 <br />
                        （聽牌數：5+）
                    </button>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
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
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleTileTypeChange("m");
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
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
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleTileTypeChange("p");
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
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
                        disabled={isTimerRunning || isWaiting}
                        onClick={() => {
                            handleTileTypeChange("s");
                            setCorrectAttempts(0);
                            setTotalAttempts(0);
                        }}
                    >
                        索子
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PureOnesReadyTrainer;
