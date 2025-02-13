import { onValue, push, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";

const CommentsPage = () => {
    const [comments, setComments] = useState([]); // 存放留言列表
    const [username, setUsername] = useState(""); // 用戶名稱
    const [message, setMessage] = useState(""); // 留言內容

    const [showIconSelector, setShowIconSelector] = useState(false); // 是否顯示 icon 選擇框
    const [userIcon, setUserIcon] = useState("user000.png"); // icon id
    const userIcons = Array.from({ length: 136 }, (_, i) => `user${String(i).padStart(3, "0")}.png`);

    const commentsPerPage = 20; // 每頁顯示 20 則留言
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(comments.length / commentsPerPage);

    const displayedComments = comments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);

    useEffect(() => {
        const commentsRef = ref(db, "comments");

        // 監聽 Firebase 的留言變化
        const unsubscribe = onValue(commentsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const commentArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setComments(commentArray.reverse()); // 最新的留言顯示在上方
            } else {
                setComments([]);
            }
        });

        return () => unsubscribe(); // 移除監聽，避免記憶體洩漏
    }, []);

    // 處理留言提交
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim() || !message.trim()) {
            alert("請填寫暱稱和留言內容！");
            return;
        }

        if (message.length > 500) {
            alert("留言內容不能超過500個字元！");
            return;
        }

        const commentsRef = ref(db, "comments");

        if (username === "richiiadmin") {
            push(commentsRef, {
                username: "Admin",
                text: message,
                timestamp: Date.now(),
                userIcon: "useradmin.png",
            })
                .then(() => {
                    console.log("留言已提交");
                    setMessage("");
                })
                .catch((error) => {
                    console.error("提交留言失敗:", error);
                });
        } else {
            push(commentsRef, {
                username: username,
                text: message,
                timestamp: Date.now(),
                userIcon: userIcon,
            })
                .then(() => {
                    console.log("留言已提交");
                    setMessage("");
                })
                .catch((error) => {
                    console.error("提交留言失敗:", error);
                });
        }
    };

    const handleIconClick = (icon) => {
        setUserIcon(icon);
        setShowIconSelector(false); // 選擇後關閉彈出視窗
    };

    return (
        <div style={{ maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "clamp(28px, 2vw, 32px)", fontWeight: "bold" }}>留言區</div>

            {/* 留言輸入表單 */}
            <div style={{ marginTop: "20px", display: "inline-flex", width: "100%", maxWidth: "500px", gap: "10px" }}>
                <img
                    src={`${process.env.PUBLIC_URL}/images/${userIcon}`}
                    alt="icon"
                    style={{ width: "50px", height: "50px", borderRadius: "20%", cursor: "pointer", border: "1px solid #888888" }}
                    onClick={() => setShowIconSelector(true)}
                />
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "90%" }}>
                        <input
                            type="text"
                            placeholder="暱稱"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: "50%", padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "5px" }}
                        />
                        <textarea
                            placeholder="留言內容最多500字"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength="500"
                            style={{
                                width: "100%",
                                padding: "10px",
                                fontSize: "16px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                minHeight: "80px",
                                resize: "none",
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                width: "110px",
                                padding: "5px 10px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ fontSize: "16px", fontWeight: "bold" }}>提交留言</div>
                        </button>
                    </div>
                </form>
            </div>

            {/* 頭像選擇框 */}
            {showIconSelector && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // 背景半透明
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={() => setShowIconSelector(false)} // 點擊背景關閉
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "10px",
                            borderRadius: "10px",
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: "5px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()} // 防止點擊內部關閉
                    >
                        {userIcons.map((icon) => (
                            <img
                                key={icon}
                                src={`${process.env.PUBLIC_URL}/images/${icon}`}
                                alt={icon}
                                onClick={() => handleIconClick(icon)}
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "20%",
                                    cursor: "pointer",
                                    border: userIcon === icon ? "3px solid #007bff" : "1px solid #888888",
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: "10px", width: "100%", maxWidth: "500px" }}>
                {displayedComments.map((comment) => (
                    <div
                        key={comment.id}
                        style={{
                            marginTop: "25px",
                            display: "inline-flex",
                            width: "100%",
                            maxWidth: "500px",
                        }}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/${comment.userIcon}`}
                            alt="icon"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "20%",
                                marginRight: "10px",
                                border: "1px solid #888888",
                            }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
                            <div style={{ display: "inline-flex", gap: "15px", alignItems: "flex-end" }}>
                                <div style={{ fontSize: "calc(1.2 * clamp(14px, 2vw, 16px))", fontWeight: "bold" }}>{comment.username}</div>
                                <div style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#555555" }}>{new Date(comment.timestamp).toLocaleString()}</div>
                            </div>
                            <div
                                style={{
                                    fontSize: "calc(1.1 * clamp(14px, 2vw, 16px))",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                    whiteSpace: "normal",
                                    minWidth: 0,
                                }}
                            >
                                {comment.text}
                            </div>
                        </div>
                    </div>
                ))}

                {/* 分頁按鈕 */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "10px" }}>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: "7px 15px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                backgroundColor: currentPage !== 1 ? "#007bff" : "#888888",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                            }}
                        >
                            上一頁
                        </button>
                        {/* 下拉選單 */}
                        <select value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value))} style={{ padding: "5px 10px", cursor: "pointer" }}>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    第 {i + 1} 頁
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: "7px 15px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                backgroundColor: currentPage !== totalPages ? "#007bff" : "#888888",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                            }}
                        >
                            下一頁
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsPage;
