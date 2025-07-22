import jieba
import re
from typing import List, Set, Dict


class TagExtractor:
    def __init__(self):
        # 预定义的分类关键词
        self.category_keywords = {
            "金融": [
                "投资",
                "股票",
                "融资",
                "上市",
                "金融",
                "银行",
                "基金",
                "证券",
                "债券",
                "IPO",
                "并购",
                "收购",
            ],
            "科技": [
                "AI",
                "人工智能",
                "机器学习",
                "深度学习",
                "区块链",
                "云计算",
                "大数据",
                "物联网",
                "5G",
                "算法",
                "芯片",
                "半导体",
            ],
            "创业": [
                "创业",
                "初创",
                "孵化",
                "加速器",
                "种子轮",
                "天使轮",
                "A轮",
                "B轮",
                "C轮",
                "估值",
                "独角兽",
            ],
            "互联网": [
                "互联网",
                "电商",
                "社交",
                "直播",
                "短视频",
                "游戏",
                "在线",
                "平台",
                "APP",
                "网站",
            ],
            "医疗": [
                "医疗",
                "医药",
                "生物",
                "疫苗",
                "药物",
                "临床",
                "健康",
                "医院",
                "诊断",
                "治疗",
            ],
            "教育": [
                "教育",
                "在线教育",
                "培训",
                "学校",
                "大学",
                "课程",
                "学习",
                "教学",
                "知识",
            ],
            "房产": [
                "房地产",
                "楼市",
                "房价",
                "地产",
                "物业",
                "租房",
                "买房",
                "住宅",
                "商业地产",
            ],
            "汽车": [
                "汽车",
                "新能源车",
                "电动车",
                "自动驾驶",
                "车企",
                "造车",
                "汽车制造",
                "车联网",
            ],
            "娱乐": [
                "娱乐",
                "影视",
                "电影",
                "电视剧",
                "综艺",
                "明星",
                "娱乐圈",
                "票房",
                "streaming",
            ],
            "体育": [
                "体育",
                "足球",
                "篮球",
                "奥运",
                "世界杯",
                "比赛",
                "运动员",
                "体育赛事",
            ],
            "政策": ["政策", "法规", "监管", "政府", "法律", "规定", "标准", "合规"],
            "国际": [
                "国际",
                "全球",
                "海外",
                "跨国",
                "国外",
                "美国",
                "欧洲",
                "亚洲",
                "贸易",
                "出海",
            ],
        }

        # 重要性关键词
        self.importance_keywords = {
            "高": [
                "重大",
                "突破",
                "历史性",
                "首次",
                "创纪录",
                "巨额",
                "轰动",
                "震惊",
                "里程碑",
            ],
            "中": ["重要", "显著", "关键", "主要", "核心", "战略", "重点"],
            "低": ["一般", "常规", "普通", "日常", "例行"],
        }

    def extract_tags(self, text: str) -> List[str]:
        """从文本中提取标签"""
        if not text:
            return []

        # 使用jieba分词
        words = jieba.lcut(text)

        # 过滤标点符号和停用词
        words = [word for word in words if len(word) > 1 and word.isalpha()]

        tags = set()

        # 基于关键词匹配提取分类标签
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    tags.add(category)
                    tags.add(keyword)

        # 提取重要的名词和实体
        important_words = self._extract_important_words(text, words)
        tags.update(important_words)

        return list(tags)[:10]  # 限制返回最多10个标签

    def _extract_important_words(self, text: str, words: List[str]) -> Set[str]:
        """提取重要的词汇作为标签"""
        important_words = set()

        # 提取公司名称（简单规则：包含"公司"、"科技"、"集团"等）
        company_patterns = [
            r"[\u4e00-\u9fa5]+(?:公司|科技|集团|企业|有限公司|股份|corp|inc|ltd)",
            r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|Ltd|LLC))",
        ]

        for pattern in company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            important_words.update([match.strip() for match in matches])

        # 提取数字相关信息（金额、百分比等）
        amount_patterns = [
            r"\d+(?:\.\d+)?(?:亿|万|千万|百万)(?:元|美元|人民币)?",
            r"\d+(?:\.\d+)?%",
        ]

        for pattern in amount_patterns:
            matches = re.findall(pattern, text)
            important_words.update(matches)

        # 提取专有名词（长度在2-6字符的中文词汇）
        for word in words:
            if 2 <= len(word) <= 6 and self._is_chinese(word):
                # 过滤常见词汇
                if word not in [
                    "今天",
                    "昨天",
                    "明天",
                    "时候",
                    "地方",
                    "这个",
                    "那个",
                    "什么",
                    "怎么",
                ]:
                    important_words.add(word)

        return important_words

    def _is_chinese(self, text: str) -> bool:
        """判断是否为中文"""
        return bool(re.match(r"^[\u4e00-\u9fa5]+$", text))

    def get_category(self, tags: List[str]) -> str:
        """根据标签推断主要分类"""
        category_scores: Dict[str, int] = {}

        for tag in tags:
            for category, keywords in self.category_keywords.items():
                if tag in keywords or tag == category:
                    category_scores[category] = category_scores.get(category, 0) + 1

        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]

        return "其他"

    def get_importance_score(self, text: str) -> int:
        """评估事件重要性评分 (1-10)"""
        text_lower = text.lower()

        score = 5  # 基础分数

        for level, keywords in self.importance_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if level == "高":
                        score += 3
                    elif level == "中":
                        score += 1
                    elif level == "低":
                        score -= 1

        # 根据数字大小调整分数
        amounts = re.findall(r"(\d+(?:\.\d+)?)(?:亿|万)", text)
        if amounts:
            max_amount = max([float(amount) for amount in amounts])
            if "亿" in text:
                if max_amount >= 100:
                    score += 3
                elif max_amount >= 10:
                    score += 2
                elif max_amount >= 1:
                    score += 1

        return min(10, max(1, score))
