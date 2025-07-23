from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# 高分存储文件路径
HIGHSCORE_FILE = "highscores.json"


def load_highscores():
    """加载高分记录"""
    if os.path.exists(HIGHSCORE_FILE):
        try:
            with open(HIGHSCORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return []
    return []


def save_highscore(score, player_name="匿名玩家"):
    """保存高分记录"""
    highscores = load_highscores()

    # 添加新记录
    new_record = {
        "score": score,
        "player": player_name,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    highscores.append(new_record)

    # 按分数排序，保留前10名
    highscores = sorted(highscores, key=lambda x: x["score"], reverse=True)[:10]

    # 保存到文件
    with open(HIGHSCORE_FILE, "w", encoding="utf-8") as f:
        json.dump(highscores, f, ensure_ascii=False, indent=2)

    return highscores


@app.route("/")
def index():
    """游戏首页"""
    return render_template("index.html")


@app.route("/api/highscores", methods=["GET"])
def get_highscores():
    """获取高分记录"""
    return jsonify({"success": True, "data": load_highscores()})


@app.route("/api/highscores", methods=["POST"])
def submit_highscore():
    """提交高分记录"""
    try:
        data = request.json
        score = int(data.get("score", 0))
        player_name = data.get("player", "匿名玩家")

        if score < 0:
            return jsonify({"success": False, "error": "分数无效"}), 400

        highscores = save_highscore(score, player_name)

        return jsonify(
            {"success": True, "data": highscores, "message": "高分记录已保存"}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/game-stats")
def game_stats():
    """游戏统计信息"""
    highscores = load_highscores()

    if not highscores:
        return jsonify(
            {
                "success": True,
                "data": {
                    "total_games": 0,
                    "highest_score": 0,
                    "average_score": 0,
                    "total_players": 0,
                },
            }
        )

    total_games = len(highscores)
    highest_score = max(record["score"] for record in highscores)
    average_score = sum(record["score"] for record in highscores) / total_games
    unique_players = len(set(record["player"] for record in highscores))

    return jsonify(
        {
            "success": True,
            "data": {
                "total_games": total_games,
                "highest_score": highest_score,
                "average_score": round(average_score, 1),
                "total_players": unique_players,
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
