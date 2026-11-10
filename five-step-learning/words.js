const demoWords = [
  {
    word: 'watch', us: '/wɑːtʃ/', uk: '/wɒtʃ/', meaning: '观看',
    choices: ['观看', '打开', '练习'], letters: ['t', 'a', 'h', 'w', 'c'],
    senses: [
      ['动词', [['观看', '持续看正在发生或变化的事。'], ['留意、观察', '注意某人或某事的变化。'], ['看护、照看', '暂时负责照顾某人或看管物品。'], ['当心、注意', '提醒别人留意脚下、行为或危险。']]],
      ['名词', [['手表', '戴在手腕上看时间的物品。'], ['值班、警戒', '持续看守或负责警戒的一段时间。']]]
    ],
    forms: [['watch', '动词原形'], ['watches', '第三人称单数'], ['watched', '过去式、过去分词'], ['watching', '现在分词、动名词'], ['watches', '名词复数']],
    pairs: [['watch TV', '看电视'], ['watch a match', '观看比赛'], ['watch over', '看护、守护'], ['watch out', '当心'], ['look at your watch', '看一下手表']],
    base: '把 watch 当作一个完整词基记，核心画面是「持续留意」。看比赛时留意场上变化，值班时留意周围情况。',
    family: [['watch + -er', 'watcher', '观看者、观察者'], ['watch + dog', 'watchdog', '看门狗、监督者']],
    examples: [['We watch birds by the lake.', '我们在湖边观察小鸟。', '动词 · 观察'], ['Can you watch my bag for a minute?', '你能帮我看一下包吗？', '动词 · 看管'], ['My watch is five minutes fast.', '我的手表快了五分钟。', '名词 · 手表']]
  },
  {
    word: 'work', us: '/wɝːk/', uk: '/wɜːk/', meaning: '工作',
    choices: ['玩耍', '工作', '观看'], letters: ['r', 'k', 'w', 'o'],
    senses: [
      ['动词', [['工作、劳动', '从事职业或投入精力做某事。'], ['运转', '设备或装置能够正常使用。'], ['奏效', '方法产生预期的结果。'], ['加工、操作', '用工具或双手处理材料。']]],
      ['名词', [['工作、任务', '需要付出时间和精力的事情，常用作不可数名词。'], ['作品', '文学、音乐或艺术创作，可数。'], ['工作地点', '在 at work、go to work 等表达中指工作场所。']]]
    ],
    forms: [['work', '动词原形'], ['works', '第三人称单数'], ['worked', '过去式、过去分词'], ['working', '现在分词、动名词'], ['works', '名词复数，用于「作品」等可数义项']],
    pairs: [['work hard', '努力工作'], ['work on', '着手做、改进'], ['go to work', '去上班'], ['at work', '在上班'], ['a work of art', '一件艺术作品']],
    base: '把 work 当作完整词基记。人投入精力叫 work，机器能正常发挥作用也叫 work。',
    family: [['work + -er', 'worker', '工人、工作者'], ['home + work', 'homework', '家庭作业'], ['work + place', 'workplace', '工作场所']],
    examples: [['My parents work near our school.', '我爸妈在我们学校附近工作。', '动词 · 工作'], ['The old radio still works.', '这台旧收音机还能用。', '动词 · 运转'], ['This painting is her best work.', '这幅画是她最好的作品。', '名词 · 作品']]
  },
  {
    word: 'clean', us: '/kliːn/', uk: '/kliːn/', meaning: '打扫',
    choices: ['阅读', '打扫', '散步'], letters: ['e', 'n', 'c', 'a', 'l'],
    senses: [
      ['动词', [['打扫、清洁', '清除污渍、灰尘或垃圾。']]],
      ['形容词', [['干净的', '没有污垢或杂物。'], ['清洁的', '污染较少或没有污染。']]],
      ['副词', [['完全地', '在 clean off 等表达中可以加强语气。']]]
    ],
    forms: [['clean', '动词原形、形容词原级'], ['cleans', '第三人称单数'], ['cleaned', '过去式、过去分词'], ['cleaning', '现在分词、动名词'], ['cleaner', '形容词比较级'], ['cleanest', '形容词最高级']],
    pairs: [['clean the room', '打扫房间'], ['clean up', '收拾干净'], ['clean water', '干净的水'], ['keep it clean', '保持干净']],
    base: 'clean 是完整词基。从「干净」联想到「让东西变干净」，就能区分形容词和动词用法。',
    family: [['clean + -er', 'cleaner', '清洁工、清洁设备'], ['un- + clean', 'unclean', '不干净的']],
    examples: [['I clean my desk after class.', '下课后我打扫书桌。', '动词 · 打扫'], ['We need clean water.', '我们需要干净的水。', '形容词 · 干净的']]
  },
  {
    word: 'walk', us: '/wɑːk/', uk: '/wɔːk/', meaning: '步行',
    choices: ['观看', '预订', '步行'], letters: ['l', 'w', 'k', 'a'],
    senses: [
      ['动词', [['步行、走路', '用脚从一处走到另一处。'], ['陪同步行', '和别人一起走一段路。'], ['遛', '牵着宠物出去散步。']]],
      ['名词', [['散步', '一次以步行为主的活动。'], ['步行路程', '用走路所需的时间描述距离。']]]
    ],
    forms: [['walk', '动词原形、名词单数'], ['walks', '第三人称单数、名词复数'], ['walked', '过去式、过去分词'], ['walking', '现在分词、动名词']],
    pairs: [['walk to school', '步行去学校'], ['walk the dog', '遛狗'], ['go for a walk', '出去散步'], ['a ten-minute walk', '步行十分钟的路程']],
    base: 'walk 是完整词基。把「一步步走」作为核心画面，同时帮助记住步行和散步两个词性用法。',
    family: [['walk + -er', 'walker', '步行者'], ['walk + way', 'walkway', '步行通道']],
    examples: [['I walk to school with my sister.', '我和姐姐一起走路上学。', '动词 · 步行'], ['Let’s go for a walk after dinner.', '晚饭后我们去散散步吧。', '名词 · 散步']]
  },
  {
    word: 'book', us: '/bʊk/', uk: '/bʊk/', meaning: '书',
    choices: ['手表', '书', '工作'], letters: ['o', 'k', 'b', 'o'],
    senses: [
      ['名词', [['书、书籍', '可阅读的印刷品或电子出版物。'], ['本、册', '装订起来的纸张，例如笔记本或账簿。']]],
      ['动词', [['预订', '提前留好座位、房间或票。'], ['登记警告', '裁判把犯规球员记下来。']]]
    ],
    forms: [['book', '动词原形、名词单数'], ['books', '第三人称单数、名词复数'], ['booked', '过去式、过去分词'], ['booking', '现在分词、动名词']],
    pairs: [['read a book', '读一本书'], ['a picture book', '一本图画书'], ['book a room', '预订房间'], ['book a ticket', '预订一张票']],
    base: 'book 是完整词基。先记看得见的「书」，再用 book a room 记住「预订」这个动词义项。',
    family: [['book + shop', 'bookshop', '书店'], ['book + shelf', 'bookshelf', '书架'], ['book + -ing', 'booking', '预订记录']],
    examples: [['I brought a book to school.', '我带了一本书到学校。', '名词 · 书'], ['Dad will book a room for the trip.', '爸爸会为这次旅行预订一个房间。', '动词 · 预订']]
  }
];
