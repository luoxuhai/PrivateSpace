export default {
  app: {
    name: '隱私空間',
  },

  faceID: {
    msg: '用於解鎖',
  },

  thirdPartyApp: {
    browser: '瀏覽器',
    email: '郵箱',
    note: '備忘錄',
    qq: 'QQ',
    wechat: 'WeChat',
    weixin: 'WeChat',
    douyin: 'TikTok',
    tikTok: 'TikTok',
    kwai: '快手',
    bilibili: 'B站',
    album: '相冊',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
  },

  album: {
    navigation: {
      title: '相冊',
    },
    add: {
      title: '創建相冊',
      msg: '請輸入相冊名稱',
    },
    defaultName: '默認相冊',
    noData: '無相冊',
  },

  search: {
    cancel: '取消',
    placeholder: '搜索相冊、圖片、視頻',
  },

  quickAction: {
    capture: {
      title: '快速拍攝',
      shortTitle: '拍攝',
    },
    transfer: {
      title: 'WI-FI 互傳',
      shortTitle: '互傳',
    },
  },

  imageList: {
    navigation: {
      selectBtn: '選擇',
      subtitle: {
        image: '{{count}}張照片',
        video: '{{count}}個視頻',
      },
    },
    tapHereToChange: '選擇其他相冊',
    showInfo: '查看詳情',
    loadingLabelText: '導入中...',
    noData: '無圖片或視頻',
    save: '保存到相冊',
    saving: '保存中',
    imported: '已導入',
    saveStatus: {
      success: '已保存到相冊',
      fail: '保存到相冊失敗',
    },
    add: {
      album: '相冊',
      doc: '文件',
      camera: '相機',
    },
    moveToAlbum: '移動到相冊',
    deleteActionSheet: {
      all: {
        title: '刪除全部圖片、視頻',
      },
      title: '這{{content}}將被刪除',
      msg: {
        softDelete: '可到回收站中恢復',
        delete: '此操作不可撤銷',
      },
    },
  },

  fileManager: {
    navigation: {
      title: '文件',
    },
    bottomTab: {},
    add: {
      scan: '掃描文檔',
      doc: '導入文件',
      folder: '新建文件夾',
      notSupported: {
        msg: '當前設備不支持此功能',
      },
    },
    folderForm: {
      title: '新建文件夾',
      msg: '請輸入新文件夾名',
    },
    save: '保存到本地',
    deleteActionSheet: {
      title: '這{{count}}個文件將被刪除',
    },
    noData: '無文件',
    items: '項',
    move: {
      text: '移動到此處',
    },
    copy: {
      text: '複製到此處',
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
    tip: '最多保留{{ duration }}天，之後將永久刪除。 ',
    enableTip: '回收站已關閉，可在右上角設置中打開。 ',
    restore: '恢復到相冊',
  },

  recycleBinSetting: {
    navigation: {
      title: '回收站設置',
    },
    enableHeader: '關閉後，刪除的文件不可恢復',
    enableTitle: '開啟回收站',
    durationHeader: '保留天數',
    day: '天',
  },

  setting: {
    navigation: {
      title: '設置',
    },
    changePass: '修改密碼',
    autoLockAuth: '自動開啟{{authType}}解鎖',
    localAuth: '開啟{{authType}}解鎖',
    feedback: '反饋建議',
    language: '語言',
    grade: '給個好評',
    shareApp: '分享給朋友',
    safe: '安全',
    help: '幫助',
    immediate: '立即',
    hapticFeedback: '觸覺反饋',
    autoClearOrigin: '導入後提示刪除原文件',
    advanced: {
      navigation: {
        title: '高級設置',
      },
      smartSearch: {
        title: '開啟智能搜索',
        header: '智能搜索',
      },
      exportData: {
        title: '導出數據',
        album: '導出所有圖片視頻',
        file: '導出所有文件',
        destination: {
          title: '導出圖片視頻到以下位置',
          album: '相冊',
          file: '文件',
        },
      },
    },
  },

  albumCover: {
    navigation: {
      title: '相冊封面',
    },
    tab: {
      item: '相冊項目',
      system: '內置封面',
    },
  },

  urgent: {
    navigation: {
      title: '緊急切換',
    },
    tableViewHeader: '當手機屏幕朝下時會跳轉到以下指定應用',
    uninstall: '未安裝該應用',
    openFail: '無法打開該應用',
  },

  autoLock: {
    navigation: {
      title: '自動鎖定',
    },
    immediate: '立即',
    tableViewHeader: '切換到其他APP後，超過以下選定到時間間隔後會自動鎖定',
  },

  appearance: {
    navigation: {
      title: '外觀',
    },
    mode: '外觀模式',
    theme: '主題',
    light: '淺色模式',
    dark: '深色模式',
    appIcon: {
      title: '應用圖標',
      unsupported: '當前設備不支持更換應用圖標',
    },
  },

  langSetting: {
    navigation: {
      title: '語言設置',
    },
  },

  fakePass: {
    navigation: {
      title: '偽裝密碼',
    },
    enable: '開啟',
    header: '開啟後將關閉自動{{localAuthText}}識別解鎖功能',
    hideAuthBtn: '隱藏解鎖界面{{localAuthText}}解鎖按鈕',
  },

  albumSetting: {
    navigation: {
      title: '相冊設置',
    },
    albumName: '相冊名稱',
    placeholder: '請輸入相冊名稱',
    cover: '相冊封面',
    deleteActionSheet: {
      title: '刪除相冊',
    },
  },

  about: {
    navigation: {
      title: '關於我們',
    },
    changelog: '更新日誌',
    private: '隱私政策',
    agreement: '用戶協議',
    moreApps: '我的其他應用',
    connect: '聯繫我們',
    QQgroup: 'QQ反饋群',
    email: '開發者郵箱',
  },

  common: {
    emptyDataText: '暫無數據',
    mySpace: '我的空間',
    cancel: '取消',
    confirm: '確認',
    open: '打開',
    close: '關閉',
    done: '完成',
    language: '語言',
    day: '天',
    hour: '小時',
    minute: '分鐘',
    second: '秒',
    help: '幫助',
    followSystem: '跟隨系統',
    auto: '自動',
    faceID: '面容',
    touchID: '指紋',
    create: '創建',
    modify: '修改',
    change: '修改',
    reset: '重置',
    select: '選擇',
    selectAll: '全選',
    unselectAll: '取消全選',
    share: '分享',
    delete: '刪除',
    deleteAll: '刪除全部',
    move: '移動',
    copy: '複製',
    edit: '編輯',
    restore: '恢復',
    restoreAll: '恢復全部',
    noData: '無數據',
    all: '全部',
    enabled: '已啟動',
    disabled: '已禁用',
    closed: '已關閉',
    opened: '已打開',
    rename: '重命名',
    back: '返回',
  },

  permission: {
    camera: '相機',
    microphone: '麥克風',
    faceID: '面容',
    photoLibrary: '相冊',
    mediaLibrary: '媒體庫',
    motion: '運動',
    unavailable: '{{permission}}功能不可用',
    blocked: '請前往設置授予{{permissions}}權限，才能正常使用該功能',
  },

  passcodeLock: {
    create: '創建{{type}}密碼',
    change: '修改{{type}}密碼',
    confirm: '確認{{type}}密碼',
    verify: '輸入密碼',
    createErr: '創建密碼失敗',
    fake: '偽裝',
    reset: '重設密碼',
  },

  // 文件管理
  fileManage: {
    gallery: '畫廊',
    list: '列表',
    icons: '圖標',
    ctime: '創建時間',
    mtime: '修改時間',
    size: '大小',
    name: '名稱',
    kind: '',
    info: {
      name: '文件名',
      type: '類型',
      dime: '尺寸',
      duration: '時長',
      desc: '描述',
    },
    file: {
      type: {
        image: '圖片',
        video: '視頻',
        album: '相冊',
      },
    },
  },

  purchase: {
    navigation: {
      title: '隱私空間高級版',
      subtitle: '完整的 隱私空間 功能體驗',
    },
    card: {
      title: '隱私空間高級版',
      desc: '解鎖全部特權',
      button: '立即開通',
    },
    tableView: {
      title: '隱私空間 高級版',
    },
    paying: '購買中',
    price: '定價',
    privilege: '高級特權',
    purchased: '已購買',
    subscribed: '已訂閱',
    contact: '聯繫我們',
    declare: '用戶確認購買並付款後將記入 Apple 賬戶。如果您有任何疑問，請',
    rights: {
      wifi: {
        title: 'WI-FI 無線傳輸',
      },
      search: {
        title: '智能搜索',
      },
      trash: {
        title: '自定義回收站保留時長',
      },
      more: {
        title: '更多功能即將推出...',
      },
      scan: {
        title: '掃描文檔',
      },
      appIcon: {
        title: '更換 App 圖標',
      },
    },
    unpayTip: '購買後可使用',
    purchaseState: {
      fail: {
        title: '購買失敗',
        canceled: '您已取消購買',
        deferred: '您無權購買，請求家長批准',
        errorCode: '錯誤代碼：',
      },
      restoreFail: {
        title: '恢復購買失敗',
        detail: '無購買記錄，請購買',
      },
    },
    product: {
      title: '永久會員',
      subTitle: '一次性付費，永久解鎖全部功能',
    },
    payButton: {
      title: '購買-{{price}}永久',
    },
    restore: '恢復購買',
    recovering: '恢復中',
  },

  transfer: {
    navigation: {
      title: 'WI-FI 互傳',
    },
    tip1: '在您的電腦或其他設備的瀏覽器中通過輸入或掃描二維碼打開以下網址。 ',
    tip2: '必須連接到同一個WI-FI，請勿離開本頁面',
    errorTip: '請檢查 WI-FI 連接',
    connectFail: '連接失敗，請重試！ ',
    wifiTip: '請打開 WI-FI 後重試',
  },

  createAlbum: {
    dialog: {
      title: '創建相冊',
      subtitle: '請輸入相冊名稱',
      albumName: '相冊名',
    },
    existAlert: {
      title: '該相冊名已存在，請重新輸入',
      msg: '相冊名稱不能相同',
    },
  },

  photoView: {
    toolbar: {
      detail: '詳情',
      more: '更多',
      desc: '修改描述',
      rename: '重命名',
      descPlaceholder: '請輸入描述',
    },
  },

  appUpdate: {
    alert: {
      title: '發現新版本(V{{version}})',
      ok: '更新',
      cancel: '取消',
    },
    card: {
      alert: {
        title: '更新提示',
        msg: '安裝包已下載，重啟APP以更新',
        ok: '更新',
      },
      title: '新版本',
    },
  },

  shareExtension: {
    close: '關閉',
    add: '添加',
    addStatus: {
      success: '已添加至默認相冊',
      fail: '添加失敗！ ',
    },
    tip: '添加{{count}}個圖片或視頻到默認相冊',
  },

  player: {
    airplayTip: '正在隔空播放',
  },
};
