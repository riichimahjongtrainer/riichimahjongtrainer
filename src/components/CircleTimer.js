const CircleTimer = ({ timeLeft, timeLimit, isUnlimited, size = 120 }) => {
    const radius = size / 2 - 10; // 計算半徑，確保圓環不超出範圍
    const strokeWidth = size / 15; // 讓圓環寬度跟著大小變化
    const circumference = 2 * Math.PI * radius; // 圓周長
    const progress = (timeLeft / timeLimit) * circumference;

    const circleColor = timeLeft > timeLimit * 0.5 ? "#4CAF50" : timeLeft > timeLimit * 0.2 ? "#FFC107" : "#F44336";

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* 背景圓 */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#DDD" strokeWidth={strokeWidth} />
            {/* 進度圓 */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={circleColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`} // 讓計時從上方開始
            />
            {/* 倒數時間文字 */}
            <text x="50%" y="55%" textAnchor="middle" fontWeight="bold" fill="#333">
                {isUnlimited ? (
                    <tspan fontSize={size * 0.5} dy="8">
                        ∞
                    </tspan> // 只調整無限符號的大小和位置
                ) : (
                    <tspan fontSize={size * 0.2}> {(timeLeft / 1000).toFixed(1)}s </tspan> // 倒數秒數不變
                )}
            </text>
        </svg>
    );
};

export default CircleTimer;
