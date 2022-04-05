export default {
  app: {
    name: 'プライベートスペース',
  },

  thirdPartyApp: {
    browser: 'ブラウザ',
    email: '郵便',
    note: 'メモ',
    album: 'アルバム',
    qq: 'QQ',
    wechat: 'WeChat',
    weixin: 'WeChat',
    douyin: 'TikTok',
    tikTok: 'TikTok',
    kwai: 'Kwai',
    bilibili: 'Bilibili',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
  },

  album: {
    navigation: {
      title: 'アルバム',
    },
    add: {
      title: 'アルバムを作成する',
      msg: 'アルバム名を入力してください',
    },
    defaultName: 'デフォルトのアルバム',
    noData: 'アルバムなし',
  },

  search: {
    cancel: 'キャンセル',
    placeholder: 'アルバム,画像,ビデオの検索',
  },

  quickAction: {
    capture: {
      title: 'クイックキャプチャー',
      shortTitle: 'Capture',
    },
    transfer: {
      title: 'WI-FI転送',
      shortTitle: '相互乗り入れ',
    },
  },

  imageList: {
    navigation: {
      selectBtn: '选择',
      subtitle: {
        image: '{{count}}张照片',
        video: '{{count}}个视频',
      },
    },
    tapHereToChange: '別のアルバムを選択',
    showInfo: '詳細を表示',
    LoadingLabelText: 'インポート中...',
    noData: '画像またはビデオなし',
    save: 'アルバムに保存',
    Saving: '保存',
    saveStatus: {
      success: '已保存到相册',
      fail: '保存到相册失败',
    },
    add: {
      album: '相册',
      doc: '文件',
      camera: '相机',
    },
    moveToAlbum: '移动到相册',
    deleteActionSheet: {
      all: {
        title: '删除全部图片,视频',
      },
      title: '这{{content}}将被删除',
      msg: {
        softDelete: '可到回收站中恢复',
        delete: '此操作不可撤销',
      },
    },
  },

  miniApps: {
    navigation: {
      title: '小工具',
    },
  },

  recycleBin: {
    navigation: {
      title: '回收站',
    },
    tip: '最多保留{{ duration }}天，之后将永久删除,',
    enableTip: '回收站已关闭，可在右上角设置中打开,',
    restore: '恢复到相册',
  },

  recycleBinSetting: {
    navigation: {
      title: '回收站设置',
    },
    enableHeader: '关闭后，删除的文件不可恢复',
    enableTitle: '开启回收站',
    durationHeader: '保留天数',
    day: '天',
  },

  setting: {
    navigation: {
      title: '设置',
    },
    changePass: '修改密码',
    autoLockAuth: '自动开启{{authType}}解锁',
    feedback: '反馈建议',
    language: '语言',
    grade: '给个好评',
    shareApp: '分享给朋友',
    safe: '安全',
    help: '帮助',
    immediate: '立即',
    hapticFeedback: '触觉反馈',
    autoClearOrigin: '导入后提示删除原文件',
    advanced: {
      navigation: {
        title: '高级设置',
      },
      smartSearch: {
        title: '开启智能搜索',
        header: '智能搜索',
      },
    },
  },

  albumCover: {
    navigation: {
      title: '相册封面',
    },
    tab: {
      item: '相册项目',
      system: '内置封面',
    },
  },

  urgent: {
    navigation: {
      title: '紧急切换',
    },
    tableViewHeader: '当手机屏幕朝下时会跳转到以下指定应用',
  },

  autoLock: {
    navigation: {
      title: '自动锁定',
    },
    immediate: '立即',
    tableViewHeader: '切换到其他APP后，超过以下选定到时间间隔后会自动锁定',
  },

  appearance: {
    navigation: {
      title: '外观',
    },
    mode: '外观模式',
    theme: '主题',
    appIcon: '应用图标',
    light: '浅色模式',
    dark: '深色模式',
  },

  langSetting: {
    navigation: {
      title: '语言设置',
    },
  },

  fakePass: {
    navigation: {
      title: '伪装密码',
    },
    enable: '开启',
    header: '开启后将关闭自动{{localAuthText}}识别解锁功能',
    hideAuthBtn: '隐藏解锁界面{{localAuthText}}解锁按钮',
  },

  albumSetting: {
    navigation: {
      title: '相册设置',
    },
    albumName: '相册名称',
    placeholder: '请输入相册名称',
    cover: '相册封面',
    deleteActionSheet: {
      title: '删除相册',
    },
  },

  about: {
    navigation: {
      title: '关于我们',
    },
    changelog: '更新日志',
    private: '隐私政策',
    agreement: '用户协议',
    moreApps: '我的其他应用',
    connect: '联系我们',
    QQgroup: 'QQ反馈群',
    email: '开发者邮箱',
  },

  common: {
    emptyDataText: '現時点ではデータがありません',
    mySpace: 'マイスペース',
    cancel: 'キャンセル',
    confirm: '確認する',
    open: 'オープン',
    close: '閉じる',
    done: '完了',
    language: '言語',
    day: '日',
    hour: '時間',
    minute: '分',
    second: '秒',
    help: 'ヘルプ',
    followSystem: 'フォローシステム',
    auto: '自動',
    faceID: '顔',
    touchID: 'fingerprint',
    create: '作成する',
    modify: 'モディファイ',
    change: 'modify',
    reset: 'リセット',
    select: '選択',
    selectAll: 'すべて選択',
    unselectAll: 'すべてを選択解除する',
    share: '共有',
    delete: '削除',
    deleteAll: 'すべてを削除する',
    move: 'ムーブ',
    copy: 'コピー',
    edit: '編集',
    restore: 'Restore',
    restoreAll: 'Restore All',
    noData: 'データがありません',
    all: 'All',
    enabled: '有効',
    disabled: '無効',
    closed: '閉じた',
    opened: '開かれた',
  },

  permission: {
    camera: '相机',
    microphone: '麦克风',
    faceID: '面容',
    photoLibrary: '相册',
    mediaLibrary: '媒体库',
    motion: '运动',
    unavailable: '{{permission}}功能不可用',
    blocked: '请前往设置授予{{permissions}}权限，才能正常使用该功能',
  },

  passcodeLock: {
    create: '创建{{type}}密码',
    change: '修改{{type}}密码',
    confirm: '确认{{type}}密码',
    verify: '输入密码',
    createErr: '创建密码失败',
    fake: '伪装',
    reset: '重设密码',
  },

  // 文件管理
  fileManage: {
    gallery: '画廊',
    list: '列表',
    ctime: '创建时间',
    mtime: '修改时间',
    size: '大小',
    name: '名称',
    info: {
      name: '文件名',
      type: '类型',
      dime: '尺寸',
      duration: '时长',
      desc: '描述',
    },
    file: {
      type: {
        image: '图片',
        video: '视频',
        album: '相册',
      },
    },
  },

  purchase: {
    navigation: {
      title: '隐私空间高级版',
      subtitle: '完整的 隐私空间 功能体验',
    },
    card: {
      title: '隐私空间高级版',
      desc: '解锁全部特权',
      button: '立即开通',
    },
    tableView: {
      title: '隐私空间 高级版',
    },
    paying: '购买中',
    price: '定价',
    privilege: '高级特权',
    purchased: '已购买',
    subscribed: '已订阅',
    contact: '联系我们',
    declare: '用户确认购买并付款后将记入 Apple 账户,如果您有任何疑问，请',
    rights: {
      wifi: {
        title: 'WI-FI 无线传输',
      },
      search: {
        title: '智能搜索',
      },
      trash: {
        title: '自定义回收站保留时长',
      },
      more: {
        title: '更多功能即将推出...',
      },
    },
    unpayTip: '购买后可使用',
    purchaseState: {
      fail: {
        title: '购买失败',
        canceled: '您已取消购买',
        deferred: '您无权购买，请求家长批准',
        errorCode: '错误代码:',
      },
      restoreFail: {
        title: '恢复购买失败',
        detail: '无购买记录，请购买',
      },
    },
    product: {
      title: '永久会员',
      subTitle: '一次性付费，永久解锁全部功能',
    },
    payButton: {
      title: '购买-{{price}}永久',
    },
    restore: '恢复购买',
    recovering: '恢复中',
  },

  transfer: {
    navigation: {
      title: 'WI-FI 互传',
    },
    tip1: '在您的电脑或其他设备的浏览器中通过输入或扫描二维码打开以下网址,',
    tip2: '必须连接到同一个WI-FI，请勿离开本页面',
    errorTip: '请检查 WI-FI 连接',
    connectFail: '连接失败，请重试！',
    wifiTip: '请打开 WI-FI 后重试',
  },

  createAlbum: {
    dialog: {
      title: '创建相册',
      subtitle: '请输入相册名称',
      albumName: '相册名',
    },
    existAlert: {
      title: '该相册名已存在，请重新输入',
      msg: '相册名称不能相同',
    },
  },

  photoView: {
    toolbar: {
      detail: '详情',
      more: '更多',
      desc: '修改描述',
      rename: '重命名',
      descPlaceholder: '请输入描述',
    },
  },
};
