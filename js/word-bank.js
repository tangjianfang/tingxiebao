/**
 * 小学生听写宝 — 词库系统
 * 数据来源：人教版语文 1-6 年级高频词汇 + 北师大版补充
 * 每个词条结构：{ word, pinyin, sentence, difficulty, tags }
 */

const WORD_BANK = {
  grade1: {
    label: '一年级',
    color: '#4ade80',
    semester1: [
      { word: '大', pinyin: 'dà', sentence: '大树下面有小草。', difficulty: 1 },
      { word: '小', pinyin: 'xiǎo', sentence: '小鸟在树上唱歌。', difficulty: 1 },
      { word: '山', pinyin: 'shān', sentence: '山上的雪很白。', difficulty: 1 },
      { word: '水', pinyin: 'shuǐ', sentence: '清清的水流过石头。', difficulty: 1 },
      { word: '火', pinyin: 'huǒ', sentence: '火焰跳跃着发光。', difficulty: 1 },
      { word: '土', pinyin: 'tǔ', sentence: '土地里长出了庄稼。', difficulty: 1 },
      { word: '木', pinyin: 'mù', sentence: '木头可以做成家具。', difficulty: 1 },
      { word: '人', pinyin: 'rén', sentence: '人们在广场上跳舞。', difficulty: 1 },
      { word: '手', pinyin: 'shǒu', sentence: '我的手很干净。', difficulty: 1 },
      { word: '口', pinyin: 'kǒu', sentence: '用口说话，用手写字。', difficulty: 1 },
      { word: '目', pinyin: 'mù', sentence: '他目不转睛地看着。', difficulty: 1 },
      { word: '耳', pinyin: 'ěr', sentence: '耳朵能听见声音。', difficulty: 1 },
      { word: '日', pinyin: 'rì', sentence: '太阳是一个大火球。', difficulty: 1 },
      { word: '月', pinyin: 'yuè', sentence: '月亮照亮了夜空。', difficulty: 1 },
      { word: '上', pinyin: 'shàng', sentence: '猫跳上了桌子。', difficulty: 1 },
      { word: '下', pinyin: 'xià', sentence: '雨从天上落下来。', difficulty: 1 },
      { word: '左', pinyin: 'zuǒ', sentence: '往左走就是学校。', difficulty: 1 },
      { word: '右', pinyin: 'yòu', sentence: '右边有一棵大树。', difficulty: 1 },
      { word: '中', pinyin: 'zhōng', sentence: '中间的位置留给你。', difficulty: 1 },
      { word: '里', pinyin: 'lǐ', sentence: '箱子里有很多书。', difficulty: 1 },
    ],
    semester2: [
      { word: '春', pinyin: 'chūn', sentence: '春天，花儿都开了。', difficulty: 1 },
      { word: '夏', pinyin: 'xià', sentence: '夏天的太阳很热。', difficulty: 1 },
      { word: '秋', pinyin: 'qiū', sentence: '秋天叶子变黄了。', difficulty: 1 },
      { word: '冬', pinyin: 'dōng', sentence: '冬天，北方会下雪。', difficulty: 1 },
      { word: '东', pinyin: 'dōng', sentence: '太阳从东方升起。', difficulty: 1 },
      { word: '南', pinyin: 'nán', sentence: '小燕子去南方过冬。', difficulty: 1 },
      { word: '西', pinyin: 'xī', sentence: '西边的天空有晚霞。', difficulty: 1 },
      { word: '北', pinyin: 'běi', sentence: '北风吹来，天气变冷了。', difficulty: 1 },
      { word: '红', pinyin: 'hóng', sentence: '红色的苹果又大又甜。', difficulty: 1 },
      { word: '黄', pinyin: 'huáng', sentence: '金黄的麦田随风飘动。', difficulty: 1 },
      { word: '蓝', pinyin: 'lán', sentence: '蓝天上飘着白云。', difficulty: 1 },
      { word: '白', pinyin: 'bái', sentence: '白雪覆盖了山野。', difficulty: 1 },
      { word: '绿', pinyin: 'lǜ', sentence: '绿色的草地非常漂亮。', difficulty: 2 },
      { word: '黑', pinyin: 'hēi', sentence: '黑夜中星星在闪烁。', difficulty: 1 },
      { word: '花', pinyin: 'huā', sentence: '花园里开着五颜六色的花。', difficulty: 1 },
      { word: '草', pinyin: 'cǎo', sentence: '小草在风中摇摆。', difficulty: 1 },
      { word: '鱼', pinyin: 'yú', sentence: '鱼儿在水中自由游动。', difficulty: 1 },
      { word: '鸟', pinyin: 'niǎo', sentence: '鸟儿站在枝头唱歌。', difficulty: 1 },
      { word: '虫', pinyin: 'chóng', sentence: '小虫子在树叶上爬。', difficulty: 1 },
      { word: '马', pinyin: 'mǎ', sentence: '一匹马在草原上奔跑。', difficulty: 1 },
    ]
  },

  grade2: {
    label: '二年级',
    color: '#60a5fa',
    semester1: [
      { word: '平静', pinyin: 'píng jìng', sentence: '湖面平静，像一面镜子。', difficulty: 2 },
      { word: '快乐', pinyin: 'kuài lè', sentence: '童年是快乐的时光。', difficulty: 2 },
      { word: '桂花', pinyin: 'guì huā', sentence: '院子里的桂花香气扑鼻。', difficulty: 2 },
      { word: '喜爱', pinyin: 'xǐ ài', sentence: '我喜爱读书和写字。', difficulty: 2 },
      { word: '清晨', pinyin: 'qīng chén', sentence: '清晨，鸟儿开始歌唱。', difficulty: 2 },
      { word: '露水', pinyin: 'lù shuǐ', sentence: '早晨的叶子上有露水。', difficulty: 2 },
      { word: '美丽', pinyin: 'měi lì', sentence: '这里的风景非常美丽。', difficulty: 2 },
      { word: '蜻蜓', pinyin: 'qīng tíng', sentence: '蜻蜓在荷叶上停留。', difficulty: 2 },
      { word: '荷花', pinyin: 'hé huā', sentence: '夏天的荷花洁白清香。', difficulty: 2 },
      { word: '欢笑', pinyin: 'huān xiào', sentence: '孩子们的欢笑声传来。', difficulty: 2 },
      { word: '波浪', pinyin: 'bō làng', sentence: '海面上波浪滚滚。', difficulty: 2 },
      { word: '金色', pinyin: 'jīn sè', sentence: '秋天的树叶变成金色。', difficulty: 2 },
      { word: '摇篮', pinyin: 'yáo lán', sentence: '妈妈轻轻摇动摇篮。', difficulty: 2 },
      { word: '勤劳', pinyin: 'qín láo', sentence: '勤劳的农民早起耕地。', difficulty: 2 },
      { word: '节日', pinyin: 'jié rì', sentence: '节日里家家张灯结彩。', difficulty: 2 },
      { word: '礼貌', pinyin: 'lǐ mào', sentence: '礼貌待人是好习惯。', difficulty: 2 },
      { word: '热闹', pinyin: 'rè nào', sentence: '集市上非常热闹。', difficulty: 2 },
      { word: '景色', pinyin: 'jǐng sè', sentence: '公园里的景色很美。', difficulty: 2 },
      { word: '彩虹', pinyin: 'cǎi hóng', sentence: '雨后天空出现了彩虹。', difficulty: 2 },
      { word: '温暖', pinyin: 'wēn nuǎn', sentence: '阳光照在身上很温暖。', difficulty: 2 },
    ],
    semester2: [
      { word: '回家', pinyin: 'huí jiā', sentence: '放学后我们一起回家。', difficulty: 2 },
      { word: '雷雨', pinyin: 'léi yǔ', sentence: '夏天常常有雷雨天气。', difficulty: 2 },
      { word: '翠绿', pinyin: 'cuì lǜ', sentence: '雨后树叶更加翠绿。', difficulty: 2 },
      { word: '铁路', pinyin: 'tiě lù', sentence: '铁路在山间穿越。', difficulty: 2 },
      { word: '说话', pinyin: 'shuō huà', sentence: '请小声说话，不要影响别人。', difficulty: 2 },
      { word: '劳动', pinyin: 'láo dòng', sentence: '劳动创造了美好生活。', difficulty: 2 },
      { word: '诚实', pinyin: 'chéng shí', sentence: '诚实是最好的品德。', difficulty: 2 },
      { word: '种子', pinyin: 'zhǒng zi', sentence: '把种子播种到泥土里。', difficulty: 2 },
      { word: '成长', pinyin: 'chéng zhǎng', sentence: '我们在读书中成长。', difficulty: 2 },
      { word: '保护', pinyin: 'bǎo hù', sentence: '我们要保护环境。', difficulty: 2 },
    ]
  },

  grade3: {
    label: '三年级',
    color: '#f472b6',
    semester1: [
      { word: '碧绿', pinyin: 'bì lǜ', sentence: '湖水碧绿，清澈见底。', difficulty: 3 },
      { word: '倒映', pinyin: 'dào yìng', sentence: '白塔倒映在水面上。', difficulty: 3 },
      { word: '飘扬', pinyin: 'piāo yáng', sentence: '国旗在风中飘扬。', difficulty: 3 },
      { word: '宽阔', pinyin: 'kuān kuò', sentence: '宽阔的广场上人来人往。', difficulty: 3 },
      { word: '纪念', pinyin: 'jì niàn', sentence: '这张照片是珍贵的纪念。', difficulty: 3 },
      { word: '荒野', pinyin: 'huāng yě', sentence: '探险队穿越了荒野。', difficulty: 3 },
      { word: '温柔', pinyin: 'wēn róu', sentence: '妈妈的声音温柔又亲切。', difficulty: 3 },
      { word: '勇敢', pinyin: 'yǒng gǎn', sentence: '消防员是勇敢的人。', difficulty: 3 },
      { word: '奇妙', pinyin: 'qí miào', sentence: '大自然的奥秘真奇妙。', difficulty: 3 },
      { word: '蒸腾', pinyin: 'zhēng téng', sentence: '水分蒸腾到空气中。', difficulty: 3 },
      { word: '灌溉', pinyin: 'guàn gài', sentence: '引水灌溉农田。', difficulty: 3 },
      { word: '汇聚', pinyin: 'huì jù', sentence: '小溪汇聚成大河。', difficulty: 3 },
      { word: '朦胧', pinyin: 'méng lóng', sentence: '早晨的山峦朦胧迷人。', difficulty: 3 },
      { word: '凉爽', pinyin: 'liáng shuǎng', sentence: '秋天的天气凉爽宜人。', difficulty: 3 },
      { word: '壮观', pinyin: 'zhuàng guān', sentence: '沙漠日出十分壮观。', difficulty: 3 },
      { word: '富饶', pinyin: 'fù ráo', sentence: '南海是一片富饶的海域。', difficulty: 3 },
      { word: '珊瑚', pinyin: 'shān hú', sentence: '海底的珊瑚色彩缤纷。', difficulty: 3 },
      { word: '海螺', pinyin: 'hǎi luó', sentence: '海姑螺放在耳边能听到海浪声。', difficulty: 3 },
      { word: '渔船', pinyin: 'yú chuán', sentence: '渔船清晨出海捕鱼。', difficulty: 3 },
      { word: '棉被', pinyin: 'mián bèi', sentence: '妈妈给我盖上棉被。', difficulty: 3 },
    ],
    semester2: [
      { word: '燕子', pinyin: 'yàn zi', sentence: '春天燕子从南方飞回来了。', difficulty: 2 },
      { word: '似乎', pinyin: 'sì hū', sentence: '他似乎知道了答案。', difficulty: 3 },
      { word: '停歇', pinyin: 'tíng xiē', sentence: '工人们从未停歇地工作。', difficulty: 3 },
      { word: '聚拢', pinyin: 'jù lǒng', sentence: '同学们聚拢在一起讨论。', difficulty: 3 },
      { word: '荡漾', pinyin: 'dàng yàng', sentence: '春风吹来，湖面荡漾。', difficulty: 3 },
      { word: '偶尔', pinyin: 'ǒu ěr', sentence: '他偶尔会来图书馆读书。', difficulty: 3 },
      { word: '探索', pinyin: 'tàn suǒ', sentence: '科学家不断探索宇宙的奥秘。', difficulty: 3 },
      { word: '辽阔', pinyin: 'liáo kuò', sentence: '辽阔的草原一望无边。', difficulty: 3 },
      { word: '清澈', pinyin: 'qīng chè', sentence: '清澈的溪水倒映着蓝天。', difficulty: 3 },
      { word: '奔腾', pinyin: 'bēn téng', sentence: '黄河的水奔腾向前。', difficulty: 3 },
    ]
  },

  grade4: {
    label: '四年级',
    color: '#fb923c',
    semester1: [
      { word: '波澜壮阔', pinyin: 'bō lán zhuàng kuò', sentence: '大海的景色波澜壮阔。', difficulty: 4 },
      { word: '翻滚', pinyin: 'fān gǔn', sentence: '乌云翻滚，暴风雨要来了。', difficulty: 3 },
      { word: '观潮', pinyin: 'guān cháo', sentence: '每年中秋，人们去钱塘观潮。', difficulty: 3 },
      { word: '横贯', pinyin: 'héng guàn', sentence: '大堤横贯钱塘。', difficulty: 4 },
      { word: '崩裂', pinyin: 'bēng liè', sentence: '地震导致山石崩裂。', difficulty: 4 },
      { word: '依赖', pinyin: 'yī lài', sentence: '人类不能过度依赖自然。', difficulty: 3 },
      { word: '顽皮', pinyin: 'wán pí', sentence: '小猫顽皮地追逐毛线球。', difficulty: 3 },
      { word: '鹅卵石', pinyin: 'é luǎn shí', sentence: '河床铺满了鹅卵石。', difficulty: 3 },
      { word: '篝火', pinyin: 'gōu huǒ', sentence: '夜晚我们围着篝火唱歌。', difficulty: 4 },
      { word: '漫步', pinyin: 'màn bù', sentence: '我们沿着湖边漫步。', difficulty: 3 },
      { word: '欣赏', pinyin: 'xīn shǎng', sentence: '我们欣赏着美丽的风景。', difficulty: 3 },
      { word: '灵动', pinyin: 'líng dòng', sentence: '活泼灵动的小鱼在水中游。', difficulty: 4 },
      { word: '倾斜', pinyin: 'qīng xié', sentence: '铁塔慢慢倾斜，最终倒塌。', difficulty: 4 },
      { word: '震惊', pinyin: 'zhèn jīng', sentence: '惊人的消息让大家震惊。', difficulty: 3 },
      { word: '慷慨', pinyin: 'kāng kǎi', sentence: '他慷慨地捐出了积蓄。', difficulty: 4 },
      { word: '咆哮', pinyin: 'páo xiào', sentence: '洪水咆哮着冲过峡谷。', difficulty: 4 },
      { word: '呼啸', pinyin: 'hū xiào', sentence: '寒风呼啸，天气骤降。', difficulty: 4 },
      { word: '安慰', pinyin: 'ān wèi', sentence: '同学用温暖的话安慰她。', difficulty: 3 },
      { word: '闪烁', pinyin: 'shǎn shuò', sentence: '繁星在夜空中闪烁。', difficulty: 3 },
      { word: '寂静', pinyin: 'jì jìng', sentence: '深夜，四周一片寂静。', difficulty: 3 },
    ],
    semester2: [
      { word: '叮咛', pinyin: 'dīng níng', sentence: '母亲的叮咛让我记住了一生。', difficulty: 4 },
      { word: '懊悔', pinyin: 'ào huǐ', sentence: '他为自己的错误感到懊悔。', difficulty: 4 },
      { word: '蔓延', pinyin: 'màn yán', sentence: '火焰沿着枯草蔓延。', difficulty: 4 },
      { word: '踪迹', pinyin: 'zōng jì', sentence: '他悄然离去，不留踪迹。', difficulty: 4 },
      { word: '一望无际', pinyin: 'yī wàng wú jì', sentence: '内蒙草原一望无际。', difficulty: 4 },
      { word: '迂回', pinyin: 'yū huí', sentence: '河流迂回穿过平原。', difficulty: 4 },
      { word: '奇峰罗列', pinyin: 'qí fēng luó liè', sentence: '桂林山水奇峰罗列。', difficulty: 4 },
      { word: '连绵不断', pinyin: 'lián mián bù duàn', sentence: '山脉连绵不断向远方延伸。', difficulty: 4 },
      { word: '随心所欲', pinyin: 'suí xīn suǒ yù', sentence: '他随心所欲地涂鸦着。', difficulty: 4 },
      { word: '浩如烟海', pinyin: 'hào rú yān hǎi', sentence: '历史文献浩如烟海。', difficulty: 4 },
    ]
  },

  grade5: {
    label: '五年级',
    color: '#a78bfa',
    semester1: [
      { word: '迸溅', pinyin: 'bèng jiàn', sentence: '火花四处迸溅。', difficulty: 5 },
      { word: '繁密', pinyin: 'fán mì', sentence: '树林繁密，遮住了阳光。', difficulty: 4 },
      { word: '沉淀', pinyin: 'chén diàn', sentence: '经历让他更加沉淀内心。', difficulty: 4 },
      { word: '劲头', pinyin: 'jìn tóu', sentence: '孩子们干活的劲头十足。', difficulty: 4 },
      { word: '鼓舞', pinyin: 'gǔ wǔ', sentence: '老师的话激励和鼓舞了大家。', difficulty: 4 },
      { word: '威风凛凛', pinyin: 'wēi fēng lǐn lǐn', sentence: '将军威风凛凛地站在台上。', difficulty: 5 },
      { word: '浑然天成', pinyin: 'hún rán tiān chéng', sentence: '这幅画浑然天成，不露雕琢。', difficulty: 5 },
      { word: '赏心悦目', pinyin: 'shǎng xīn yuè mù', sentence: '美丽的风景令人赏心悦目。', difficulty: 5 },
      { word: '峰峦雄伟', pinyin: 'fēng luán xióng wěi', sentence: '泰山峰峦雄伟，令人叹服。', difficulty: 5 },
      { word: '险峻', pinyin: 'xiǎn jùn', sentence: '华山地势险峻，难以攀登。', difficulty: 5 },
      { word: '蜿蜒', pinyin: 'wān yán', sentence: '长城蜿蜒在山岭之间。', difficulty: 5 },
      { word: '凝聚', pinyin: 'níng jù', sentence: '这部作品凝聚了他多年的心血。', difficulty: 4 },
      { word: '璀璨', pinyin: 'cuǐ càn', sentence: '夜空中繁星璀璨。', difficulty: 5 },
      { word: '震撼', pinyin: 'zhèn hàn', sentence: '交响乐的演奏令人震撼。', difficulty: 4 },
      { word: '悲哀', pinyin: 'bēi āi', sentence: '失去树木是大自然的悲哀。', difficulty: 4 },
      { word: '豁然开朗', pinyin: 'huò rán kāi lǎng', sentence: '推开门，眼前豁然开朗。', difficulty: 5 },
      { word: '花团锦簇', pinyin: 'huā tuán jǐn cù', sentence: '花坛里花团锦簇，美不胜收。', difficulty: 5 },
      { word: '山穷水尽', pinyin: 'shān qióng shuǐ jìn', sentence: '旅人走到山穷水尽，绝望之际。', difficulty: 5 },
      { word: '柔和', pinyin: 'róu hé', sentence: '月光柔和地洒在地上。', difficulty: 4 },
      { word: '轻盈', pinyin: 'qīng yíng', sentence: '蝴蝶轻盈地飞过花丛。', difficulty: 4 },
    ],
    semester2: [
      { word: '唯恐', pinyin: 'wéi kǒng', sentence: '他唯恐迟到，早早出发。', difficulty: 5 },
      { word: '漫漫', pinyin: 'màn màn', sentence: '漫漫长夜终会过去。', difficulty: 4 },
      { word: '矜持', pinyin: 'jīn chí', sentence: '她矜持地微笑着。', difficulty: 5 },
      { word: '凛然', pinyin: 'lǐn rán', sentence: '英雄凛然正气，不畏强暴。', difficulty: 5 },
      { word: '精湛', pinyin: 'jīng zhàn', sentence: '工匠的技艺精湛绝伦。', difficulty: 5 },
      { word: '屹立', pinyin: 'yì lì', sentence: '纪念碑屹立在广场中央。', difficulty: 5 },
      { word: '辽远', pinyin: 'liáo yuǎn', sentence: '辽远的天际传来鹰鸣。', difficulty: 5 },
      { word: '毅然', pinyin: 'yì rán', sentence: '他毅然决定放弃高薪去支教。', difficulty: 5 },
      { word: '锲而不舍', pinyin: 'qiè ér bù shě', sentence: '锲而不舍，终能成功。', difficulty: 5 },
      { word: '融为一体', pinyin: 'róng wéi yī tǐ', sentence: '艺术与科技融为一体。', difficulty: 5 },
    ]
  },

  grade6: {
    label: '六年级',
    color: '#f87171',
    semester1: [
      { word: '流逝', pinyin: 'liú shì', sentence: '岁月流逝，童年难再回。', difficulty: 5 },
      { word: '憧憬', pinyin: 'chōng jǐng', sentence: '孩子们对未来充满憧憬。', difficulty: 6 },
      { word: '索然无味', pinyin: 'suǒ rán wú wèi', sentence: '缺少变化的内容令人索然无味。', difficulty: 6 },
      { word: '永恒', pinyin: 'yǒng héng', sentence: '经典作品的价值是永恒的。', difficulty: 5 },
      { word: '弥漫', pinyin: 'mí màn', sentence: '晨雾弥漫在山谷之间。', difficulty: 5 },
      { word: '轮廓', pinyin: 'lún kuò', sentence: '远山的轮廓在云雾中若隐若现。', difficulty: 5 },
      { word: '惆怅', pinyin: 'chóu chàng', sentence: '离别时，心中充满惆怅。', difficulty: 6 },
      { word: '恳切', pinyin: 'kěn qiē', sentence: '老师恳切地希望大家努力。', difficulty: 5 },
      { word: '浸润', pinyin: 'jìn rùn', sentence: '书香浸润了我们的成长岁月。', difficulty: 6 },
      { word: '凄凉', pinyin: 'qī liáng', sentence: '落叶飘零，秋风凄凉。', difficulty: 5 },
      { word: '辗转反侧', pinyin: 'zhǎn zhuǎn fǎn cè', sentence: '他辗转反侧，彻夜难眠。', difficulty: 6 },
      { word: '排山倒海', pinyin: 'pái shān dǎo hǎi', sentence: '战士们以排山倒海之势冲锋。', difficulty: 6 },
      { word: '跌宕起伏', pinyin: 'diē dàng qǐ fú', sentence: '故事情节跌宕起伏，引人入胜。', difficulty: 6 },
      { word: '沧桑', pinyin: 'cāng sāng', sentence: '他脸上写满了岁月的沧桑。', difficulty: 6 },
      { word: '崇高', pinyin: 'chóng gāo', sentence: '老师的职业是崇高的。', difficulty: 5 },
      { word: '睿智', pinyin: 'ruì zhì', sentence: '睿智的将领看穿了敌人的计谋。', difficulty: 6 },
      { word: '挺拔', pinyin: 'tǐng bá', sentence: '白杨树挺拔地站在路边。', difficulty: 5 },
      { word: '磅礴', pinyin: 'páng bó', sentence: '黄河以磅礴的气势奔向大海。', difficulty: 6 },
      { word: '肃穆', pinyin: 'sù mù', sentence: '烈士陵园里气氛肃穆庄严。', difficulty: 6 },
      { word: '叱咤风云', pinyin: 'chì zhà fēng yún', sentence: '叱咤风云的人物已成历史。', difficulty: 6 },
    ],
    semester2: [
      { word: '惊涛骇浪', pinyin: 'jīng tāo hài làng', sentence: '航海者穿越了惊涛骇浪。', difficulty: 6 },
      { word: '饱经风霜', pinyin: 'bǎo jīng fēng shuāng', sentence: '饱经风霜的老人目光坚定。', difficulty: 6 },
      { word: '苍劲', pinyin: 'cāng jìng', sentence: '百年老松苍劲挺拔。', difficulty: 6 },
      { word: '迷惘', pinyin: 'mí wǎng', sentence: '少年时期常有一些迷惘。', difficulty: 6 },
      { word: '凝望', pinyin: 'níng wàng', sentence: '他静静地凝望着远方。', difficulty: 5 },
      { word: '蹉跎', pinyin: 'cuō tuó', sentence: '不要再蹉跎岁月了。', difficulty: 6 },
      { word: '无怨无悔', pinyin: 'wú yuàn wú huǐ', sentence: '他为教育事业奉献，无怨无悔。', difficulty: 6 },
      { word: '豁达', pinyin: 'huò dá', sentence: '老人豁达乐观，笑对人生。', difficulty: 6 },
      { word: '砥砺', pinyin: 'dǐ lì', sentence: '磨难砥砺了他坚强的意志。', difficulty: 6 },
      { word: '铭记', pinyin: 'míng jì', sentence: '历史的教训要铭记于心。', difficulty: 5 },
    ]
  }
};

// ── 内置例句模板（用于AI生成兜底）──
const SENTENCE_TEMPLATES = [
  '{word}在我们生活中非常重要。',
  '他用{word}的方式解决了问题。',
  '春天来了，{word}的景色令人陶醉。',
  '我们应该学习{word}的精神。',
  '看到这幅画面，我感到{word}。',
  '这件事让大家都感到{word}。',
  '书中有一段关于{word}的描写。',
  '老师告诉我们，{word}是一种重要的品质。',
];

// ── 获取指定年级词库 ──
function getGradeWords(grade, semester = 'all', count = 10, shuffle = true) {
  const gradeData = WORD_BANK[grade];
  if (!gradeData) return [];

  let words = [];
  if (semester === 'all' || semester === '1') {
    words = words.concat(gradeData.semester1 || []);
  }
  if (semester === 'all' || semester === '2') {
    words = words.concat(gradeData.semester2 || []);
  }

  if (shuffle) {
    words = words.sort(() => Math.random() - 0.5);
  }

  return words.slice(0, Math.min(count, words.length));
}

// ── 混合年级出题 ──
function getMixedWords(grades, count = 10, shuffle = true) {
  let words = [];
  grades.forEach(grade => {
    const gradeData = WORD_BANK[grade];
    if (gradeData) {
      words = words.concat(gradeData.semester1 || [], gradeData.semester2 || []);
    }
  });
  if (shuffle) words = words.sort(() => Math.random() - 0.5);
  return words.slice(0, count);
}

// ── 按难度筛选 ──
function getWordsByDifficulty(maxDifficulty = 3, count = 10) {
  let words = [];
  Object.values(WORD_BANK).forEach(gradeData => {
    const allWords = [...(gradeData.semester1 || []), ...(gradeData.semester2 || [])];
    words = words.concat(allWords.filter(w => w.difficulty <= maxDifficulty));
  });
  words = words.sort(() => Math.random() - 0.5);
  return words.slice(0, count);
}

// ── 自定义词语转换（无例句时生成模板句）──
function buildCustomWord(wordStr) {
  const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
  return {
    word: wordStr.trim(),
    pinyin: '',
    sentence: template.replace('{word}', wordStr.trim()),
    difficulty: 3,
    custom: true
  };
}

// ── 统计 ──
function getBankStats() {
  let total = 0;
  const gradeStats = {};
  Object.entries(WORD_BANK).forEach(([key, val]) => {
    const cnt = (val.semester1?.length || 0) + (val.semester2?.length || 0);
    gradeStats[key] = cnt;
    total += cnt;
  });
  return { total, gradeStats };
}
