export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: number;
  name_en: string;
  name_cn: string;
  suit: Suit;
  image_url: string;
  meaning_upright: string[];
  meaning_reversed: string[];
  description: string;
}

// Helper function to format single digit numbers with leading zero
const f = (n: number) => n.toString().padStart(2, '0');

export const tarotDeck: TarotCard[] = [
  // --- Major Arcana (0-21) ---
  {
    id: 0,
    name_en: "The Fool",
    name_cn: "愚人",
    suit: "major",
    image_url: "/major/00_the_Fool.webp",
    meaning_upright: ["新的开始", "冒险", "天真", "信仰之跃"],
    meaning_reversed: ["鲁莽", "轻率", "被利用", "盲目"],
    description: "年轻人站在悬崖边，充满希望地望向天空，脚下有白狗相伴。象征纯粹的潜能和未知旅程。"
  },
  {
    id: 1,
    name_en: "The Magician",
    name_cn: "魔术师",
    suit: "major",
    image_url: "/major/01_the_Magician.webp", // 假设文件名规则一致，如果找不到图可能是大小写问题，这里我猜测是统一的
    meaning_upright: ["创造力", "技能", "意志力", "显化"],
    meaning_reversed: ["欺骗", "操纵", "才能被埋没"],
    description: "魔术师一手指天一手指地，桌上摆放四元素圣器。象征将精神力量转化为现实。"
  },
  {
    id: 2,
    name_en: "The High Priestess",
    name_cn: "女祭司",
    suit: "major",
    image_url: "/major/02_the_High_Priestess.webp",
    meaning_upright: ["直觉", "潜意识", "神秘", "内在智慧"],
    meaning_reversed: ["秘密揭露", "忽视直觉", "情感压抑"],
    description: "她坐在黑白柱子间，手持卷轴，身后是石榴帷幕。守护潜意识秘密和直觉智慧。"
  },
  {
    id: 3,
    name_en: "The Empress",
    name_cn: "皇后",
    suit: "major",
    image_url: "/major/03_the_Empress.webp",
    meaning_upright: ["丰饶", "母性", "自然", "创造力"],
    meaning_reversed: ["依赖", "创造力受阻", "空虚"],
    description: "皇后坐在豪华垫子上，周围是森林河流。代表大自然丰盛和生命孕育。"
  },
  {
    id: 4,
    name_en: "The Emperor",
    name_cn: "皇帝",
    suit: "major",
    image_url: "/major/04_the_Emperor.webp",
    meaning_upright: ["权威", "结构", "控制", "父性"],
    meaning_reversed: ["暴政", "僵化", "滥用权力"],
    description: "皇帝坐石座，持权杖金球。象征世俗秩序、规则和权威。"
  },
  {
    id: 5,
    name_en: "The Hierophant",
    name_cn: "教皇",
    suit: "major",
    image_url: "/major/05_the_Hierophant.webp",
    meaning_upright: ["传统", "信仰", "教育", "精神指引"],
    meaning_reversed: ["挑战传统", "反叛", "虚伪建议"],
    description: "教皇坐两柱间，祝福信徒。代表社会规范、传统价值观和精神教育。"
  },
  {
    id: 6,
    name_en: "The Lovers",
    name_cn: "恋人",
    suit: "major",
    image_url: "/major/06_the_Lovers.webp",
    meaning_upright: ["爱", "和谐", "选择", "价值观对齐"],
    meaning_reversed: ["不和谐", "分离", "错误选择"],
    description: "天使祝福亚当夏娃。代表爱情、道德选择和价值观结合。"
  },
  {
    id: 7,
    name_en: "The Chariot",
    name_cn: "战车",
    suit: "major",
    image_url: "/major/07_the_Chariot.webp",
    meaning_upright: ["胜利", "意志力", "自律", "克服障碍"],
    meaning_reversed: ["失控", "攻击性", "缺乏方向"],
    description: "勇士驾驭黑白斯芬克斯战车。靠意志力驾驭对立力量冲向胜利。"
  },
  {
    id: 8,
    name_en: "Strength",
    name_cn: "力量",
    suit: "major",
    image_url: "/major/08_Strength.webp",
    meaning_upright: ["勇气", "耐心", "同情心", "柔性控制"],
    meaning_reversed: ["自我怀疑", "软弱", "冲动"],
    description: "女子温柔抚摸狮子。以柔克刚、内在力量战胜兽性。"
  },
  {
    id: 9,
    name_en: "The Hermit",
    name_cn: "隐士",
    suit: "major",
    image_url: "/major/09_the_Hermit.webp",
    meaning_upright: ["内省", "孤独", "寻求真理", "指引"],
    meaning_reversed: ["孤立", "拒绝建议", "迷失"],
    description: "老人站雪山顶提灯。远离尘世寻找内心光芒。"
  },
  {
    id: 10,
    name_en: "Wheel of Fortune",
    name_cn: "命运之轮",
    suit: "major",
    image_url: "/major/10_Wheel_of_Fortune.webp",
    meaning_upright: ["业力", "命运转折", "周期", "变化"],
    meaning_reversed: ["厄运", "抵抗变化", "恶性循环"],
    description: "轮盘悬浮空中，周围四活物。象征命运不可预测和生命周期。"
  },
  {
    id: 11,
    name_en: "Justice",
    name_cn: "正义",
    suit: "major",
    image_url: "/major/11_Justice.webp",
    meaning_upright: ["公正", "真理", "因果", "法律"],
    meaning_reversed: ["不公", "偏见", "逃避责任"],
    description: "正义女神持剑与天平。代表绝对公平、理性和因果。"
  },
  {
    id: 12,
    name_en: "The Hanged Man",
    name_cn: "倒吊人",
    suit: "major",
    image_url: "/major/12_the_Hanged_Man.webp",
    meaning_upright: ["牺牲", "新视角", "暂停", "放手"],
    meaning_reversed: ["无谓牺牲", "停滞", "抗拒"],
    description: "人倒吊树上头顶有光。通过自愿牺牲和转换视角获得智慧。"
  },
  {
    id: 13,
    name_en: "Death",
    name_cn: "死神",
    suit: "major",
    image_url: "/major/13_Death.webp",
    meaning_upright: ["结束", "转变", "重生", "放手"],
    meaning_reversed: ["抗拒改变", "停滞", "腐朽"],
    description: "骷髅骑士踏过尸体。不代表肉体死亡，而是旧事物终结和新生。"
  },
  {
    id: 14,
    name_en: "Temperance",
    name_cn: "节制",
    suit: "major",
    image_url: "/major/14_Temperance.webp",
    meaning_upright: ["平衡", "适度", "耐心", "调和"],
    meaning_reversed: ["失衡", "过度", "缺乏远见"],
    description: "天使混合两杯水。象征对立面融合、炼金术般转化。"
  },
  {
    id: 15,
    name_en: "The Devil",
    name_cn: "恶魔",
    suit: "major",
    image_url: "/major/15_the_Devil.webp",
    meaning_upright: ["束缚", "物质主义", "欲望", "阴影"],
    meaning_reversed: ["打破束缚", "觉醒", "面对阴影"],
    description: "恶魔锁着男女。锁链很松，暗示束缚源于自身恐惧欲望。"
  },
  {
    id: 16,
    name_en: "The Tower",
    name_cn: "高塔",
    suit: "major",
    image_url: "/major/16_the_Tower.webp",
    meaning_upright: ["灾难", "剧变", "觉醒", "毁灭"],
    meaning_reversed: ["避免灾难", "推迟改变", "内耗"],
    description: "闪电击中高塔。建立在虚假基础上的信念被摧毁。"
  },
  {
    id: 17,
    name_en: "The Star",
    name_cn: "星星",
    suit: "major",
    image_url: "/major/17_the_Star.webp",
    meaning_upright: ["希望", "灵感", "宁静", "疗愈"],
    meaning_reversed: ["绝望", "缺乏信心", "断连"],
    description: "女子在星空下倒水。高塔毁灭后的希望，宁静治愈。"
  },
  {
    id: 18,
    name_en: "The Moon",
    name_cn: "月亮",
    suit: "major",
    image_url: "/major/18_the_Moon.webp",
    meaning_upright: ["幻觉", "恐惧", "潜意识", "不确定"],
    meaning_reversed: ["清晰", "揭露真相", "释放恐惧"],
    description: "月亮下龙虾爬出，狗狼长嚎。象征黑夜迷茫和潜意识浮现。"
  },
  {
    id: 19,
    name_en: "The Sun",
    name_cn: "太阳",
    suit: "major",
    image_url: "/major/19_the_Sun.webp",
    meaning_upright: ["快乐", "成功", "活力", "真相"],
    meaning_reversed: ["悲伤", "过度乐观", "延迟成功"],
    description: "孩子骑马欢笑。最积极的牌，纯粹快乐和生命力。"
  },
  {
    id: 20,
    name_en: "Judgement",
    name_cn: "审判",
    suit: "major",
    image_url: "/major/20_Judgement.webp",
    meaning_upright: ["复活", "觉醒", "召唤", "宽恕"],
    meaning_reversed: ["自我怀疑", "拒绝召唤", "后悔"],
    description: "天使吹号，死者复活。灵魂觉醒，响应更高召唤。"
  },
  {
    id: 21,
    name_en: "The World",
    name_cn: "世界",
    suit: "major",
    image_url: "/major/21_the_World.webp",
    meaning_upright: ["完成", "整合", "成就", "圆满"],
    meaning_reversed: ["未完成", "停滞", "缺乏闭环"],
    description: "女子在花环起舞。旅程终点，元素统合无限循环。"
  },
  
  // --- Wands (权杖) ---
  ...Array.from({ length: 14 }).map((_, i) => {
    const num = i + 1;
    const names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
    const namesCn = ["权杖一", "权杖二", "权杖三", "权杖四", "权杖五", "权杖六", "权杖七", "权杖八", "权杖九", "权杖十", "权杖侍从", "权杖骑士", "权杖王后", "权杖国王"];
    return {
        id: 22 + i,
        name_en: `${names[i]} of Wands`,
        name_cn: namesCn[i],
        suit: "wands" as Suit,
        image_url: `/wands/Wands${f(num)}.webp`,
        meaning_upright: ["行动", "热情", "创造力"], // 简化版，真实解读靠AI
        meaning_reversed: ["延迟", "缺乏方向", "冲动"],
        description: `${namesCn[i]}，画面描绘了权杖元素的能量。`
    };
  }),

  // --- Cups (圣杯) ---
  ...Array.from({ length: 14 }).map((_, i) => {
    const num = i + 1;
    const names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
    const namesCn = ["圣杯一", "圣杯二", "圣杯三", "圣杯四", "圣杯五", "圣杯六", "圣杯七", "圣杯八", "圣杯九", "圣杯十", "圣杯侍从", "圣杯骑士", "圣杯王后", "圣杯国王"];
    return {
        id: 36 + i,
        name_en: `${names[i]} of Cups`,
        name_cn: namesCn[i],
        suit: "cups" as Suit,
        image_url: `/Cups/Cups${f(num)}.webp`, // 注意这里是大写 Cups
        meaning_upright: ["情感", "爱", "直觉"], 
        meaning_reversed: ["情感压抑", "情绪化", "空虚"],
        description: `${namesCn[i]}，画面描绘了圣杯元素的能量。`
    };
  }),

  // --- Swords (宝剑) ---
  ...Array.from({ length: 14 }).map((_, i) => {
    const num = i + 1;
    const names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
    const namesCn = ["宝剑一", "宝剑二", "宝剑三", "宝剑四", "宝剑五", "宝剑六", "宝剑七", "宝剑八", "宝剑九", "宝剑十", "宝剑侍从", "宝剑骑士", "宝剑王后", "宝剑国王"];
    return {
        id: 50 + i,
        name_en: `${names[i]} of Swords`,
        name_cn: namesCn[i],
        suit: "swords" as Suit,
        image_url: `/Swords/Swords${f(num)}.webp`, // 注意这里是大写 Swords
        meaning_upright: ["理智", "真理", "挑战"], 
        meaning_reversed: ["混乱", "残忍", "精神压力"],
        description: `${namesCn[i]}，画面描绘了宝剑元素的能量。`
    };
  }),

  // --- Pentacles (星币) ---
  ...Array.from({ length: 14 }).map((_, i) => {
    const num = i + 1;
    const names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
    const namesCn = ["星币一", "星币二", "星币三", "星币四", "星币五", "星币六", "星币七", "星币八", "星币九", "星币十", "星币侍从", "星币骑士", "星币王后", "星币国王"];
    return {
        id: 64 + i,
        name_en: `${names[i]} of Pentacles`,
        name_cn: namesCn[i],
        suit: "pentacles" as Suit,
        image_url: `/Pentacles/Pents${f(num)}.webp`, // 注意这里是大写 Pentacles 且前缀是 Pents
        meaning_upright: ["物质", "繁荣", "实用"], 
        meaning_reversed: ["贪婪", "贫穷", "浪费"],
        description: `${namesCn[i]}，画面描绘了星币元素的能量。`
    };
  })
];
